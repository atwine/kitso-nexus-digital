// The emails the team gets for a new lead, in the report's look, made to be skimmed
// (Paper page L). A fit check alert holds no business figures: those stay in Odoo,
// unless Odoo is the thing that's down.
import type { FitCheckResult } from "../../src/lib/fitCheck/calculate.ts";
import type { FitCheckDetails } from "../../src/lib/fitCheck/details.ts";
import { BUSINESS_TYPES, CIPA, DECIDER, TEAM_SIZES, TIMING, bandOf, type FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";
import { C, FONT, button, esc, para } from "./emailKit.ts";
import { HAND_ENTRY } from "./intake.ts";
import type { CallTask } from "./services.ts";

const ZONE = "Africa/Gaborone";
const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: ZONE });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONE });
const sentAt = (now: Date) => `${DAY.format(now)}, ${TIME.format(now)}`;
/** A calendar date (YYYY-MM-DD), as "Tuesday 10 November". */
export const dayLabel = (date: string) => DAY.format(new Date(`${date}T12:00:00Z`));

const PILL = {
  hot: { label: "Hot", colours: `background:${C.lime};color:${C.night};` },
  warm: { label: "Warm", colours: `background:#FFFFFF;color:${C.teal};` },
  cold: { label: "Cold", colours: `background:${C.tealSoft};color:#FFFFFF;` },
} as const;
const WHAT_TO_DO = { hot: "Call within 24 hours", warm: "Make contact within 2 or 3 working days", cold: "No sales call" } as const;
const VERDICT = { "strong-fit": "Odoo is a strong fit", fit: "Odoo can help. Start small", "not-yet": "Not yet" } as const;

interface Fact {
  label: string;
  value: string;
  href?: string;
}

export const emailDoc = (rows: string) => `<!doctype html><html><body style="margin:0;padding:0;background:${C.stone};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.stone};"><tr><td align="center" style="padding:16px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
${rows}
<tr><td style="padding:18px 32px 26px;">${para("Kitso Nexus Advisory · sent to the team only, never to the visitor", 13)}</td></tr>
</table></td></tr></table></body></html>`;

export const headerRow = (eyebrow: string, title: string, sub: string, pill = "") => `<tr><td style="background:${C.teal};padding:28px 32px;">
${para(esc(eyebrow), 13, "rgba(255,255,255,0.75)", "font-weight:600;")}
${pill}
<h1 style="margin:14px 0 6px;font-family:${FONT};font-size:32px;line-height:38px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">${esc(title)}</h1>
${sub ? para(esc(sub), 15, "rgba(255,255,255,0.85)") : ""}
</td></tr>`;

export const stoneCard = (inner: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.stone};border-radius:20px;"><tr><td style="padding:22px 24px;">${inner}</td></tr></table>`;
export const section = (inner: string, padding = "28px 32px 0") => `<tr><td style="padding:${padding};">${inner}</td></tr>`;
const eyebrow = (text: string) => para(esc(text), 13, C.olive, "font-weight:700;");
const withBreaks = (text: string) => esc(text).replace(/\r?\n/g, "<br>");

const factRows = (facts: Fact[]) =>
  section(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${facts
      .map(({ label, value, href }) => {
        const shown = href ? `<a href="${esc(href)}" style="color:${C.teal};font-weight:600;">${esc(value)}</a>` : `<strong style="color:${C.night};font-weight:600;">${esc(value)}</strong>`;
        return `<tr><td width="190" valign="top" style="padding:12px 0;border-top:1px solid ${C.line};">${para(esc(label), 15, C.muted)}</td><td valign="top" style="padding:12px 0;border-top:1px solid ${C.line};">${para(shown, 15, C.night)}</td></tr>`;
      })
      .join("")}</table>`,
    "20px 32px 0",
  );

const actionRow = (leadUrl: string | null, label: string, name: string) => `<tr><td style="padding:20px 16px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.teal};border-radius:20px;"><tr><td style="padding:24px;">
${leadUrl ? `<div style="padding-bottom:14px;">${button(esc(leadUrl), esc(label), true)}</div>` : ""}
${para(`Reply to this email to reach ${esc(name)} directly.`, 14, "rgba(255,255,255,0.88)", "text-align:center;")}
</td></tr></table></td></tr>`;

const attention = (lines: string[]) => (lines.length ? section(stoneCard(`${para("Needs attention", 13, C.red, "font-weight:700;padding-bottom:6px;")}${lines.map((l) => para(esc(l), 15, C.night, "padding:0 0 6px;")).join("")}`), "20px 32px 0") : "");

const factLines = (facts: Fact[]) => facts.map(({ label, value }) => `${label}: ${value}`);

interface FitCheckAlertInput {
  answers: FitCheckAnswers;
  details: FitCheckDetails;
  result: FitCheckResult;
  source: string | null;
  now: Date;
  /** The call to make, and whether it reached Odoo's task list. */
  task: { call: CallTask; created: boolean } | null;
  /** Why this person needs handling differently, if they do. */
  purpose: string;
  problems: string[];
  /** Null when Odoo couldn't be reached. */
  leadUrl: string | null;
  /** The whole lead: only used when Odoo couldn't be reached. */
  fullNotes: string;
}

export function fitCheckAlert({ answers: a, details, result, source, now, task, purpose, problems, leadUrl, fullNotes }: FitCheckAlertInput) {
  const handEntry = leadUrl === null;
  const pill = PILL[result.temperature];
  const action = WHAT_TO_DO[result.temperature];
  const types = a.businessTypes.map((t) => bandOf(BUSINESS_TYPES, t).label).join(", ");
  const team = a.teamSize === "1" ? "Just them" : `${bandOf(TEAM_SIZES, a.teamSize).label} people`;
  const sub = `${details.firstName} · ${types} · ${team}`;
  const when = sentAt(now);
  const detail = [
    purpose,
    task
      ? `Due ${dayLabel(task.call.dueDate)}.${task.created ? " It's in your Odoo tasks." : ""}`
      : result.verdict === "not-yet"
        ? "We've told them it isn't the right time yet. The WhatsApp community is the only follow-up."
        : "They can book a call themselves if they want one. No call is due from us.",
  ].filter(Boolean);
  const facts: Fact[] = [
    { label: "WhatsApp", value: details.whatsapp, href: `https://wa.me/${details.whatsapp.replace(/\D/g, "")}` },
    { label: "Email", value: details.email, href: `mailto:${details.email}` },
    { label: "Makes the decision", value: bandOf(DECIDER, a.decider).label },
    ...(a.timing ? [{ label: "How soon", value: bandOf(TIMING, a.timing).label }] : []),
    { label: "Registered", value: bandOf(CIPA, a.cipa).label },
    ...(source ? [{ label: "Came from", value: source }] : []),
    ...(details.joinCommunity ? [{ label: "WhatsApp community", value: "Wants to join" }] : []),
  ];
  const notice = handEntry ? ["Odoo couldn't be reached, so this lead isn't in Odoo yet.", ...problems] : problems;

  const pillRow = `<div style="padding-top:14px;"><span style="display:inline-block;${pill.colours}font-family:${FONT};font-size:15px;font-weight:800;line-height:18px;padding:9px 18px;border-radius:999px;">${pill.label}</span><span style="font-family:${FONT};font-size:15px;line-height:22px;font-weight:600;color:#FFFFFF;padding-left:10px;">${VERDICT[result.verdict]}</span></div>`;

  const html = emailDoc(`${headerRow(`New fit check · ${when}`, details.businessName, sub, pillRow)}
${section(`${eyebrow("What to do")}<h2 style="margin:4px 0;font-family:${FONT};font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.5px;color:${C.night};">${action}</h2>${detail.map((d) => para(esc(d))).join("")}`)}
${attention(notice)}
${factRows(facts)}
${handEntry ? section(stoneCard(`${eyebrow("The whole lead, to add by hand")}${para(withBreaks(fullNotes), 14, C.night, "padding-top:8px;")}`), "20px 32px 0") : ""}
${actionRow(leadUrl, "Open in Odoo for the full answers", details.firstName)}`);

  const text = [
    `${pill.label}: ${VERDICT[result.verdict]}`,
    details.businessName,
    sub,
    `New fit check, ${when}`,
    "",
    action,
    ...detail,
    ...(notice.length ? ["", ...notice] : []),
    "",
    ...factLines(facts),
    "",
    ...(leadUrl ? [`Open in Odoo for the full answers: ${leadUrl}`] : [fullNotes]),
    "",
    `Reply to this email to reach ${details.firstName} directly.`,
  ].join("\n");

  return { subject: `${handEntry ? `${HAND_ENTRY} ` : ""}New fit check: ${result.temperature.toUpperCase()} · ${details.businessName}`, text, html };
}

interface NoteAlertInput {
  note: { name: string; email: string; company?: string; industry?: string; phone?: string; message: string };
  now: Date;
  /** Null when Odoo couldn't be reached. */
  leadUrl: string | null;
}

export function noteAlert({ note, now, leadUrl }: NoteAlertInput) {
  const handEntry = leadUrl === null;
  const when = sentAt(now);
  const title = note.company ?? note.name;
  const sub = note.company ? [`From ${note.name}`, ...(note.industry ? [note.industry] : [])].join(" · ") : (note.industry ?? "");
  const phoneDigits = note.phone?.replace(/[^\d+]/g, "");
  const facts: Fact[] = [
    ...(note.phone ? [{ label: "Phone or WhatsApp", value: note.phone, href: phoneDigits ? `tel:${phoneDigits}` : undefined }] : []),
    { label: "Email", value: note.email, href: `mailto:${note.email}` },
  ];
  const notice = handEntry ? ["Odoo couldn't be reached, so this note isn't in Odoo yet. Please add it by hand."] : [];

  const html = emailDoc(`${headerRow(`New note from the website · ${when}`, title, sub)}
${attention(notice)}
${section(`${eyebrow("What they wrote")}<div style="padding-top:10px;">${stoneCard(para(withBreaks(note.message), 16, C.night))}</div>`)}
${factRows(facts)}
${actionRow(leadUrl, "Open in Odoo", note.name)}`);

  const text = [
    title,
    ...(sub ? [sub] : []),
    `New note from the website, ${when}`,
    ...(notice.length ? ["", ...notice] : []),
    "",
    note.message,
    "",
    `Name: ${note.name}`,
    ...factLines(facts),
    "",
    ...(leadUrl ? [`Open in Odoo: ${leadUrl}`, ""] : []),
    `Reply to this email to reach ${note.name} directly.`,
  ].join("\n");

  return { subject: `${handEntry ? `${HAND_ENTRY} ` : ""}New note from ${title}`, text, html };
}
