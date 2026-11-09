// The fit check report email, drawn on Paper (page L: "Full report" and "Not yet
// version"). Email programs need tables and inline styles. There are no pictures
// because most email programs hide them until the reader agrees to load them.
import { buildReport, WHAT_ODOO_FIXES, WHAT_IT_WONT_FIX, type ReportCard } from "../../src/lib/fitCheck/reportContent.ts";
import type { FitCheckResult } from "../../src/lib/fitCheck/calculate.ts";
import type { FitCheckDetails } from "../../src/lib/fitCheck/details.ts";
import type { FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";
import { BOOKING_URL, EMAIL, PHONE_DISPLAY, WHATSAPP_COMMUNITY_URL } from "../../src/lib/contact.ts";
import { SITE_URL } from "../../src/seo/pageMeta.ts";
import { C, FONT, button, esc, para } from "./emailKit.ts";

const FIT_URL = `${SITE_URL}/fit`;

const barColour = { small: C.green, "worth-fixing": C.amber, serious: C.red };
const heading = (text: string, colour = C.night) => `<h2 style="margin:0;font-family:${FONT};font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.5px;color:${colour};">${text}</h2>`;
const section = (inner: string, padding = "28px 32px 0") => `<tr><td style="padding:${padding};">${inner}</td></tr>`;
const card = ({ dark, eyebrow, title, lines, foot }: ReportCard) => {
  const main = dark ? "#FFFFFF" : C.night;
  const text = dark ? "rgba(255,255,255,0.88)" : C.body;
  return `<tr><td style="padding:0 0 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${dark ? C.teal : C.stone};border-radius:20px;"><tr><td style="padding:22px 24px;">
${para(esc(eyebrow), 13, dark ? C.lime : C.olive, "font-weight:700;")}
<h3 style="margin:6px 0 8px;font-family:${FONT};font-size:19px;line-height:25px;font-weight:700;color:${main};">${esc(title)}</h3>
${lines.map((l) => para(esc(l), 15, text, "padding:0 0 8px;")).join("")}
${foot ? para(esc(foot), 15, main, "font-weight:600;") : ""}
</td></tr></table></td></tr>`;
};

interface ReportInput {
  answers: FitCheckAnswers;
  details: FitCheckDetails;
  result: FitCheckResult;
  now: Date;
  /** The page version of this report, when one can be made. */
  reportUrl?: string | null;
}

export function reportEmail({ answers: a, details, result, now, reportUrl }: ReportInput): { subject: string; text: string; html: string } {
  const report = buildReport(a, result);
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Gaborone" }).format(now);
  const prepared = `Prepared for ${details.firstName} · ${report.who}`;
  const { closing } = report;
  const mainHref = closing.main?.kind === "book" ? BOOKING_URL : FIT_URL;

  const areaRows = report.areas
    .map(
      (x, i) => `<tr><td style="padding:14px 0;${i ? `border-top:1px solid ${C.line};` : ""}">
${para(`<strong style="color:${C.night};">${esc(x.label)}</strong><span style="float:right;color:${C.night};font-weight:700;">${x.cost}</span>`, 15)}
${para(esc(x.story), 14, C.body, "padding:4px 0 8px;")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0EB;border-radius:4px;"><tr><td width="${x.barPercent}%" style="background:${barColour[x.severity]};height:6px;font-size:0;line-height:0;border-radius:4px;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:${C.stone};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.stone};"><tr><td align="center" style="padding:16px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
<tr><td style="background:${C.teal};padding:28px 32px;">
${para(`Kitso Nexus Advisory &nbsp;·&nbsp; Fit check report, ${esc(date)}`, 13, "rgba(255,255,255,0.75)", "font-weight:600;")}
<h1 style="margin:14px 0 6px;font-family:${FONT};font-size:32px;line-height:38px;font-weight:700;letter-spacing:-1px;color:#FFFFFF;">${esc(details.businessName)}</h1>
${para(esc(prepared), 15, "rgba(255,255,255,0.85)")}
<div style="padding-top:16px;"><span style="display:inline-block;font-family:${FONT};font-size:15px;font-weight:700;line-height:18px;padding:9px 16px;border-radius:999px;${report.notYet ? `background:${C.tealSoft};color:#FFFFFF;` : report.verdict === "fit" ? `background:#FFFFFF;color:${C.teal};` : `background:${C.lime};color:${C.night};`}">${esc(report.pill)}</span></div>
${report.why ? para(esc(report.why), 16, "rgba(255,255,255,0.9)", "padding-top:16px;") : ""}
</td></tr>
${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" style="padding-right:12px;">${para(report.total, 21, C.night, "font-weight:800;")}${para("slipping through the cracks each year", 13)}</td>
<td valign="top" style="padding:0 12px;">${para(report.hours, 21, C.night, "font-weight:800;")}${para(report.timeLabel, 13)}</td>
<td valign="top" style="padding-left:12px;">${para(report.score, 21, C.night, "font-weight:800;")}${para("business health score", 13)}</td>
</tr></table>`)}
${reportUrl ? section(para(`<a href="${esc(reportUrl)}" style="color:${C.teal};font-weight:600;">Open this report as a web page</a> to forward it or save it as a PDF. The link works for 6 months.`, 14), "16px 32px 0") : ""}
${section(`${heading("Area by area")}${para("Most costly first. Cost per year.", 13, C.muted, "padding:4px 0 6px;")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${areaRows}</table>`)}
${section(`${heading(report.planHeading)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">${report.plan.map(card).join("")}</table>`)}
${report.notYet ? "" : section(`${para(`<strong>What Odoo will fix.</strong> ${WHAT_ODOO_FIXES}`, 15, C.body, "padding-bottom:8px;")}${para(`<strong>What it won't fix on its own.</strong> ${esc(WHAT_IT_WONT_FIX)}`, 15)}`, "12px 32px 0")}
<tr><td style="padding:24px 16px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.teal};border-radius:20px;"><tr><td style="padding:26px 24px;">
<h2 style="margin:0 0 8px;font-family:${FONT};font-size:23px;line-height:29px;font-weight:700;color:#FFFFFF;">${esc(closing.title)}</h2>
${para(esc(closing.body), 15, "rgba(255,255,255,0.88)", "padding-bottom:16px;")}
${
  closing.main
    ? `<div style="padding-bottom:10px;">${button(mainHref, closing.main.label, true)}</div>${button(WHATSAPP_COMMUNITY_URL, "Join the WhatsApp community", false)}`
    : para(`<a href="${WHATSAPP_COMMUNITY_URL}" style="color:#FFFFFF;font-weight:600;">Join the WhatsApp community</a>`, 14, "#FFFFFF")
}
</td></tr></table></td></tr>
<tr><td style="padding:20px 32px 26px;">${para(`Kitso Nexus Advisory · Gaborone · ${EMAIL} · ${PHONE_DISPLAY}`, 13, C.body)}${para(`<a href="${FIT_URL}" style="color:${C.teal};font-weight:600;">Send this check to a friend</a>`, 13, C.teal, "padding-top:6px;")}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `${details.businessName}: your fit check report, ${date}`,
    prepared,
    "",
    report.pill,
    ...(report.why ? [report.why] : []),
    "",
    `${report.total} slipping through the cracks each year`,
    `${report.hours} ${report.timeLabel}`,
    `Business health score: ${report.score}`,
    ...(reportUrl ? ["", `Open this report as a web page (the link works for 6 months): ${reportUrl}`] : []),
    "",
    "AREA BY AREA",
    ...report.areas.flatMap((x) => [`${x.label}: ${x.cost} a year`, x.story, ""]),
    report.planHeading.toUpperCase(),
    ...report.plan.flatMap((c) => [`${c.eyebrow}: ${c.title}`, ...c.lines.map((l) => `- ${l}`), ...(c.foot ? [c.foot] : []), ""]),
    closing.title,
    closing.body,
    ...(closing.main ? [`${closing.main.label}: ${mainHref}`] : []),
    `Join the WhatsApp community: ${WHATSAPP_COMMUNITY_URL}`,
    `Send this check to a friend: ${FIT_URL}`,
    "",
    `Kitso Nexus Advisory · Gaborone · ${EMAIL} · ${PHONE_DISPLAY}`,
  ].join("\n");

  return { subject: `Your fit check report, ${details.firstName}`, text, html };
}
