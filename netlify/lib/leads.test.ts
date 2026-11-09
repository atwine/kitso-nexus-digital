import { describe, expect, it, vi } from "vitest";
import { calculateFitCheck } from "../../src/lib/fitCheck/calculate.ts";
import { fitCheckAnswers, type FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";
import { ConfigError } from "./config.ts";
import { handleContact } from "./contactLead.ts";
import { callTaskFor, handleFitCheck, tagsFor, workingDaysFrom } from "./fitCheckLead.ts";
import { logFailure } from "./intake.ts";
import { reportEmail } from "./report.ts";
import { within, type Services } from "./services.ts";

const SITE = "https://www.kitsonexus.com";
const post = (route: string, body: unknown) => new Request(`${SITE}${route}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: SITE }, body: JSON.stringify(body) });
const NOW = new Date("2026-11-09T10:00:00.000Z"); // a Monday

function fakes(overrides: Partial<Services> = {}) {
  const saved: Parameters<Services["saveLead"]>[0][] = [];
  const mail: Parameters<Services["sendMail"]>[0][] = [];
  const calls: Parameters<Services["scheduleCall"]>[1][] = [];
  const services: Services = {
    alertTo: ["info@kitsonexus.com"],
    mailFrom: "info@kitsonexus.com",
    alreadyReceived: async () => false,
    reportOwed: async () => null,
    clearReportOwed: async () => {},
    recentLeadCounts: async () => ({ forAddress: 1, total: 1 }),
    reportToken: () => "signed-token",
    saveLead: async (l) => (saved.push(l), 7),
    scheduleCall: async (_id, t) => void calls.push(t),
    recordBooking: async () => {},
    sendMail: async (m) => void mail.push(m),
    leadUrl: (id) => `https://odoo.example/${id}`,
    ...overrides,
  };
  return { services, saved, mail, calls };
}
const silentlyFail = () => vi.spyOn(console, "error").mockImplementation(() => {});
const odooDown = async () => {
  throw new Error("down");
};

const strong = {
  businessTypes: ["engineering"], teamSize: "21-50", cipa: "yes", mainTools: ["spreadsheets", "whatsapp", "pastel-sage"], decider: "me", timing: "3-months",
  enquiries: "10-30", goneCold: "a-few", typicalSale: 80000, yearlySales: "10m-50m", daysToPay: "60-90", invoiceMistakes: "sometimes",
  adminPeople: "2-3", adminHours: "5-10", appCount: "4-6", stockValue: "500k-2m", stockProblems: "monthly", reportTime: "week", reportConfidence: "fairly",
};
const trainer = {
  businessTypes: ["professional-services"], teamSize: "1", cipa: "no", mainTools: ["whatsapp", "paper"], decider: "me", enquiries: "10-30", goneCold: "a-few", typicalSale: 2000,
  yearlySales: "under-500k", daysToPay: "under-30", invoiceMistakes: "sometimes", bookings: "under-20", missedBookings: "a-few", bookingValue: 2000,
  adminPeople: "1", adminHours: "2-5", appCount: "2-3", reportTime: "few-days", reportConfidence: "fairly",
};
const details = { firstName: "Kgosi", businessName: "Kgosi Engineering", email: "kgosi@example.co.bw", whatsapp: "+26771234567", joinCommunity: true, emailTips: false };
const submission = (answers: unknown, source: string | null = "flyer") => ({ answers, details, source, website: "" });
const parse = (a: unknown): FitCheckAnswers => fitCheckAnswers.parse(a);

describe("working days", () => {
  it("skips the weekend, in Gaborone's time", () => {
    expect(workingDaysFrom(new Date("2026-11-13T10:00:00Z"), 1)).toBe("2026-11-16"); // Friday to Monday
    expect(workingDaysFrom(new Date("2026-11-11T10:00:00Z"), 3)).toBe("2026-11-16"); // Wednesday, 3 working days
    expect(workingDaysFrom(new Date("2026-11-08T23:00:00Z"), 1)).toBe("2026-11-10"); // already Monday in Gaborone
  });
});

describe("the lead's labels and call task", () => {
  it("a strong, ready engineering firm: labelled, flagged, and a call due the next working day", () => {
    const a = parse(strong);
    const result = calculateFitCheck(a);
    const tags = tagsFor(a, details, result, "flyer");
    expect(tags).toEqual(expect.arrayContaining(["Website: fit check", "Verdict: strong fit", "Hot", "CIPA: registered", "Engineering", "From: flyer", "Wants WhatsApp community"]));
    const task = callTaskFor(result, NOW);
    expect(task?.summary).toMatch(/24 hours/);
    expect(task?.dueDate).toBe("2026-11-10");
  });

  it("someone not yet ready for Odoo gets no call task", () => {
    expect(callTaskFor(calculateFitCheck(parse(trainer)), NOW)).toBeNull();
  });

  it("a warm lead who can't decide: the task says to reach whoever does", () => {
    const result = calculateFitCheck(parse({ ...strong, decider: "someone-else" }));
    const task = callTaskFor(result, NOW);
    expect(task?.note).toMatch(/whoever does/);
    expect(task?.dueDate).toBe("2026-11-12");
    expect(tagsFor(parse({ ...strong, decider: "someone-else" }), details, result, null)).toContain("Not the decision maker");
  });

  it("a custom software lead says so", () => {
    const a = parse({ ...strong, businessTypes: ["manufacturing"], appCount: "1", mainTools: ["other-system"], otherSystem: "SAP", decider: "partner" });
    const result = calculateFitCheck(a);
    expect(result.contactReason).toBe("custom-software");
    expect(callTaskFor(result, NOW)?.note).toMatch(/custom software/i);
    expect(tagsFor(a, details, result, null)).toContain("Custom software lead");
  });

  it("the server works out the verdict: the same answers can't be sent in as something better", async () => {
    const f = fakes();
    await handleFitCheck(post("/api/fit-check", submission(trainer)), f.services, NOW);
    expect(f.saved[0].tags).toEqual(expect.arrayContaining(["Verdict: not yet", "Cold", "CIPA: not registered"]));
    expect(f.calls).toHaveLength(0);
  });

  it("Odoo's notes hold every answer and the figures", async () => {
    const f = fakes();
    await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(f.saved[0].notes).toContain("Roughly what are your sales in a year? P10 million to P50 million");
    expect(f.saved[0].notes).toContain("P80,000");
    expect(f.saved[0].notes).toMatch(/Reference: [0-9a-f]{12}/);
  });
});

describe("when something is down", () => {
  it("fit check, Odoo down: the whole lead goes to info@, and the visitor sees it was sent", async () => {
    silentlyFail();
    const f = fakes({ saveLead: odooDown });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(await res.json()).toEqual({ ok: true });
    const alert = f.mail.find((m) => m.to.includes("info@kitsonexus.com"))!;
    expect(alert.subject).toContain("[Add to Odoo by hand]");
    expect(alert.text).toContain("P80,000");
  });

  it("fit check, Odoo and email both down: the visitor is told it didn't send", async () => {
    silentlyFail();
    const f = fakes({ saveLead: odooDown, sendMail: odooDown });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false });
  });

  it("fit check, report email fails: the visitor is told, the lead is safe and the team knows (owner, 9 Nov 2026)", async () => {
    silentlyFail();
    const mail: string[] = [];
    const cleared: number[] = [];
    const f = fakes({
      sendMail: async (m) => {
        if (m.to.includes("kgosi@example.co.bw")) throw new Error("no");
        mail.push(m.text);
      },
      clearReportOwed: async (id) => void cleared.push(id),
    });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false });
    expect(f.saved).toHaveLength(1);
    expect(f.saved[0].tags).toContain("Report not sent");
    expect(cleared).toHaveLength(0);
    expect(mail[0]).toMatch(/report email didn't send/i);
  });

  it("fit check, a new lead is marked 'Report not sent' from the moment it's saved, so a crash can't lose the report", async () => {
    const cleared: number[] = [];
    const f = fakes({ clearReportOwed: async (id) => void cleared.push(id) });
    await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(f.saved[0].tags).toContain("Report not sent");
    expect(cleared).toEqual([7]);
  });

  it("fit check, trying again after a failed report: sends the report once, with no second lead or alert", async () => {
    const cleared: number[] = [];
    const f = fakes({ alreadyReceived: async () => true, reportOwed: async () => ({ id: 7, ageMs: 60_000 }), clearReportOwed: async (id) => void cleared.push(id) });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.saved).toHaveLength(0);
    expect(f.mail.map((m) => m.to)).toEqual([["kgosi@example.co.bw"]]);
    expect(cleared).toEqual([7]);
  });

  it("fit check, a repeat when the report already went out: nobody gets another email", async () => {
    const f = fakes({ alreadyReceived: async () => true });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.mail).toHaveLength(0);
  });

  it("fit check, an identical send while the first report may still be going out: nothing more is emailed", async () => {
    const cleared: number[] = [];
    const f = fakes({ alreadyReceived: async () => true, reportOwed: async () => ({ id: 7, ageMs: 5_000 }), clearReportOwed: async (id) => void cleared.push(id) });
    expect((await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW)).status).toBe(502);
    expect(f.mail).toHaveLength(0);
    expect(cleared).toHaveLength(0);
  });

  it("fit check, trying again while Gmail is still down: still says it didn't send, and the report stays owed", async () => {
    silentlyFail();
    const cleared: number[] = [];
    const f = fakes({ alreadyReceived: async () => true, reportOwed: async () => ({ id: 7, ageMs: 60_000 }), sendMail: odooDown, clearReportOwed: async (id) => void cleared.push(id) });
    expect((await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW)).status).toBe(502);
    expect(cleared).toHaveLength(0);
  });

  it("fit check, the report and the call task don't wait for each other, so a slow Odoo can't use up the visitor's wait", async () => {
    let reportStarted = () => {};
    const started = new Promise<void>((resolve) => (reportStarted = resolve));
    const f = fakes({
      scheduleCall: () => started,
      sendMail: async (m) => {
        if (m.to.includes("kgosi@example.co.bw")) reportStarted();
      },
    });
    const res = await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(await res.json()).toEqual({ ok: true });
  }, 2000);

  it("fit check, the same answers under a different name count as new, so the team sees them", async () => {
    const f = fakes();
    await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    await handleFitCheck(post("/api/fit-check", { ...submission(strong), details: { ...details, businessName: "Another Firm" } }), f.services, NOW);
    const reference = (notes: string) => /Reference: \w+/.exec(notes)![0];
    expect(reference(f.saved[0].notes)).not.toBe(reference(f.saved[1].notes));
  });

  it("fit check, the call task fails: the lead is safe and the team is told", async () => {
    silentlyFail();
    const f = fakes({ scheduleCall: odooDown });
    await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW);
    expect(f.mail.find((m) => m.to.includes("info@kitsonexus.com"))!.text).toMatch(/call task couldn't be created/);
  });

  const note = { name: "Neo", email: "neo@example.co.bw", message: "Hello there", website: "" };

  it("note, Odoo down: goes to info@ marked for adding by hand", async () => {
    silentlyFail();
    const f = fakes({ saveLead: odooDown });
    const res = await handleContact(post("/api/contact", note), f.services);
    expect(await res.json()).toEqual({ ok: true });
    expect(f.mail[0].subject).toContain("[Add to Odoo by hand]");
    expect(f.mail[0].text).toContain("Hello there");
  });

  it("note, both down: says it didn't send", async () => {
    silentlyFail();
    const f = fakes({ saveLead: odooDown, sendMail: odooDown });
    expect((await handleContact(post("/api/contact", note), f.services)).status).toBe(502);
  });

  it("note, email down but saved in Odoo: still counts as sent", async () => {
    silentlyFail();
    const f = fakes({ sendMail: odooDown });
    expect(await (await handleContact(post("/api/contact", note), f.services)).json()).toEqual({ ok: true });
  });
});

describe("the note form's checks", () => {
  const note = { name: "Neo", email: "neo@example.co.bw", company: "Neo Works", industry: "Construction", phone: "+267 71 234 567", message: "Line one\nLine two", website: "" };

  it("accepts what the form sends, keeping line breaks in the message", async () => {
    const f = fakes();
    expect((await handleContact(post("/api/contact", note), f.services)).status).toBe(200);
    expect(f.saved[0].notes).toContain("Line one\nLine two");
    expect(f.saved[0].tags).toContain("Construction");
  });

  it("refuses bad input: header tricks, hidden characters, an unknown industry, a missing message", async () => {
    for (const bad of [{ name: "Neo\r\nBcc: x@evil.com" }, { email: "not-an-email" }, { industry: "Spies" }, { message: "   " }, { message: "a\u0000b" }, { message: "x".repeat(5001) }]) {
      const f = fakes();
      expect((await handleContact(post("/api/contact", { ...note, ...bad }), f.services)).status).toBe(400);
      expect(f.saved).toHaveLength(0);
    }
  });

  it("keeps emoji, and quietly removes invisible characters pasted into a message (owner, 9 Nov 2026)", async () => {
    const f = fakes();
    const res = await handleContact(post("/api/contact", { ...note, message: "Hello 👩‍💻 from a so\u00ADft pa\u200Bste\u202E" }), f.services);
    expect(res.status).toBe(200);
    expect(f.saved[0].notes).toContain("Hello 👩‍💻 from a soft paste");
  });
});

describe("names that could carry a scam (owner, 9 Nov 2026)", () => {
  const withDetails = (over: Partial<typeof details>) => ({ ...submission(strong), details: { ...details, ...over } });

  it.each(["Invoice overdue, pay at bad-site.com", "pay now https://bad.example", "www.bad", "BAD-SITE.COM now", "pay at bad-site.ltd", "bad-site.inc/x", "pay at t.ly/abc12", "x.com", "185.12.33.7/pay", "mr.bad-site.com", "dr.evil.com", "pay.1.evil.com", "secure.1evil.example", "pay.x.evil.example", "Claim here...evil.example", ".evil.example", "pay at dr.click", "mr.link", "bad-site\uFF0Ecom", "bad-site\u3002com", "go to pay.bad-site.com:8443/x", "Visit:evil.com", "a/evil.com", "see:1.2.3.4", "t.co", "a.xyz", "Pay at v.gd/abc123", "v.gd", "s.id/x", "j.mp/x", "u.to/x", "dr.dk/x", "co.uk/x", "v.fyi/abc", "evil.com|pay", "evil.com!pay", "evil.com\u2014pay"])("refuses a business name with a web address: %s", async (businessName) => {
    const f = fakes();
    expect((await handleFitCheck(post("/api/fit-check", withDetails({ businessName })), f.services, NOW)).status).toBe(400);
    expect(f.saved).toHaveLength(0);
    expect(f.mail).toHaveLength(0);
  });

  it("refuses a first name with a web address", async () => {
    const f = fakes();
    expect((await handleFitCheck(post("/api/fit-check", withDetails({ firstName: "see bad-site.com" })), f.services, NOW)).status).toBe(400);
  });

  it.each(["A.B. Motors", "Tlotlo (Pty) Ltd", "Tlotlo Pty.Ltd", "Tlotlo Pty.Limited", "O'Brien & Sons", "St.Mary's Clinic", "Dr.Moeng Dental", "Mr.Price Gaborone", "No.1 Motors", "S.A. Traders", "J.B. & Sons (Pty) Ltd.", "T.K.Motors", "S.K.Construction", "A.M.Traders", "J.Smith", "Smith&Co.Ltd", "T/A Kgosi Motors"])("accepts an ordinary business name: %s", async (businessName) => {
    const f = fakes();
    expect((await handleFitCheck(post("/api/fit-check", withDetails({ businessName })), f.services, NOW)).status).toBe(200);
  });
});

describe("email limits (owner, 9 Nov 2026)", () => {
  const over = (counts: { forAddress: number; total: number }) => fakes({ recentLeadCounts: async () => counts });
  const refusedSends = async (f: ReturnType<typeof fakes>, body: unknown = submission(strong)) => {
    const res = await handleFitCheck(post("/api/fit-check", body), f.services, NOW);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, heldBack: true });
    expect(f.mail).toHaveLength(0);
    expect(f.calls).toHaveLength(0);
  };

  it("a fourth report to one address in a day: the lead is saved, nothing is emailed, no call is booked", async () => {
    const f = over({ forAddress: 4, total: 10 });
    await refusedSends(f);
    expect(f.saved).toHaveLength(1);
  });

  it("past 600 website leads in a day: the lead is saved, nothing is emailed", async () => {
    const f = over({ forAddress: 1, total: 601 });
    await refusedSends(f);
    expect(f.saved).toHaveLength(1);
  });

  it("exactly at both limits still sends", async () => {
    const f = over({ forAddress: 3, total: 600 });
    expect((await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW)).status).toBe(200);
    expect(f.mail).toHaveLength(2);
  });

  it("replaying a request can't get round the limit through a missed report", async () => {
    const f = fakes({ alreadyReceived: async () => true, reportOwed: async () => ({ id: 7, ageMs: 60_000 }), recentLeadCounts: async () => ({ forAddress: 4, total: 10 }) });
    await refusedSends(f);
  });

  it.each([
    [{ forAddress: 4, total: 10 }, "one address"],
    [{ forAddress: 1, total: 601 }, "the whole site"],
  ])("says in the log when a limit holds back an email, without naming anyone", async (counts, which) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await handleFitCheck(post("/api/fit-check", submission(strong)), over(counts).services, NOW);
    expect(log).toHaveBeenCalledWith(`fit check: email held back, over the daily limit for ${which}`);
    expect(JSON.stringify(log.mock.calls)).not.toContain("kgosi");
  });

  it("if the count can't be read, the visitor still gets their report", async () => {
    silentlyFail();
    const f = fakes({ recentLeadCounts: odooDown });
    expect((await handleFitCheck(post("/api/fit-check", submission(strong)), f.services, NOW)).status).toBe(200);
    expect(f.mail).toHaveLength(2);
  });

  it("notes count towards the same daily total: the note is saved and the alert held back", async () => {
    const f = over({ forAddress: 0, total: 601 });
    const res = await handleContact(post("/api/contact", { name: "Neo", email: "neo@example.co.bw", message: "Hello", website: "" }), f.services);
    expect(res.status).toBe(200);
    expect(f.saved).toHaveLength(1);
    expect(f.mail).toHaveLength(0);
  });
});

describe("the same address however it's typed", () => {
  it("a fit check saves the address in small letters", async () => {
    const f = fakes();
    await handleFitCheck(post("/api/fit-check", { ...submission(strong), details: { ...details, email: "Kgosi@Example.CO.BW" } }), f.services, NOW);
    expect(f.saved[0].email).toBe("kgosi@example.co.bw");
  });

  it("a note saves the address in small letters", async () => {
    const f = fakes();
    await handleContact(post("/api/contact", { name: "Neo", email: "Neo@Example.co.bw", message: "Hello", website: "" }), f.services);
    expect(f.saved[0].email).toBe("neo@example.co.bw");
  });
});

describe("flyer labels", () => {
  it("a label we know becomes a tag", () => {
    const a = parse(strong);
    expect(tagsFor(a, details, calculateFitCheck(a), "flyer")).toContain("From: flyer");
  });

  it("a made-up label stays in the notes and creates no tag", async () => {
    const f = fakes();
    await handleFitCheck(post("/api/fit-check", submission(strong, "ceo-referral")), f.services, NOW);
    expect(f.saved[0].tags.join()).not.toContain("From:");
    expect(f.saved[0].notes).toContain("Came from: ceo-referral");
  });
});

describe("what the logs say", () => {
  it("keeps a mail error's code, and never its message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logFailure("sending", Object.assign(new Error("Invalid login for neo@example.co.bw"), { code: "EAUTH" }));
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).toContain("EAUTH");
    expect(logged).not.toContain("neo@example.co.bw");
    spy.mockRestore();
  });

  it("ignores a code that isn't a plain code", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logFailure("sending", Object.assign(new Error("x"), { code: "neo@example.co.bw" }));
    expect(JSON.stringify(spy.mock.calls)).not.toContain("neo@example");
    spy.mockRestore();
  });

  it("names the setting when the server's settings are wrong", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logFailure("contact", new ConfigError("Missing or invalid server settings: GMAIL_USER"));
    expect(JSON.stringify(spy.mock.calls)).toContain("GMAIL_USER");
    spy.mockRestore();
  });
});

describe("the team's alert email", () => {
  const notYetTask = () => fakes();
  const alertFrom = (f: ReturnType<typeof fakes>) => f.mail.find((m) => m.to.includes("info@kitsonexus.com"))!;
  const send = async (answers: unknown, f = fakes(), source: string | null = "flyer") => {
    await handleFitCheck(post("/api/fit-check", submission(answers, source)), f.services, NOW);
    return alertFrom(f);
  };

  it("a hot lead: skimmable, with what to do, how to reach them and a link to Odoo", async () => {
    const { html, text } = await send(strong);
    for (const body of [html!, text]) {
      expect(body).toContain("Hot");
      expect(body).toContain("Kgosi Engineering");
      expect(body).toContain("Call within 24 hours");
      expect(body).toContain("Tuesday 10 November");
      expect(body).toContain("Within 3 months");
      expect(body).toContain("flyer");
      expect(body).toContain("https://odoo.example/7");
    }
    expect(html).toContain("#0C4243");
    expect(html).toContain('href="https://wa.me/26771234567"');
    expect(html).toContain('href="mailto:kgosi@example.co.bw"');
    expect(html).toContain("Open in Odoo for the full answers");
  });

  it("uses the report's colours: hot lime, warm white, cold grey-teal", async () => {
    expect((await send(strong)).html).toMatch(/background:#A5C337;color:#141413;[^>]*>Hot</);
    expect((await send({ ...strong, decider: "someone-else" })).html).toMatch(/background:#FFFFFF;color:#0C4243;[^>]*>Warm</);
    expect((await send(trainer)).html).toMatch(/background:#3A6566;color:#FFFFFF;[^>]*>Cold</);
  });

  it("a warm lead who can't decide says so, in place of a call", async () => {
    const { html } = await send({ ...strong, decider: "someone-else" });
    expect(html).toContain("Make contact within 2 or 3 working days");
    expect(html).toContain("whoever does");
    expect(html).toContain("No, someone else decides");
  });

  it("never carries business figures or the reasons someone isn't ready (ACCESS.md)", async () => {
    for (const answers of [strong, trainer]) {
      const { html, text } = await send(answers);
      expect(html + text).not.toMatch(/P80,000|P10 million|P2,000|sales too small|not registered|working alone|Why not yet/i);
    }
  });

  it("a cold lead told Odoo can help isn't described as told 'not the right time'", async () => {
    const { html, text } = await send({ ...strong, timing: "exploring", yearlySales: "500k-2m", typicalSale: 15000, teamSize: "2-5" });
    expect(html + text).not.toContain("isn't the right time");
    expect(text).toContain("They can book a call themselves");
  });

  it("a cold lead has no call task to promise", async () => {
    const { html, text } = await send(trainer, notYetTask());
    expect(html + text).toContain("No sales call");
    expect(html + text).not.toContain("Odoo tasks");
  });

  it("if the call task couldn't be made, it doesn't claim it's in Odoo", async () => {
    silentlyFail();
    const { html } = await send(strong, fakes({ scheduleCall: odooDown }));
    expect(html).toContain("call task couldn&#39;t be created");
    expect(html).not.toContain("in your Odoo tasks");
  });

  it("Odoo down: no link to Odoo, and the whole lead is in the email", async () => {
    silentlyFail();
    const { html, subject } = await send(strong, fakes({ saveLead: odooDown }));
    expect(subject).toContain("[Add to Odoo by hand]");
    expect(html).toContain("P80,000");
    expect(html).not.toContain("Open in Odoo");
  });

  it("a visitor's text can't inject anything", async () => {
    const f = fakes();
    const body = { ...submission(strong), details: { ...details, businessName: "<img src=x onerror=alert(1)>" } };
    await handleFitCheck(post("/api/fit-check", body), f.services, NOW);
    expect(alertFrom(f).html).not.toContain("<img");
  });

  it("a note: their words in full with line breaks, how to reach them and a link", async () => {
    const f = fakes();
    await handleContact(post("/api/contact", { name: "Neo", email: "neo@example.co.bw", company: "Neo Works", industry: "Construction", phone: "+267 71 234 567", message: "Line one\n<b>Line two</b>", website: "" }), f.services);
    const { html, text, replyTo } = alertFrom(f);
    expect(replyTo).toBe("neo@example.co.bw");
    expect(html).toContain("Neo Works");
    expect(html).toContain("From Neo · Construction");
    expect(html).toContain("Line one<br>&lt;b&gt;Line two&lt;/b&gt;");
    expect(html).toContain('href="tel:+26771234567"');
    expect(html).toContain("Open in Odoo");
    expect(text).toContain("Line one\n<b>Line two</b>");
  });

  it("a note with Odoo down: marked for adding by hand, with no link", async () => {
    silentlyFail();
    const f = fakes({ saveLead: odooDown });
    await handleContact(post("/api/contact", { name: "Neo", email: "neo@example.co.bw", message: "Hello there", website: "" }), f.services);
    expect(alertFrom(f).html).toContain("isn&#39;t in Odoo yet");
    expect(alertFrom(f).html).not.toContain("Open in Odoo");
  });

  it("tells Odoo which kind of lead this is, on its own", async () => {
    const f = fakes();
    await send(strong, f);
    expect(f.saved[0].leadType).toBe("hot");
    const cold = fakes();
    await send(trainer, cold);
    expect(cold.saved[0].leadType).toBe("cold");
  });
});

describe("waiting on outside services", () => {
  it("gives up on something that hangs", async () => {
    await expect(within(10, new Promise(() => {}))).rejects.toThrow(/too long/);
  });
  it("passes through an answer that arrives in time", async () => {
    await expect(within(1000, Promise.resolve("ok"))).resolves.toBe("ok");
  });
});

describe("the report email", () => {
  const report = (a: unknown, d = details) => reportEmail({ answers: parse(a), details: d, result: calculateFitCheck(parse(a)), now: NOW });

  it("not yet: honest advice, no pitch, no booking link, a quiet community link", () => {
    const { html, text, subject } = report(trainer);
    expect(subject).toBe("Your fit check report, Kgosi");
    for (const body of [html, text]) {
      expect(body).toContain("Not yet. Start simpler first");
      expect(body).toMatch(/What we(&#39;|')d do in your place/i);
      expect(body).toContain("Register your business with CIPA.");
      expect(body).toMatch(/free calendar/);
      expect(body).toContain("https://chat.whatsapp.com/");
      expect(body).not.toContain("cal.com");
      expect(body).not.toContain("Book my review");
    }
    expect(html).toContain("Odoo starts to make sense when");
    expect(html).toContain("Take the check again");
  });

  it("strong fit: the plan and the booking link", () => {
    const { html } = report(strong);
    expect(html).toContain("Odoo is a strong fit for you");
    expect(html).toContain("Your plan, one step at a time");
    expect(html).toContain("cal.com/kitso-nexus-advisory-w4fk1j");
    expect(html).toContain("Book my review");
  });

  it("someone who can't decide isn't offered a booking", () => {
    const { html } = report({ ...strong, decider: "someone-else" });
    expect(html).not.toContain("Book my review");
    expect(html).toContain("Share this with whoever decides");
  });

  it("the community is never the only button: without a main action it's a quiet link", () => {
    const { html } = report({ ...strong, decider: "someone-else" });
    expect(html).toContain("https://chat.whatsapp.com/");
    expect(html).not.toMatch(/padding:14px 20px[^>]*>Join the WhatsApp community/);
  });

  it("leaves out how the numbers were worked out (owner, 9 Nov 2026)", () => {
    for (const a of [trainer, strong]) {
      const { html, text } = report(a);
      expect(html + text).not.toMatch(/How we worked|P44 an hour|prime rate/);
    }
  });

  it("shows the new phone number and info@", () => {
    expect(report(strong).html).toContain("+267 74 947 045");
    expect(report(strong).html).toContain("info@kitsonexus.com");
  });

  it("a business name can't inject anything into the email", () => {
    const { html } = report(strong, { ...details, businessName: `<img src=x onerror=alert(1)>`, firstName: `"Neo"` });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
