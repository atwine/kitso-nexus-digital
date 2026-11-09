// Asks the server what's inside a report link.
import { z } from "zod";
import { fitCheckAnswers, type FitCheckAnswers } from "./questions.ts";

const TIMEOUT_MS = 15_000;

const serverReply = z.object({ ok: z.literal(true), answers: fitCheckAnswers, issuedAt: z.string() });

export type ReportLookup =
  | { status: "ready"; answers: FitCheckAnswers; issuedAt: Date }
  /** The server looked and said no: expired, altered or made up. */
  | { status: "invalid" }
  /** No proper answer, so the link may be fine. */
  | { status: "unreachable" };

export const loadReport = async (token: string): Promise<ReportLookup> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
    if (response.status >= 500) return { status: "unreachable" };
    if (!response.ok) return { status: "invalid" };
    const checked = serverReply.safeParse(await response.json());
    return checked.success ? { status: "ready", answers: checked.data.answers, issuedAt: new Date(checked.data.issuedAt) } : { status: "invalid" };
  } catch {
    return { status: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
};
