export type PostOutcome = "confirmed" | "held-back" | "failed";

// Sends JSON to one of the site's server functions. "confirmed" only when the server
// says {"ok": true}. "held-back" when it saved the item but a daily email limit stopped
// the emails. Anything else (an error, a timeout, or the site's own page served back by
// the fallback rule) counts as not sent, so a form never claims something arrived when
// it didn't.
export const postOutcome = async (endpoint: string, body: unknown, timeoutMs: number, fetchImpl: typeof fetch = fetch): Promise<PostOutcome> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.headers.get("content-type")?.includes("application/json")) return "failed";
    const reply: unknown = await response.json();
    if (typeof reply !== "object" || reply === null) return "failed";
    if (response.ok && (reply as { ok?: unknown }).ok === true) return "confirmed";
    return response.status === 429 && (reply as { heldBack?: unknown }).heldBack === true ? "held-back" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timer);
  }
};

/** True only when the server confirms it has the item. */
export const postConfirmed = async (endpoint: string, body: unknown, timeoutMs: number, fetchImpl: typeof fetch = fetch): Promise<boolean> =>
  (await postOutcome(endpoint, body, timeoutMs, fetchImpl)) === "confirmed";
