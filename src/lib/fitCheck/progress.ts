// Keeps a visitor's fit check answers in their own browser, so a reload, a
// closed tab or a lost signal doesn't lose their work. Also keeps where they came
// from, so that label is still there when they finish. Names, emails and phone
// numbers are never saved here, and nothing leaves the device.

import type { ZodType } from "zod";
import { fitCheckAnswers } from "./questions.ts";

const KEY = "kitso-fit-check-progress";
const RUN_KEY = "kitso-fit-check-run";
const KEEP_FOR_MS = 14 * 24 * 60 * 60 * 1000;
const SOURCE = /^[a-z0-9-]{1,30}$/;

type Answer = string | number | string[];
export type SavedDraft = Record<string, Answer | undefined>;
export type Progress = { draft: SavedDraft; source: string | null };

const ANSWER_RULES = new Map(Object.entries(fitCheckAnswers.shape as unknown as Record<string, ZodType>));

// Saved data could be old or edited by hand, so only answers the check would still accept come back.
const cleanDraft = (draft: Record<string, unknown>): SavedDraft =>
  Object.fromEntries(Object.entries(draft).filter(([key, value]) => ANSWER_RULES.get(key)?.safeParse(value).success)) as SavedDraft;

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

// The label a flyer's QR code carries, such as ?from=flyer. Anything untidy is ignored.
export const sourceFromSearch = (search: string): string | null => {
  const source = new URLSearchParams(search).get("from");
  return source && SOURCE.test(source) ? source : null;
};

export const clearProgress = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage is blocked, so there's nothing to clear.
  }
};

export const saveProgress = ({ draft, source }: Progress, now = Date.now()) => {
  if (Object.keys(draft).length === 0 && !source) {
    clearProgress();
    return;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ savedAt: now, draft, source }));
  } catch {
    // Storage is blocked or full. The check still works; it just can't be resumed.
  }
};

export const loadProgress = (now = Date.now()): Progress | null => {
  try {
    const raw = window.localStorage.getItem(KEY);
    const saved: unknown = raw ? JSON.parse(raw) : null;
    if (!isPlainObject(saved) || typeof saved.savedAt !== "number" || !isPlainObject(saved.draft)) return null;
    if (now - saved.savedAt >= KEEP_FOR_MS) {
      clearProgress();
      return null;
    }
    const source = typeof saved.source === "string" && SOURCE.test(saved.source) ? saved.source : null;
    return { draft: cleanDraft(saved.draft), source };
  } catch {
    return null;
  }
};

// Identifies this tab's run through the check, so a reload stays on the same
// screen while a new visit begins at the start.
export const tabRunId = (): string => {
  const fresh = Math.random().toString(36).slice(2);
  try {
    const existing = window.sessionStorage.getItem(RUN_KEY);
    if (existing) return existing;
    window.sessionStorage.setItem(RUN_KEY, fresh);
  } catch {
    // Storage is blocked, so a reload begins at the start.
  }
  return fresh;
};
