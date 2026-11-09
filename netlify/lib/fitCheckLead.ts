// A finished fit check: becomes a lead in Odoo with its labels and call task, an
// alert to info@, and a report to the person. The verdict and call label are always
// worked out here from the answers; nothing the browser claims about them is used.
import { z } from "zod";
import { calculateFitCheck, type FitCheckResult } from "../../src/lib/fitCheck/calculate.ts";
import { fitCheckDetails, type FitCheckDetails } from "../../src/lib/fitCheck/details.ts";
import { BUSINESS_TYPES, CIPA, fitCheckAnswers, TIMING, bandOf, type FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";
import { screensFor } from "../../src/lib/fitCheck/screens.ts";
import { fitCheckAlert } from "./alerts.ts";
import { pula } from "./emailKit.ts";
import { logFailure, overEmailLimit, readVisitorJson, referenceFor, reply, saveOnce, heldBack } from "./intake.ts";
import { reportEmail } from "./report.ts";
import { FIT_CHECK_TAG, REPORT_OWED_TAG, type CallTask, type Services } from "./services.ts";
import { SITE_URL } from "../../src/seo/pageMeta.ts";

export const fitCheckSubmission = z
  .object({
    answers: fitCheckAnswers,
    details: fitCheckDetails,
    source: z.string().regex(/^[a-z0-9-]{1,30}$/).nullable(),
    website: z.string().max(500),
  })
  .strict();

// Only labels printed on real flyers become tags. Anything else stays in the notes.
const KNOWN_SOURCES = new Set(["flyer"]);

const VERDICT_TAG = { "strong-fit": "Verdict: strong fit", fit: "Verdict: start small", "not-yet": "Verdict: not yet" } as const;
const TEMPERATURE_LINE = {
  hot: "Hot: call within 24 hours",
  warm: "Warm: make contact within 2 or 3 working days",
  cold: "Cold: no sales call, community only",
} as const;
const CIPA_TAG: Record<string, string> = { yes: "CIPA: registered", "other-country": "Registered: another country", "in-progress": "CIPA: in progress", no: "CIPA: not registered" };
const REASON_LINE: Record<string, string> = {
  "not-registered": "not registered",
  solo: "working alone on smaller money",
  "small-sales": "sales too small to carry a system",
  "few-sales": "income comes from a few big sales a year",
  "little-at-stake": "little money at stake",
  "already-covered": "already runs on one proper system",
};
const PURPOSE = {
  "custom-software": "Possible custom software lead, not an Odoo lead.",
  "reach-decider": "This person can't decide. Ask to meet whoever does.",
} as const;
const purposeOf = (result: FitCheckResult) => (result.contactReason ? PURPOSE[result.contactReason] : "");
const span = (r: { low: number; high: number }) => (r.low === r.high ? pula(r.low) : `${pula(r.low)} to ${pula(r.high)}`);

/** The date a number of working days from now, in Gaborone. */
export function workingDaysFrom(now: Date, days: number): string {
  const gaborone = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const date = new Date(Date.UTC(gaborone.getUTCFullYear(), gaborone.getUTCMonth(), gaborone.getUTCDate()));
  for (let left = days; left > 0; ) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) left--;
  }
  return date.toISOString().slice(0, 10);
}

export function callTaskFor(result: FitCheckResult, now: Date): CallTask | null {
  if (result.temperature === "cold") return null;
  const hot = result.temperature === "hot";
  return {
    summary: hot ? "Call within 24 hours (fit check)" : "Make contact within 2 or 3 working days (fit check)",
    note: [purposeOf(result), "The full answers are in this lead's notes."].filter(Boolean).join(" "),
    dueDate: workingDaysFrom(now, hot ? 1 : 3),
  };
}

export function tagsFor(answers: FitCheckAnswers, details: FitCheckDetails, result: FitCheckResult, source: string | null): string[] {
  return [
    FIT_CHECK_TAG,
    VERDICT_TAG[result.verdict],
    result.temperature[0].toUpperCase() + result.temperature.slice(1),
    CIPA_TAG[answers.cipa],
    ...answers.businessTypes.map((t) => bandOf(BUSINESS_TYPES, t).label),
    ...(source && KNOWN_SOURCES.has(source) ? [`From: ${source}`] : []),
    ...(result.contactReason === "custom-software" ? ["Custom software lead"] : []),
    ...(result.contactReason === "reach-decider" ? ["Not the decision maker"] : []),
    ...(details.joinCommunity ? ["Wants WhatsApp community"] : []),
    ...(details.emailTips ? ["Wants email tips"] : []),
  ];
}

function answerLines(answers: FitCheckAnswers): string[] {
  const lines: string[] = [];
  for (const screen of screensFor(answers.businessTypes)) {
    screen.fields.forEach((field, i) => {
      const question = i === 0 ? screen.title : (field.label ?? field.key);
      const value = answers[field.key];
      if (value === undefined) return;
      const shown =
        field.kind === "pula" ? pula(value as number) : (Array.isArray(value) ? value : [value as string]).map((id) => bandOf(field.options, id).label).join(", ");
      lines.push(`${question} ${shown}`);
    });
  }
  if (answers.otherSystem) lines.push(`Other system named: ${answers.otherSystem}`);
  if (answers.timing) lines.push(`How soon: ${bandOf(TIMING, answers.timing).label}`);
  return lines;
}

function summaryLines(answers: FitCheckAnswers, details: FitCheckDetails, result: FitCheckResult, source: string | null): string[] {
  return [
    `Name: ${details.firstName}`,
    `Business: ${details.businessName}`,
    `Email: ${details.email}`,
    `WhatsApp: ${details.whatsapp}`,
    `Registered: ${bandOf(CIPA, answers.cipa).label}`,
    `Verdict: ${VERDICT_TAG[result.verdict].replace("Verdict: ", "")}`,
    TEMPERATURE_LINE[result.temperature],
    ...(result.notYetReasons.length ? [`Why not yet: ${result.notYetReasons.map((r) => REASON_LINE[r]).join(", ")}`] : []),
    ...(result.contactReason ? [PURPOSE[result.contactReason]] : []),
    ...(answers.businessTypes.includes("engineering") ? ["Engineering firm"] : []),
    ...(source ? [`Came from: ${source}`] : []),
    `WhatsApp community: ${details.joinCommunity ? "yes, ticked" : "not ticked"}`,
  ];
}

function fullNotes(answers: FitCheckAnswers, details: FitCheckDetails, result: FitCheckResult, source: string | null, reference: string) {
  return [
    ...summaryLines(answers, details, result, source),
    "",
    "What it's costing, a year:",
    ...result.areas.map((a) => `${a.label}: ${span(a.pula)}`),
    `Total: ${span(result.total)}. Hours a week: ${span(result.hoursPerWeek).replaceAll("P", "")}. Health score: ${result.score}.`,
    ...(result.figuresCapped ? ["Some answers didn't add up, so these figures were limited."] : []),
    "",
    "Their answers:",
    ...answerLines(answers),
    "",
    reference,
  ].join("\n");
}

// A first report has been sent or given up on by this long after its lead was saved.
// Before that, a repeat can't tell a failed try from one still going out.
const FIRST_TRY_MS = 20_000;

export async function handleFitCheck(request: Request, services: Services, now = new Date()): Promise<Response> {
  const intake = await readVisitorJson(request);
  if (!intake.ok) return intake.response;
  const parsed = fitCheckSubmission.safeParse(intake.body);
  if (!parsed.success) return reply(400, false);
  const { answers, details, source, website } = parsed.data;
  if (website) return reply(200, true); // Only bots fill in the hidden box.

  const result = calculateFitCheck(answers);
  const reference = referenceFor(details.email, JSON.stringify(answers), details.firstName, details.businessName);
  const notes = fullNotes(answers, details, result, source, reference);
  const saved = await saveOnce(
    services,
    {
      title: `Fit check · ${details.businessName}`,
      contactName: details.firstName,
      email: details.email,
      phone: details.whatsapp,
      company: details.businessName,
      notes,
      // Marked from the start and cleared once the report goes out, so a crash can't lose it.
      tags: [...tagsFor(answers, details, result, source), REPORT_OWED_TAG],
      leadType: result.temperature,
    },
    reference,
    "fit check",
  );

  const token = services.reportToken(answers, now);
  // After a #, so the link stays out of server logs when someone opens it.
  const reportUrl = token ? `${SITE_URL}/fit/report#${token}` : null;
  const sendReport = async () => {
    try {
      await services.sendMail({ to: [details.email], replyTo: services.mailFrom, ...reportEmail({ answers, details, result, now, reportUrl }) });
      return true;
    } catch (error) {
      logFailure("fit check: sending the report", error);
      return false;
    }
  };
  // Already in Odoo. Only a report that failed the first time goes out again, so
  // replaying a request can't fill someone's inbox.
  if (saved.status === "repeat") {
    try {
      const owed = await services.reportOwed(details.email, reference);
      if (owed === null) return reply(200, true);
      if (owed.ageMs < FIRST_TRY_MS) return reply(502, false);
      if (await overEmailLimit(services, details.email, "fit check")) return heldBack();
      if (!(await sendReport())) return reply(502, false);
      await services.clearReportOwed(owed.id).catch((error: unknown) => logFailure("fit check: clearing the report mark", error));
      return reply(200, true);
    } catch (error) {
      logFailure("fit check: checking for a missed report", error);
      return reply(502, false);
    }
  }

  // The lead is safe in Odoo. Over the limit, nothing more goes out.
  if (saved.status === "saved" && (await overEmailLimit(services, details.email, "fit check"))) return heldBack();

  const problems: string[] = [];
  const call = callTaskFor(result, now);
  const makeCallTask = async () => {
    if (saved.status !== "saved" || !call) return false;
    try {
      await services.scheduleCall(saved.id, call);
      return true;
    } catch (error) {
      logFailure("fit check: creating the call task", error);
      problems.push(`The call task couldn't be created: ${call.summary}.`);
      return false;
    }
  };
  // Together, so a slow Odoo can't use up the time the visitor's browser will wait.
  const [taskCreated, reportSent] = await Promise.all([makeCallTask(), sendReport()]);
  if (!reportSent) problems.push("Their report email didn't send. They've been asked to try again, so check that it reached them.");
  const clearing = reportSent && saved.status === "saved" ? services.clearReportOwed(saved.id).catch((error: unknown) => logFailure("fit check: clearing the report mark", error)) : Promise.resolve();

  const leadUrl = saved.status === "saved" ? services.leadUrl(saved.id) : null;
  try {
    await services.sendMail({
      to: services.alertTo,
      replyTo: details.email,
      ...fitCheckAlert({ answers, details, result, source, now, task: call ? { call, created: taskCreated } : null, purpose: purposeOf(result), problems, leadUrl, fullNotes: notes }),
    });
  } catch (error) {
    logFailure("fit check: sending the alert", error);
    if (leadUrl === null) return reply(502, false);
  }
  await clearing;
  return reportSent ? reply(200, true) : reply(502, false);
}
