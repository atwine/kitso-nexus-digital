// Proof that the rules in ACCESS.md hold. One case per "this kind of caller tries
// this route", with the answer ACCESS.md says it should get. The last test fails
// when a route exists with no rules, so a new route can't ship undecided.
import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCalBooking } from "./lib/bookingLead.ts";
import { handleContact } from "./lib/contactLead.ts";
import { handleCount, type CountStore } from "./lib/counts.ts";
import { handleFitCheck } from "./lib/fitCheckLead.ts";
import { createReportToken, handleReport } from "./lib/reportLink.ts";
import type { Services } from "./lib/services.ts";
import { fitCheckAnswers } from "../src/lib/fitCheck/questions.ts";

const SITE = "https://www.kitsonexus.com";
const SECRET = "test-webhook-secret";

function fakeServices(overrides: Partial<Services> = {}) {
  const saved: Parameters<Services["saveLead"]>[0][] = [];
  const mail: Parameters<Services["sendMail"]>[0][] = [];
  const calls: Parameters<Services["scheduleCall"]>[1][] = [];
  const bookings: Parameters<Services["recordBooking"]>[0][] = [];
  const services: Services = {
    alertTo: ["info@kitsonexus.com"],
    mailFrom: "info@kitsonexus.com",
    alreadyReceived: async () => false,
    reportOwed: async () => null,
    clearReportOwed: async () => {},
    recentLeadCounts: async () => ({ forAddress: 1, total: 1 }),
    reportToken: () => "signed-token",
    saveLead: async (lead) => {
      saved.push(lead);
      return 41;
    },
    scheduleCall: async (_id, task) => {
      calls.push(task);
    },
    recordBooking: async (booking) => {
      bookings.push(booking);
    },
    sendMail: async (m) => {
      mail.push(m);
    },
    leadUrl: (id) => `https://odoo.example/lead/${id}`,
    ...overrides,
  };
  return { services, saved, mail, calls, bookings };
}

const NOTE = { name: "Neo Test", email: "neo@example.co.bw", company: "Neo Works", message: "Please call me about stock.", website: "" };

const STRONG_ANSWERS = {
  businessTypes: ["engineering"],
  teamSize: "21-50",
  cipa: "yes",
  mainTools: ["spreadsheets", "whatsapp", "pastel-sage"],
  decider: "me",
  timing: "3-months",
  enquiries: "10-30",
  goneCold: "a-few",
  typicalSale: 80000,
  yearlySales: "10m-50m",
  daysToPay: "60-90",
  invoiceMistakes: "sometimes",
  adminPeople: "2-3",
  adminHours: "5-10",
  appCount: "4-6",
  stockValue: "500k-2m",
  stockProblems: "monthly",
  reportTime: "week",
  reportConfidence: "fairly",
};

const FIT_CHECK = {
  answers: STRONG_ANSWERS,
  details: { firstName: "Kgosi", businessName: "Kgosi Engineering", email: "kgosi@example.co.bw", whatsapp: "71 234 567", joinCommunity: false, emailTips: false },
  source: "flyer",
  website: "",
};

const visitorPost = (route: string, body: unknown, origin: string | null = SITE) =>
  new Request(`${SITE}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) },
    body: JSON.stringify(body),
  });

const BOOKING = JSON.stringify({
  triggerEvent: "BOOKING_CREATED",
  createdAt: "2026-11-09T10:00:00.000Z",
  payload: { title: "20 min Free Consultation", startTime: "2026-11-30T12:00:00.000Z", attendees: [{ name: "Neo Test", email: "neo@example.co.bw" }], responses: {} },
});
const signed = (body: string, secret = SECRET) => createHmac("sha256", secret).update(body).digest("hex");
const calPost = (signature: string | null, body = BOOKING) =>
  new Request(`${SITE}/api/cal-booking`, { method: "POST", headers: { "Content-Type": "application/json", ...(signature ? { "x-cal-signature-256": signature } : {}) }, body });

const handlers = {
  "/api/contact": { handle: (r: Request, s: Services) => handleContact(r, s), good: NOTE },
  "/api/fit-check": { handle: (r: Request, s: Services) => handleFitCheck(r, s), good: FIT_CHECK },
} as const;
const visitorRoutes = Object.keys(handlers) as (keyof typeof handlers)[];

describe.each(visitorRoutes)("%s", (route) => {
  const { handle, good } = handlers[route];

  it("anonymous: can send in a new item (grid: create(new))", async () => {
    const f = fakeServices();
    const res = await handle(visitorPost(route, good), f.services);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.saved).toHaveLength(1);
  });

  it("other-website: refused, and nothing is saved (grid: -)", async () => {
    const f = fakeServices();
    const res = await handle(visitorPost(route, good, "https://evil.example"), f.services);
    expect(res.status).toBe(403);
    expect(f.saved).toHaveLength(0);
    expect(f.mail).toHaveLength(0);
  });

  it("a request with no site address at all is refused", async () => {
    const f = fakeServices();
    expect((await handle(visitorPost(route, good, null), f.services)).status).toBe(403);
    expect(f.saved).toHaveLength(0);
  });

  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s can't read or change anything: no route reads a lead", async (method) => {
    const f = fakeServices();
    const res = await handle(new Request(`${SITE}${route}`, { method, headers: { Origin: SITE } }), f.services);
    expect(res.status).toBe(405);
    expect(f.saved).toHaveLength(0);
  });

  it("fields the form doesn't show are refused", async () => {
    for (const extra of [{ verdict: "strong-fit" }, { temperature: "hot" }, { salespersonLogin: "x@y.co" }, { tags: ["Hot"] }]) {
      const f = fakeServices();
      expect((await handle(visitorPost(route, { ...good, ...extra }), f.services)).status).toBe(400);
      expect(f.saved).toHaveLength(0);
    }
  });

  it("the spam trap: says ok, saves and sends nothing", async () => {
    const f = fakeServices();
    const res = await handle(visitorPost(route, { ...good, website: "http://spam.example" }), f.services);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.saved).toHaveLength(0);
    expect(f.mail).toHaveLength(0);
  });

  it("refuses something that isn't JSON, or is far too big", async () => {
    const f = fakeServices();
    const plain = new Request(`${SITE}${route}`, { method: "POST", headers: { "Content-Type": "text/plain", Origin: SITE }, body: JSON.stringify(good) });
    expect((await handle(plain, f.services)).status).toBe(415);
    const big = visitorPost(route, { ...good, padding: "x".repeat(70_000) });
    expect((await handle(big, f.services)).status).toBe(413);
    expect(f.saved).toHaveLength(0);
  });

  it("the same item sent twice is saved once, and nothing is emailed again", async () => {
    const f = fakeServices({ alreadyReceived: async () => true });
    const res = await handle(visitorPost(route, good), f.services);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.saved).toHaveLength(0);
    expect(f.mail).toHaveLength(0);
  });

  it("logs never hold a visitor's details when something fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const f = fakeServices({
      saveLead: async () => {
        throw new Error("Odoo said no about neo@example.co.bw kgosi@example.co.bw");
      },
      sendMail: async () => {
        throw new Error("Mail failed for neo@example.co.bw kgosi@example.co.bw");
      },
    });
    await handle(visitorPost(route, good), f.services);
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).not.toMatch(/example\.co\.bw|Neo|Kgosi/);
  });
});

describe("/api/cal-booking", () => {
  const OLD = process.env.CAL_WEBHOOK_SECRET;
  afterEach(() => {
    process.env.CAL_WEBHOOK_SECRET = OLD;
  });

  it("cal-com: a correctly signed booking is recorded (grid: create(new))", async () => {
    const f = fakeServices();
    const res = await handleCalBooking(calPost(signed(BOOKING)), f.services, SECRET);
    expect(res.status).toBe(200);
    expect(f.bookings).toHaveLength(1);
    expect(f.bookings[0].email).toBe("neo@example.co.bw");
  });

  it("cal-com: the attendee's address is matched in small letters, like the forms save it", async () => {
    const f = fakeServices();
    const body = BOOKING.replace("neo@example.co.bw", "Neo@Example.co.bw");
    await handleCalBooking(calPost(signed(body), body), f.services, SECRET);
    expect(f.bookings[0].email).toBe("neo@example.co.bw");
  });

  it("cal-com: a name with hidden characters or line breaks is cleaned before it reaches Odoo", async () => {
    const f = fakeServices();
    const body = BOOKING.replace('"Neo Test"', JSON.stringify("Neo\r\nBcc: x@evil.com\u202E"));
    await handleCalBooking(calPost(signed(body), body), f.services, SECRET);
    expect(f.bookings[0].name).toBe("Neo Bcc: x@evil.com");
  });

  it("anonymous: no signature is refused (grid: -)", async () => {
    const f = fakeServices();
    expect((await handleCalBooking(calPost(null), f.services, SECRET)).status).toBe(401);
    expect(f.bookings).toHaveLength(0);
  });

  it("other-website or anyone guessing: a wrong signature is refused (grid: -)", async () => {
    const f = fakeServices();
    expect((await handleCalBooking(calPost(signed(BOOKING, "wrong")), f.services, SECRET)).status).toBe(401);
    expect(f.bookings).toHaveLength(0);
  });

  it("a signature for different content is refused", async () => {
    const f = fakeServices();
    const changed = BOOKING.replace("neo@", "other@");
    expect((await handleCalBooking(calPost(signed(BOOKING), changed), f.services, SECRET)).status).toBe(401);
    expect(f.bookings).toHaveLength(0);
  });

  it("refuses everything if the secret isn't set", async () => {
    const f = fakeServices();
    expect((await handleCalBooking(calPost(signed(BOOKING, "")), f.services, undefined)).status).toBe(401);
    expect(f.bookings).toHaveLength(0);
  });

  it.each(["GET", "PUT", "DELETE"])("%s is refused", async (method) => {
    const f = fakeServices();
    expect((await handleCalBooking(new Request(`${SITE}/api/cal-booking`, { method }), f.services, SECRET)).status).toBe(405);
  });
});

describe("/api/report", () => {
  const NOW = new Date("2026-11-09T10:00:00.000Z");
  const answers = fitCheckAnswers.parse(STRONG_ANSWERS);
  const token = createReportToken(answers, SECRET, NOW);
  const ask = (body: unknown, origin: string | null = SITE) => visitorPost("/api/report", body, origin);
  const refused = async (body: unknown, secret: string | undefined = SECRET, now = NOW) => {
    const res = await handleReport(ask(body), secret, now);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false });
  };
  const flipFirstChar = (s: string) => (s[0] === "A" ? "B" : "A") + s.slice(1);

  it("anonymous with a real link: sees that report's answers (grid: view(valid link))", async () => {
    const res = await handleReport(ask({ token }), SECRET, NOW);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; answers: unknown; issuedAt: string };
    expect(body.ok).toBe(true);
    expect(body.answers).toEqual(answers);
    expect(body.issuedAt).toBe("2026-11-09T10:00:00.000Z");
  });

  it("a link still works just before 6 months", async () => {
    expect((await handleReport(ask({ token }), SECRET, new Date("2027-05-10T09:00:00.000Z"))).status).toBe(200);
  });

  it("a link past 6 months is refused", () => refused({ token }, SECRET, new Date("2027-05-11T11:00:00.000Z")));

  it("an edited link is refused: changed answers", async () => {
    const [body, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    payload.a.yearlySales = "over-50m";
    await refused({ token: `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}` });
  });

  it("an edited link is refused: changed signature", () => {
    const [body, signature] = token.split(".");
    return refused({ token: `${body}.${flipFirstChar(signature)}` });
  });

  it("a link pushed forward in time by editing its date is refused", async () => {
    const [body, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    payload.i += 365 * 24 * 60 * 60;
    await refused({ token: `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}` }, SECRET, new Date("2027-11-09T10:00:00.000Z"));
  });

  it.each(["", "nonsense", "a.b", "a.b.c", "x".repeat(20_000)])("a made-up link is refused: %s", (made) => refused({ token: made }));

  it("a link signed with another secret is refused", () => refused({ token: createReportToken(answers, "another-secret", NOW) }));

  it("refuses everything if the secret isn't set", async () => {
    expect((await handleReport(ask({ token }), undefined, NOW)).status).toBe(400);
  });

  it("fields it doesn't expect are refused", () => refused({ token, email: "x@y.co" }));

  it("other-website: refused (grid: -)", async () => {
    expect((await handleReport(ask({ token }, "https://evil.example"), SECRET, NOW)).status).toBe(403);
    expect((await handleReport(ask({ token }, null), SECRET, NOW)).status).toBe(403);
  });

  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s is refused", async (method) => {
    expect((await handleReport(new Request(`${SITE}/api/report`, { method, headers: { Origin: SITE } }), SECRET, NOW)).status).toBe(405);
  });

  it("a link holds answers only: no name, email, phone, or typed-in system name", () => {
    const withSystem = fitCheckAnswers.parse({ ...STRONG_ANSWERS, mainTools: ["other-system"], otherSystem: "Acme Secret System" });
    const inside = Buffer.from(createReportToken(withSystem, SECRET, NOW).split(".")[0], "base64url").toString();
    expect(Object.keys(JSON.parse(inside)).sort()).toEqual(["a", "i"]);
    expect(inside).not.toContain("Acme");
  });

  it("the report email links to the page, with the link after a # so it never reaches server logs", async () => {
    const f = fakeServices({ reportToken: () => "signed-token" });
    await handleFitCheck(visitorPost("/api/fit-check", FIT_CHECK), f.services);
    const report = f.mail.find((m) => m.subject.startsWith("Your fit check report"));
    expect(report?.html).toContain(`${SITE}/fit/report#signed-token`);
    expect(report?.text).toContain(`${SITE}/fit/report#signed-token`);
  });

  it("the emailed link always points at Kitso's own site, whatever address the request came in on", async () => {
    const f = fakeServices({ reportToken: () => "signed-token" });
    const other = "https://attacker.example";
    await handleFitCheck(new Request(`${other}/api/fit-check`, { method: "POST", headers: { "Content-Type": "application/json", Origin: other }, body: JSON.stringify(FIT_CHECK) }), f.services);
    const report = f.mail.find((m) => m.subject.startsWith("Your fit check report"));
    expect(report?.html).toContain(`${SITE}/fit/report#signed-token`);
    expect(report?.html + (report?.text ?? "")).not.toContain("attacker.example");
  });

  it("with no signing secret the report still goes out, just without the link", async () => {
    const f = fakeServices({ reportToken: () => null });
    await handleFitCheck(visitorPost("/api/fit-check", FIT_CHECK), f.services);
    const report = f.mail.find((m) => m.subject.startsWith("Your fit check report"));
    expect(report).toBeDefined();
    expect(report?.html).not.toContain("/fit/report");
  });
});

describe("/api/count", () => {
  const NOW = new Date("2026-11-09T23:30:00.000Z"); // already the 10th in Gaborone
  const fakeStore = () => {
    const added: unknown[][] = [];
    const store: CountStore = { add: async (...args) => void added.push(args), entriesFor: async () => [] };
    return { store, added };
  };
  const ask = (body: unknown, origin: string | null = SITE) => visitorPost("/api/count", body, origin);

  it("anonymous: can add one to a step (grid: create(new))", async () => {
    const f = fakeStore();
    const res = await handleCount(ask({ step: "teamSize", source: "flyer" }), f.store, NOW);
    expect(res.status).toBe(200);
    expect(f.added).toEqual([["2026-11-10", "teamSize", "flyer"]]);
  });

  it("works with no flyer label", async () => {
    const f = fakeStore();
    await handleCount(ask({ step: "opened", source: null }), f.store, NOW);
    expect(f.added).toEqual([["2026-11-10", "opened", null]]);
  });

  it.each([{ step: "madeUp", source: null }, { step: "opened", source: "BAD LABEL!" }, { step: "opened" }, { step: "opened", source: null, name: "Neo" }, { step: "opened", source: null, email: "a@b.co" }])(
    "anything but a fixed step and a tidy label is refused: %j",
    async (body) => {
      const f = fakeStore();
      expect((await handleCount(ask(body), f.store, NOW)).status).toBe(400);
      expect(f.added).toHaveLength(0);
    },
  );

  it("other-website: refused (grid: -)", async () => {
    const f = fakeStore();
    expect((await handleCount(ask({ step: "opened", source: null }, "https://evil.example"), f.store, NOW)).status).toBe(403);
    expect((await handleCount(ask({ step: "opened", source: null }, null), f.store, NOW)).status).toBe(403);
    expect(f.added).toHaveLength(0);
  });

  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s can't read or change counts", async (method) => {
    const f = fakeStore();
    expect((await handleCount(new Request(`${SITE}/api/count`, { method, headers: { Origin: SITE } }), f.store, NOW)).status).toBe(405);
    expect(f.added).toHaveLength(0);
  });

  it("gives nothing back but ok or not", async () => {
    const f = fakeStore();
    expect(await (await handleCount(ask({ step: "opened", source: null }), f.store, NOW)).json()).toEqual({ ok: true });
  });

  it("if storage fails, the visitor's page isn't affected and the log holds no detail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const store: CountStore = { add: async () => { throw new Error("storage says no about flyer"); }, entriesFor: async () => [] };
    expect((await handleCount(ask({ step: "opened", source: "flyer" }), store, NOW)).status).toBe(502);
    expect(JSON.stringify(spy.mock.calls)).not.toContain("flyer");
  });
});

describe("what each person receives", () => {
  it("the report goes only to the address the visitor typed", async () => {
    const f = fakeServices();
    await handleFitCheck(visitorPost("/api/fit-check", FIT_CHECK), f.services);
    const report = f.mail.find((m) => m.subject.startsWith("Your fit check report"));
    expect(report?.to).toEqual(["kgosi@example.co.bw"]);
    expect(report?.cc).toBeUndefined();
  });

  it("the info@ alert holds a fit check summary, with no business figures", async () => {
    const f = fakeServices();
    await handleFitCheck(visitorPost("/api/fit-check", FIT_CHECK), f.services);
    const alert = f.mail.find((m) => m.to.includes("info@kitsonexus.com"));
    expect(alert?.text).toContain("Kgosi");
    expect(alert?.text).toContain("Hot");
    expect(alert?.text).toContain("https://odoo.example/lead/41");
    expect(alert?.text).not.toMatch(/P10 million|80,000|Yearly sales|sales in a year/i);
  });

  it("the info@ alert holds a note in full", async () => {
    const f = fakeServices();
    await handleContact(visitorPost("/api/contact", NOTE), f.services);
    const alert = f.mail.find((m) => m.to.includes("info@kitsonexus.com"));
    expect(alert?.text).toContain("Please call me about stock.");
    expect(alert?.replyTo).toBe("neo@example.co.bw");
  });
});

describe("the route map", () => {
  // The routes this file has rules for. A function with any other route fails below.
  const COVERED = ["/api/contact", "/api/fit-check", "/api/cal-booking", "/api/report", "/api/count"];
  // Timed jobs, which have no address of their own.
  const SCHEDULED = ["daily-counts.ts"];

  it("a timed job has no public address", () => {
    const source = fs.readFileSync(path.join(import.meta.dirname, "functions", "daily-counts.ts"), "utf8");
    expect(source).toMatch(/schedule:/);
    expect(source).not.toMatch(/path:/);
  });

  it("every server function has rules here and in ACCESS.md", () => {
    const dir = path.join(import.meta.dirname, "functions");
    const access = fs.readFileSync(path.join(import.meta.dirname, "..", "ACCESS.md"), "utf8");
    const routes = fs.readdirSync(dir).filter((file) => !SCHEDULED.includes(file)).map((file) => {
      const found = /path:\s*"([^"]+)"/.exec(fs.readFileSync(path.join(dir, file), "utf8"));
      expect(found, `${file} must declare its path`).not.toBeNull();
      return found![1];
    });
    expect(routes.sort()).toEqual([...COVERED].sort());
    for (const route of routes) expect(access).toContain(`| POST | ${route} |`);
  });

  it("the two public forms limit how often one visitor can send (ACCESS.md section 5)", () => {
    for (const file of ["contact.ts", "fit-check.ts"]) {
      expect(fs.readFileSync(path.join(import.meta.dirname, "functions", file), "utf8"), file).toMatch(/rateLimit:\s*\{/);
    }
  });
});
