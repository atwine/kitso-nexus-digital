// @vitest-environment node
import { describe, expect, it } from "vitest";
import { OdooError, createLeadForSales, createOdooClient, notesToHtml } from "./odoo";

type Call = { url: string; headers: Record<string, string>; body: Record<string, unknown> };

/** A fake Odoo that records every request and answers from a table of replies. */
function fakeOdoo(replies: Record<string, unknown>, status = 200) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    calls.push({ url, headers: init.headers as Record<string, string>, body });
    const key = url.replace("https://kitso.odoo.com/json/2/", "") + (body.domain ? ` ${JSON.stringify(body.domain)}` : "");
    return new Response(JSON.stringify(replies[key] ?? replies[url.split("/json/2/")[1]]), { status });
  }) as unknown as typeof fetch;
  const client = createOdooClient({ url: "https://kitso.odoo.com", db: "kitso", apiKey: "k".repeat(40) }, fetchImpl);
  return { client, calls };
}

describe("createLeadForSales", () => {
  it("creates one lead assigned to the sales person, with existing and new tags", async () => {
    const { client, calls } = fakeOdoo({
      'res.users/search [["login","=","sales@kitsonexus.com"]]': [7],
      'crm.tag/search [["name","=","Fit check"]]': [3],
      'crm.tag/search [["name","=","TEST"]]': [],
      "crm.tag/create": [9],
      "crm.lead/create": [41],
    });

    const id = await createLeadForSales(client, {
      title: "Fit check · Tlotlo Auto",
      contactName: "Thabo",
      email: "thabo@example.com",
      phone: "+267 71 234 567",
      company: "Tlotlo Auto Parts & Service",
      notes: "Score 54\nVerdict: Odoo is a strong fit",
      tags: ["Fit check", "TEST"],
      salespersonLogin: "sales@kitsonexus.com",
    });

    expect(id).toBe(41);
    const create = calls.find((c) => c.url.endsWith("/crm.lead/create"))!;
    expect(create.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: `bearer ${"k".repeat(40)}`,
      "X-Odoo-Database": "kitso",
    });
    expect(create.body).toEqual({
      vals_list: [
        {
          type: "lead",
          name: "Fit check · Tlotlo Auto",
          contact_name: "Thabo",
          email_from: "thabo@example.com",
          phone: "+267 71 234 567",
          partner_name: "Tlotlo Auto Parts & Service",
          description: "<p>Score 54</p><p>Verdict: Odoo is a strong fit</p>",
          user_id: 7,
          tag_ids: [[6, 0, [3, 9]]],
        },
      ],
    });
  });

  it("stops if the sales person's login is not in Odoo", async () => {
    const { client } = fakeOdoo({ 'res.users/search [["login","=","nobody"]]': [], "crm.tag/search": [1] });
    await expect(
      createLeadForSales(client, { title: "t", contactName: "c", email: "e@x.com", notes: "", tags: [], salespersonLogin: "nobody" }),
    ).rejects.toThrow("No Odoo user with login nobody");
  });
});

describe("notesToHtml", () => {
  it("escapes visitor text so it cannot add HTML or scripts to Odoo", () => {
    expect(notesToHtml(`<script>alert("x")</script>\nTom & Jerry's`)).toBe(
      "<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p><p>Tom &amp; Jerry&#39;s</p>",
    );
  });
});

describe("Odoo errors", () => {
  it("reports the HTTP status without the API key or Odoo's reply", async () => {
    const { client } = fakeOdoo({ "crm.lead/create": { error: "secret detail" } }, 401);
    const err = await client.createLead({ name: "x" }).catch((e) => e);
    expect(err).toBeInstanceOf(OdooError);
    expect(err.status).toBe(401);
    expect(err.message).toBe("Odoo crm.lead.create failed with HTTP 401");
  });
});
