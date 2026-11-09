// The fit check's drop-off counter: how many people reach each step. It keeps the
// date, the step and the flyer label, and nothing about the person.
import { z } from "zod";
import { COUNT_STEPS, COUNT_STEP_IDS, type CountStepId } from "../../src/lib/fitCheck/countSteps.ts";
import { dayLabel, emailDoc, headerRow, section, stoneCard } from "./alerts.ts";
import { C, FONT, esc, para } from "./emailKit.ts";
import { logFailure, readVisitorJson, reply } from "./intake.ts";
import type { Mail } from "./mailer.ts";

export interface CountEntry {
  step: string;
  source: string | null;
}

export interface CountStore {
  add(date: string, step: CountStepId, source: string | null): Promise<void>;
  entriesFor(date: string): Promise<CountEntry[]>;
}

const GABORONE_OFFSET_MS = 2 * 60 * 60 * 1000;
const dateInGaborone = (when: Date) => new Date(when.getTime() + GABORONE_OFFSET_MS).toISOString().slice(0, 10);
export const yesterdayInGaborone = (now: Date) => dateInGaborone(new Date(now.getTime() - 24 * 60 * 60 * 1000));

const countRequest = z
  .object({
    step: z.enum(COUNT_STEP_IDS),
    source: z.string().regex(/^[a-z0-9-]{1,30}$/).nullable(),
  })
  .strict();

export async function handleCount(request: Request, store: CountStore, now = new Date()): Promise<Response> {
  const intake = await readVisitorJson(request);
  if (!intake.ok) return intake.response;
  const parsed = countRequest.safeParse(intake.body);
  if (!parsed.success) return reply(400, false);
  try {
    await store.add(dateInGaborone(now), parsed.data.step, parsed.data.source);
  } catch (error) {
    logFailure("count", error);
    return reply(502, false);
  }
  return reply(200, true);
}

const FLYER = "flyer";
// One or two people leaving is noise, not a pattern.
const SMALLEST_DROP_WORTH_NAMING = 2;

function tally(entries: CountEntry[]) {
  const rows = COUNT_STEPS.map((step) => {
    const here = entries.filter((e) => e.step === step.id);
    return { ...step, everyone: here.length, flyer: here.filter((e) => e.source === FLYER).length };
  });
  return rows.filter((r) => !("someOnly" in r) || r.everyone > 0);
}

function biggestDrop(rows: ReturnType<typeof tally>) {
  const path = rows.filter((r) => !("someOnly" in r) && !("afterTheCheck" in r));
  let worst: { from: string; to: string; people: number } | null = null;
  path.slice(1).forEach((row, i) => {
    const people = path[i].everyone - row.everyone;
    if (people >= SMALLEST_DROP_WORTH_NAMING && people > (worst?.people ?? 0)) worst = { from: path[i].label, to: row.label, people };
  });
  return worst as { from: string; to: string; people: number } | null;
}

const count = (rows: ReturnType<typeof tally>, id: CountStepId) => rows.find((r) => r.id === id)?.everyone ?? 0;
const rowLabel = (row: ReturnType<typeof tally>[number]) => ("someOnly" in row ? `${row.label} (only some businesses)` : row.label);

export function countsEmail(date: string, entries: CountEntry[]) {
  const rows = tally(entries);
  const day = dayLabel(date);
  const opened = count(rows, "opened");
  const sent = count(rows, "sent");
  const drop = biggestDrop(rows);
  const dropLine = drop ? `Biggest drop: ${drop.from} to ${drop.to}, ${drop.people} people` : null;
  const widest = Math.max(1, ...rows.map((r) => r.everyone));

  const figure = (value: number, label: string) => `<td valign="top" style="padding-right:12px;">${para(String(value), 24, C.night, "font-weight:800;")}${para(esc(label), 13)}</td>`;
  const headCell = (text: string, align: string) => `<td align="${align}" style="padding:0 0 8px;">${para(text, 13, C.muted, "font-weight:600;")}</td>`;

  const tableRows = rows
    .map(
      (r) => `<tr>
<td style="padding:10px 12px 10px 0;border-top:1px solid ${C.line};">${para(esc(rowLabel(r)), 15, C.night)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0EB;border-radius:4px;margin-top:6px;"><tr><td width="${Math.max(1, Math.round((r.everyone / widest) * 100))}%" style="background:${C.teal};height:5px;font-size:0;line-height:0;border-radius:4px;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
<td width="76" align="right" valign="top" style="padding:10px 0;border-top:1px solid ${C.line};">${para(String(r.everyone), 15, C.night, "font-weight:700;")}</td>
<td width="76" align="right" valign="top" style="padding:10px 0;border-top:1px solid ${C.line};">${para("afterTheCheck" in r ? "–" : String(r.flyer), 15, C.body)}</td>
</tr>`,
    )
    .join("");

  const html = emailDoc(`${headerRow(`Fit check counts · ${day}`, `${opened} ${opened === 1 ? "person" : "people"} opened the check`, "Numbers only. No names.")}
${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${figure(opened, "opened the check")}${figure(sent, "got their report")}${figure(count(rows, "book"), "clicked to book")}</tr></table>`)}
${dropLine ? section(stoneCard(para(esc(dropLine), 15, C.night, `font-family:${FONT};font-weight:600;`)), "20px 32px 0") : ""}
${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${headCell("Step", "left")}${headCell("Everyone", "right")}${headCell("From flyer", "right")}</tr>${tableRows}</table>`, "24px 32px 8px")}`);

  const text = [
    `Fit check counts for ${day}`,
    "Numbers only. No names.",
    "",
    ...(dropLine ? [dropLine, ""] : []),
    ...rows.map((r) => `${rowLabel(r)}: ${r.everyone}${"afterTheCheck" in r ? "" : ` (flyer ${r.flyer})`}`),
    "",
    "From flyer counts people who came through the flyer's QR code. The report page and booking clicks can't be split that way.",
  ].join("\n");

  return { subject: `Fit check counts for ${day}: ${opened} opened, ${sent} sent`, text, html };
}

/** The morning job: yesterday's numbers to the team, but only if anyone took the check. */
export async function sendDailyCounts(store: CountStore, services: { alertTo: string[]; sendMail(mail: Mail): Promise<void> }, now = new Date()) {
  const date = yesterdayInGaborone(now);
  const entries = await store.entriesFor(date);
  if (entries.length === 0) return;
  await services.sendMail({ to: services.alertTo, ...countsEmail(date, entries) });
}
