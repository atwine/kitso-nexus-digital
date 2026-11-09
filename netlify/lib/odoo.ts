// Talks to Kitso's Odoo through its External API (JSON-2: POST /json/2/<model>/<method>).
// The API key is an RPC-scope key; it is sent as a bearer token and never logged.

export type OdooConfig = { url: string; db: string; apiKey: string };

export class OdooError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Fetch = typeof fetch;

export type OdooClient = ReturnType<typeof createOdooClient>;

export function createOdooClient(config: OdooConfig, fetchImpl: Fetch = fetch) {
  async function call<T>(model: string, method: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetchImpl(`${config.url}/json/2/${model}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${config.apiKey}`,
        "X-Odoo-Database": config.db,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // Odoo's error body can echo request data, so it stays out of the message.
      throw new OdooError(`Odoo ${model}.${method} failed with HTTP ${res.status}`, res.status);
    }
    return (await res.json()) as T;
  }

  return {
    call,
    async findUserIdByLogin(login: string): Promise<number> {
      const ids = await call<number[]>("res.users", "search", { domain: [["login", "=", login]], limit: 1 });
      if (ids.length === 0) throw new OdooError(`No Odoo user with login ${login}`, 404);
      return ids[0];
    },
    async tagIds(names: string[]): Promise<number[]> {
      const ids: number[] = [];
      for (const name of names) {
        const found = await call<number[]>("crm.tag", "search", { domain: [["name", "=", name]], limit: 1 });
        ids.push(found[0] ?? (await call<number[]>("crm.tag", "create", { vals_list: [{ name }] }))[0]);
      }
      return ids;
    },
    async createLead(vals: Record<string, unknown>): Promise<number> {
      const [id] = await call<number[]>("crm.lead", "create", { vals_list: [vals] });
      return id;
    },
    async readLead(id: number, fields: string[]): Promise<Record<string, unknown> | undefined> {
      const [row] = await call<Record<string, unknown>[]>("crm.lead", "read", { ids: [id], fields });
      return row;
    },
    async deleteLeads(ids: number[]): Promise<void> {
      if (ids.length) await call<boolean>("crm.lead", "unlink", { ids });
    },
  };
}

export type NewLead = {
  title: string;
  contactName: string;
  email: string;
  phone?: string;
  company?: string;
  /** Plain text; each line becomes a paragraph in Odoo's notes. */
  notes: string;
  tags: string[];
  salespersonLogin: string;
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Odoo stores lead notes as HTML, so visitor text is escaped before it goes in. */
export function notesToHtml(notes: string): string {
  return notes
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

/** Creates one lead assigned to the sales person, with its tags. Returns the lead id. */
export async function createLeadForSales(client: OdooClient, lead: NewLead): Promise<number> {
  const [userId, tagIds] = await Promise.all([client.findUserIdByLogin(lead.salespersonLogin), client.tagIds(lead.tags)]);
  return client.createLead({
    type: "lead",
    name: lead.title,
    contact_name: lead.contactName,
    email_from: lead.email,
    phone: lead.phone || false,
    partner_name: lead.company || false,
    description: notesToHtml(lead.notes),
    user_id: userId,
    tag_ids: [[6, 0, tagIds]],
  });
}
