// The outside services a lead passes through, Odoo and Gmail, behind one small
// interface so the handlers can be tested without touching either.
import type { ServerConfig } from "./config.ts";
import { logFailure } from "./intake.ts";
import { createGmailTransport, sendMail, type Mail } from "./mailer.ts";
import { createLeadForSales, createOdooClient, type NewLead } from "./odoo.ts";
import { createReportToken } from "./reportLink.ts";
import type { FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";

export type LeadType = "hot" | "warm" | "cold";
export type LeadToSave = Omit<NewLead, "salespersonLogin"> & { leadType?: LeadType };

// So a service that hangs rather than refusing still leaves time to fall back
// before the visitor's browser gives up. Each Odoo call has a limit, and all of a
// request's Odoo calls share a budget. Email keeps its own limit, so a slow Odoo
// can never eat into the time a report needs to send.
const ODOO_CALL_MS = 8_000;
const DEFAULT_LIMITS = { odooBudgetMs: 13_000, mailMs: 10_000 };
// Odoo's clock keeps running during an email, so a late write still needs a fair chance.
const SHORTEST_STEP_MS = 3_000;

/** How long a step may take: its usual limit, or whatever is left of the request's time. */
export function timeBudget(totalMs: number, clock: () => number = Date.now) {
  const startedAt = clock();
  return (stepMs: number) => Math.max(SHORTEST_STEP_MS, Math.min(stepMs, totalMs - (clock() - startedAt)));
}

/** Fails if the work takes longer than this. */
export function within<T>(ms: number, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Took too long")), ms);
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}

// The Hot/Warm/Cold column, added to leads with Odoo Studio.
const LEAD_TYPE_FIELD = "x_studio_lead_type";
// On every new fit check lead until its report has really gone out.
export const REPORT_OWED_TAG = "Report not sent";
export const FIT_CHECK_TAG = "Website: fit check";
export const CONTACT_TAG = "Website: contact form";

export interface CallTask {
  summary: string;
  note: string;
  dueDate: string; // YYYY-MM-DD
}

export interface Booking {
  name: string;
  email: string;
  startTime: string;
  title: string;
}

export interface Services {
  alertTo: string[];
  mailFrom: string;
  alreadyReceived(email: string, reference: string): Promise<boolean>;
  /** The lead whose report still has to be sent, if there is one, and how old it is. */
  reportOwed(email: string, reference: string): Promise<{ id: number; ageMs: number } | null>;
  clearReportOwed(leadId: number): Promise<void>;
  /** Website leads in the last 24 hours: fit checks for this address, and everything in total that got its email. */
  recentLeadCounts(email: string | null): Promise<{ forAddress: number; total: number }>;
  /** The signed part of a report link, or null if links can't be made. */
  reportToken(answers: FitCheckAnswers, now: Date): string | null;
  saveLead(lead: LeadToSave): Promise<number>;
  scheduleCall(leadId: number, task: CallTask): Promise<void>;
  recordBooking(booking: Booking): Promise<void>;
  sendMail(mail: Mail): Promise<void>;
  leadUrl(leadId: number): string;
}

// A repeat send within this long of the first is treated as the same item.
const REPEAT_WINDOW_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const odooTime = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

export function realServices(cfg: ServerConfig, limits = DEFAULT_LIMITS): Services {
  const timeFor = timeBudget(limits.odooBudgetMs);
  const fetchWithLimit: typeof fetch = (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(timeFor(ODOO_CALL_MS)) });
  const odoo = createOdooClient({ url: cfg.ODOO_URL, db: cfg.ODOO_DB, apiKey: cfg.ODOO_API_KEY }, fetchWithLimit);
  const transport = createGmailTransport({ user: cfg.GMAIL_USER, appPassword: cfg.GMAIL_APP_PASSWORD });
  const from = `Kitso Nexus Advisory <${cfg.MAIL_FROM}>`;
  let salespersonId: Promise<number> | undefined;
  const salesperson = () => (salespersonId ??= odoo.findUserIdByLogin(cfg.ODOO_SALESPERSON_LOGIN));

  // One lookup for every tag, instead of one each, remembered for the rest of this request.
  const ids = new Map<string, number>();
  async function tagIds(names: string[]): Promise<number[]> {
    const wanted = [...new Set(names)].filter((name) => !ids.has(name));
    if (wanted.length === 0) return names.map((name) => ids.get(name)!);
    const lookUp = () => odoo.call<{ id: number; name: string }[]>("crm.tag", "search_read", { domain: [["name", "in", wanted]], fields: ["name"] });
    for (const tag of await lookUp()) ids.set(tag.name, tag.id);
    const missing = wanted.filter((name) => !ids.has(name));
    if (missing.length > 0) {
      try {
        const created = await odoo.call<number[]>("crm.tag", "create", { vals_list: missing.map((name) => ({ name })) });
        missing.forEach((name, i) => ids.set(name, created[i]));
      } catch (error) {
        // Two people can reach a new tag at the same moment; the other one will have made it.
        for (const tag of await lookUp()) ids.set(tag.name, tag.id);
        if (missing.some((name) => !ids.has(name))) throw error;
      }
    }
    return names.map((name) => ids.get(name)!);
  }
  const leadClient = { ...odoo, tagIds, findUserIdByLogin: () => salesperson() };

  return {
    alertTo: cfg.ALERT_TO,
    mailFrom: cfg.MAIL_FROM,
    async alreadyReceived(email, reference) {
      const ids = await odoo.call<number[]>("crm.lead", "search", {
        domain: [
          ["email_from", "=", email],
          ["description", "ilike", reference],
          ["create_date", ">=", odooTime(new Date(Date.now() - REPEAT_WINDOW_MS))],
        ],
        limit: 1,
      });
      return ids.length > 0;
    },
    async reportOwed(email, reference) {
      const [lead] = await odoo.call<{ id: number; create_date: string }[]>("crm.lead", "search_read", {
        domain: [
          ["email_from", "=", email],
          ["description", "ilike", reference],
          ["tag_ids.name", "=", REPORT_OWED_TAG],
          ["create_date", ">=", odooTime(new Date(Date.now() - REPEAT_WINDOW_MS))],
        ],
        fields: ["create_date"],
        limit: 1,
      });
      return lead ? { id: lead.id, ageMs: Date.now() - Date.parse(`${lead.create_date.replace(" ", "T")}Z`) } : null;
    },
    async recentLeadCounts(email) {
      const since = ["create_date", ">=", odooTime(new Date(Date.now() - DAY_MS))];
      // A lead still marked never got its email, so it mustn't use up everyone else's day.
      const total = odoo.call<number>("crm.lead", "search_count", { domain: [["tag_ids.name", "in", [FIT_CHECK_TAG, CONTACT_TAG]], ["tag_ids", "not any", [["name", "=", REPORT_OWED_TAG]]], since] });
      const forAddress = email ? odoo.call<number>("crm.lead", "search_count", { domain: [["email_from", "=", email], ["tag_ids.name", "in", [FIT_CHECK_TAG]], since] }) : Promise.resolve(0);
      const [addressCount, totalCount] = await Promise.all([forAddress, total]);
      return { forAddress: addressCount, total: totalCount };
    },
    reportToken(answers, now) {
      const secret = process.env.REPORT_LINK_SECRET;
      if (!secret) console.error("report link left out of the email: REPORT_LINK_SECRET isn't set");
      return secret ? createReportToken(answers, secret, now) : null;
    },
    async clearReportOwed(leadId) {
      const [tagId] = await tagIds([REPORT_OWED_TAG]);
      await odoo.call("crm.lead", "write", { ids: [leadId], vals: { tag_ids: [[3, tagId]] } });
    },
    async saveLead({ leadType, ...lead }) {
      const id = await createLeadForSales(leadClient, { ...lead, salespersonLogin: cfg.ODOO_SALESPERSON_LOGIN });
      if (leadType) {
        // The Hot, Warm or Cold tag is already on the lead, so losing the column isn't worth losing the lead.
        try {
          await odoo.call("crm.lead", "write", { ids: [id], vals: { [LEAD_TYPE_FIELD]: leadType } });
        } catch (error) {
          logFailure("saving the lead type", error);
        }
      }
      return id;
    },
    async scheduleCall(leadId, task) {
      await odoo.call("crm.lead", "activity_schedule", {
        ids: [leadId],
        act_type_xmlid: "mail.mail_activity_data_call",
        date_deadline: task.dueDate,
        summary: task.summary,
        note: task.note,
        user_id: await salesperson(),
      });
    },
    async recordBooking(booking) {
      const [tagId] = await tagIds(["Booked a call"]);
      const found = await odoo.call<number[]>("crm.lead", "search", { domain: [["email_from", "=", booking.email]], order: "id desc", limit: 1 });
      const id =
        found[0] ??
        (await createLeadForSales(leadClient, {
          title: `Booking · ${booking.name}`,
          contactName: booking.name,
          email: booking.email,
          notes: "Booked a call on Cal.com.",
          tags: [],
          salespersonLogin: cfg.ODOO_SALESPERSON_LOGIN,
        }));
      // Three stars puts it at the top of the sales representative's list.
      await odoo.call("crm.lead", "write", { ids: [id], vals: { priority: "3", tag_ids: [[4, tagId]] } });
    },
    async sendMail(mail) {
      await within(limits.mailMs, sendMail(transport, from, mail));
    },
    leadUrl: (id) => `${cfg.ODOO_URL}/web#id=${id}&model=crm.lead&view_type=form`,
  };
}
