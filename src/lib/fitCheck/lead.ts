// What a finished fit check hands to the server: the answers, the person's details,
// and where they came from (such as "flyer", or null for a typed address or a link).
import { postOutcome, type PostOutcome } from "../postConfirmed.ts";
import type { FitCheckDetails } from "./details.ts";

export interface FitCheckLead {
  answers: Record<string, unknown>;
  details: FitCheckDetails;
  source: string | null;
  /** Spam trap: a hidden box people never see. */
  website: string;
}

export const FIT_CHECK_ENDPOINT = "/api/fit-check";

// Longer than the Contact form's: this one also saves a call task and sends a report.
const SEND_TIMEOUT_MS = 25_000;

/** Sends the finished check and says what the server made of it. */
export const sendFitCheckLead = (lead: FitCheckLead, fetchImpl: typeof fetch = fetch): Promise<PostOutcome> =>
  postOutcome(FIT_CHECK_ENDPOINT, lead, SEND_TIMEOUT_MS, fetchImpl);
