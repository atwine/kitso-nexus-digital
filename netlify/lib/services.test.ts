// The layer that speaks Odoo's language, driven against a fake Odoo so the real
// requests can be checked.
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ServerConfig } from "./config.ts";
import { sendMail } from "./mailer.ts";
import { realServices, timeBudget } from "./services.ts";

vi.mock("./mailer.ts", async (original) => ({ ...(await original<typeof import("./mailer.ts")>()), createGmailTransport: () => ({}), sendMail: vi.fn() }));

const cfg = {
  ODOO_URL: "https://odoo.example",
  ODOO_DB: "kitso",
  ODOO_API_KEY: "test-key",
  ODOO_SALESPERSON_LOGIN: "rep@example.co.bw",
  GMAIL_USER: "sender@example.co.bw",
  GMAIL_APP_PASSWORD: "test password",
  MAIL_FROM: "info@example.co.bw",
  ALERT_TO: ["info@example.co.bw"],
} as ServerConfig;

type Handler = unknown | ((body: Record<string, unknown>) => unknown);

function fakeOdoo(handlers: Record<string, Handler>) {
  const calls: { route: string; body: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const route = /\/json\/2\/(.+)$/.exec(String(url))![1];
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      calls.push({ route, body });
      const handler = handlers[route];
      const value = typeof handler === "function" ? (handler as (b: Record<string, unknown>) => unknown)(body) : handler;
      return value instanceof Error ? new Response("{}", { status: 400 }) : Response.json(value ?? []);
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

const lead = { title: "t", contactName: "c", email: "e@example.co.bw", notes: "n", tags: ["Website: fit check", "Hot", "Engineering"], leadType: "hot" as const };
const count = (calls: { route: string }[], route: string) => calls.filter((c) => c.route === route).length;

describe("saving a lead", () => {
  const usual = { "res.users/search": [5], "crm.lead/create": [41], "crm.lead/write": true };

  it("looks up all its tags in one request and creates only the missing ones", async () => {
    const calls = fakeOdoo({
      ...usual,
      "crm.tag/search_read": [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }],
      "crm.tag/create": [3],
    });
    expect(await realServices(cfg).saveLead(lead)).toBe(41);
    expect(count(calls, "crm.tag/search_read")).toBe(1);
    expect(calls.find((c) => c.route === "crm.tag/create")?.body.vals_list).toEqual([{ name: "Engineering" }]);
    const vals = (calls.find((c) => c.route === "crm.lead/create")?.body.vals_list as { tag_ids: unknown[] }[])[0];
    expect(vals.tag_ids).toEqual([[6, 0, [1, 2, 3]]]);
  });

  it("makes no create call when every tag exists", async () => {
    const calls = fakeOdoo({ ...usual, "crm.tag/search_read": [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }, { id: 3, name: "Engineering" }] });
    await realServices(cfg).saveLead(lead);
    expect(count(calls, "crm.tag/create")).toBe(0);
  });

  it("if someone else just created the same tag, looks again instead of losing the lead", async () => {
    let searches = 0;
    const calls = fakeOdoo({
      ...usual,
      "crm.tag/search_read": () => (++searches === 1 ? [] : [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }, { id: 3, name: "Engineering" }]),
      "crm.tag/create": new Error("duplicate"),
    });
    expect(await realServices(cfg).saveLead(lead)).toBe(41);
    expect(count(calls, "crm.tag/search_read")).toBe(2);
  });

  it("looks the salesperson up once per request", async () => {
    const calls = fakeOdoo({ ...usual, "crm.tag/search_read": [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }, { id: 3, name: "Engineering" }], "crm.lead/activity_schedule": true });
    const services = realServices(cfg);
    await services.saveLead(lead);
    await services.scheduleCall(41, { summary: "s", note: "n", dueDate: "2026-11-10" });
    expect(count(calls, "res.users/search")).toBe(1);
    expect(calls.find((c) => c.route === "crm.lead/activity_schedule")?.body.user_id).toBe(5);
  });

  it("still saves the lead if the Lead type column can't be written", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fakeOdoo({ ...usual, "crm.lead/write": new Error("no field"), "crm.tag/search_read": [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }, { id: 3, name: "Engineering" }] });
    expect(await realServices(cfg).saveLead(lead)).toBe(41);
  });
});

describe("the searches behind the rules", () => {
  it("counts leads per address and in total over the last 24 hours, for website leads only", async () => {
    const calls = fakeOdoo({ "crm.lead/search_count": (b: Record<string, unknown>) => (JSON.stringify(b.domain).includes("email_from") ? 2 : 50) });
    expect(await realServices(cfg).recentLeadCounts("e@example.co.bw")).toEqual({ forAddress: 2, total: 50 });
    const domains = calls.map((c) => JSON.stringify(c.body.domain));
    expect(domains.some((d) => d.includes('"email_from","=","e@example.co.bw"'))).toBe(true);
    for (const d of domains) {
      expect(d).toContain('"create_date",">="');
      expect(d).toContain('"tag_ids.name","in"');
    }
  });

  it("a lead whose report was never sent doesn't use up the day's total", async () => {
    const calls = fakeOdoo({ "crm.lead/search_count": 1 });
    await realServices(cfg).recentLeadCounts("e@example.co.bw");
    const domains = calls.map((c) => JSON.stringify(c.body.domain));
    expect(domains.find((d) => !d.includes("email_from"))).toContain('["tag_ids","not any",[["name","=","Report not sent"]]]');
    expect(domains.find((d) => d.includes("email_from"))).not.toContain("not any");
  });

  it("a note counts only towards the total", async () => {
    const calls = fakeOdoo({ "crm.lead/search_count": 7 });
    expect(await realServices(cfg).recentLeadCounts(null)).toEqual({ forAddress: 0, total: 7 });
    expect(calls).toHaveLength(1);
  });

  it("finds a missed report only among recent leads with the mark, and says how old the lead is", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-09T10:00:30Z") });
    const calls = fakeOdoo({ "crm.lead/search_read": [{ id: 9, create_date: "2026-11-09 10:00:00" }] });
    expect(await realServices(cfg).reportOwed("e@example.co.bw", "Reference: abc")).toEqual({ id: 9, ageMs: 30_000 });
    vi.useRealTimers();
    const domain = JSON.stringify(calls[0].body.domain);
    expect(domain).toContain('"tag_ids.name","=","Report not sent"');
    expect(domain).toContain('"create_date",">="');
  });

  it("a tag looked up once isn't looked up again in the same request", async () => {
    const calls = fakeOdoo({ "res.users/search": [5], "crm.lead/create": [41], "crm.lead/write": true, "crm.tag/search_read": [{ id: 1, name: "Website: fit check" }, { id: 2, name: "Hot" }, { id: 3, name: "Engineering" }, { id: 8, name: "Report not sent" }] });
    const services = realServices(cfg);
    await services.saveLead({ ...lead, tags: [...lead.tags, "Report not sent"] });
    await services.clearReportOwed(41);
    expect(count(calls, "crm.tag/search_read")).toBe(1);
  });

  it("clearing the mark unlinks the tag and never deletes it", async () => {
    const calls = fakeOdoo({ "crm.tag/search_read": [{ id: 8, name: "Report not sent" }], "crm.lead/write": true });
    await realServices(cfg).clearReportOwed(9);
    expect(calls.find((c) => c.route === "crm.lead/write")?.body).toEqual({ ids: [9], vals: { tag_ids: [[3, 8]] } });
  });
});

describe("the time an email gets", () => {
  const mail = { to: ["someone@example.co.bw"], subject: "s", text: "t" };
  const slowSend = (ms: number) => vi.mocked(sendMail).mockImplementation(() => new Promise<string>((done) => setTimeout(() => done("sent"), ms)));
  afterEach(() => vi.useRealTimers());

  it("keeps its full limit however long Odoo has already taken", async () => {
    vi.useFakeTimers();
    slowSend(9_000);
    const services = realServices(cfg);
    vi.advanceTimersByTime(30_000);
    const outcome = services.sendMail(mail).then(() => "sent", () => "gave up");
    await vi.advanceTimersByTimeAsync(9_500);
    expect(await outcome).toBe("sent");
  });

  it("still gives up on an email that hangs", async () => {
    vi.useFakeTimers();
    slowSend(60_000);
    const outcome = realServices(cfg).sendMail(mail).then(() => "sent", () => "gave up");
    await vi.advanceTimersByTimeAsync(10_500);
    expect(await outcome).toBe("gave up");
  });
});

describe("the time budget for one request", () => {
  it("gives a step its usual limit while there's plenty left", () => {
    const left = timeBudget(20_000, () => 1_000);
    expect(left(8_000)).toBe(8_000);
  });

  it("shrinks as the request uses its time", () => {
    let now = 0;
    const left = timeBudget(20_000, () => now);
    now = 15_000;
    expect(left(8_000)).toBe(5_000);
  });

  it("always leaves a moment to try", () => {
    let now = 0;
    const left = timeBudget(20_000, () => now);
    now = 60_000;
    expect(left(8_000)).toBe(3_000);
  });
});
