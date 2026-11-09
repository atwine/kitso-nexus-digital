// Adds one to a step of the drop-off counter. No names and no cookies. The list of
// steps already counted lives only in this tab, so going back or reloading doesn't
// count twice. Counting must never get in the visitor's way, so failures are ignored.
import type { CountStepId } from "./countSteps.ts";

const KEY = "kitso-fit-check-counted";

const alreadyCounted = (): string[] => {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const countStep = (step: CountStepId, source: string | null) => {
  const counted = alreadyCounted();
  if (counted.includes(step)) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify([...counted, step]));
    fetch("/api/count", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ step, source }), keepalive: true }).catch(() => {});
  } catch {
    // Storage or the network is blocked. The count is just one lower.
  }
};

/** The next person on a shared tablet counts as someone new. */
export const forgetCounted = () => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Storage is blocked, so there's nothing to forget.
  }
};
