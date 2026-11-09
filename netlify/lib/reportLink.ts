// The link in the report email. It carries the check's answers and is stamped with
// a secret only the server knows, so a changed link can't pass. Nothing is stored:
// the link is the only copy. It never holds a name, email or phone number.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { fitCheckAnswers, type FitCheckAnswers } from "../../src/lib/fitCheck/questions.ts";
import { readVisitorJson, reply } from "./intake.ts";

const SIX_MONTHS_SECONDS = 183 * 24 * 60 * 60;
const MAX_TOKEN_LENGTH = 8_000;

const stamp = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("base64url");
const toSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

export function createReportToken(answers: FitCheckAnswers, secret: string, now: Date): string {
  // The name of another system is free text, and the report doesn't use it.
  const kept = { ...answers };
  delete kept.otherSystem;
  const body = Buffer.from(JSON.stringify({ a: kept, i: toSeconds(now) })).toString("base64url");
  return `${body}.${stamp(body, secret)}`;
}

const contents = z.object({ a: fitCheckAnswers, i: z.number().int().positive() }).strict();

/** The answers inside a real, unexpired link, or null for anything else. */
export function readReportToken(token: string, secret: string, now: Date): { answers: FitCheckAnswers; issuedAt: Date } | null {
  if (token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, given] = parts;
  const expected = Buffer.from(stamp(body, secret));
  const actual = Buffer.from(given);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
  const checked = contents.safeParse(parsed);
  if (!checked.success || toSeconds(now) - checked.data.i > SIX_MONTHS_SECONDS) return null;
  return { answers: checked.data.a, issuedAt: new Date(checked.data.i * 1000) };
}

const request = z.object({ token: z.string() }).strict();

export async function handleReport(incoming: Request, secret: string | undefined, now = new Date()): Promise<Response> {
  const intake = await readVisitorJson(incoming);
  if (!intake.ok) return intake.response;
  if (!secret) console.error("report link refused: REPORT_LINK_SECRET isn't set");
  const parsed = request.safeParse(intake.body);
  const report = parsed.success && secret ? readReportToken(parsed.data.token, secret, now) : null;
  if (!report) return reply(400, false);
  return Response.json({ ok: true, answers: report.answers, issuedAt: report.issuedAt.toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
