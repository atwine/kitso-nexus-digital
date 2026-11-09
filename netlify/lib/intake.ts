// What every public form goes through before its contents are looked at.
import { createHash } from "node:crypto";
import { ConfigError } from "./config.ts";
import type { LeadToSave, Services } from "./services.ts";

const MAX_BODY_BYTES = 64 * 1024;

export const reply = (status: number, ok: boolean, headers?: Record<string, string>) => Response.json({ ok }, { status, headers });

/** The lead is saved, but a daily email limit stopped its emails. */
export const heldBack = () => Response.json({ ok: false, heldBack: true }, { status: 429 });

export type Intake = { ok: true; body: unknown } | { ok: false; response: Response };

/** Only a same-site JSON POST of a sensible size gets through. */
export async function readVisitorJson(request: Request): Promise<Intake> {
  const refuse = (status: number, headers?: Record<string, string>): Intake => ({ ok: false, response: reply(status, false, headers) });
  if (request.method !== "POST") return refuse(405, { Allow: "POST" });
  if (request.headers.get("origin") !== new URL(request.url).origin) return refuse(403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return refuse(415);
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return refuse(413);
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return refuse(400);
  }
}

/**
 * Says what went wrong without saying whose details were involved. Error messages
 * from mail servers can quote addresses, so only the error's type is kept.
 */
export function logFailure(step: string, error: unknown) {
  // Built to name settings and never their values, so it's safe to print.
  if (error instanceof ConfigError) {
    console.error(`${step} failed: ${error.message}`);
    return;
  }
  const status = typeof error === "object" && error !== null && "status" in error ? ` (${String(error.status)})` : "";
  const rawCode = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  const code = typeof rawCode === "string" && /^[A-Z][A-Z0-9_]{1,40}$/.test(rawCode) ? ` ${rawCode}` : "";
  console.error(`${step} failed: ${error instanceof Error ? error.name : "unknown error"}${status}${code}`);
}

/** A short code for this exact item, so a repeat send can be recognised. */
export const referenceFor = (...parts: string[]) => `Reference: ${createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 12)}`;

export type SaveResult = { status: "saved"; id: number } | { status: "repeat" } | { status: "failed" };

/** Saves a lead in Odoo, once. A failure is reported back, never thrown. */
export async function saveOnce(services: Services, lead: LeadToSave, reference: string, step: string): Promise<SaveResult> {
  try {
    if (await services.alreadyReceived(lead.email, reference)) return { status: "repeat" };
    return { status: "saved", id: await services.saveLead(lead) };
  } catch (error) {
    logFailure(`${step}: saving to Odoo`, error);
    return { status: "failed" };
  }
}

export const HAND_ENTRY = "[Add to Odoo by hand]";

// Keeps one person from flooding a stranger's inbox, and keeps total sends well
// under the Gmail account's daily limit (owner's decision, 2026-11-09).
export const REPORTS_PER_ADDRESS_PER_DAY = 3;
export const WEBSITE_LEADS_PER_DAY = 600;

/** Whether this lead is over the limits for sending email. Not being able to tell never stops a real visitor. */
export async function overEmailLimit(services: Services, email: string | null, step: string): Promise<boolean> {
  try {
    const { forAddress, total } = await services.recentLeadCounts(email);
    const overSite = total > WEBSITE_LEADS_PER_DAY;
    if (!overSite && forAddress <= REPORTS_PER_ADDRESS_PER_DAY) return false;
    console.error(`${step}: email held back, over the daily limit for ${overSite ? "the whole site" : "one address"}`);
    return true;
  } catch (error) {
    logFailure(`${step}: reading the email limits`, error);
    return false;
  }
}
