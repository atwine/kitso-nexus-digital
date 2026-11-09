// The fit check's questions, their answer options, and the one number each
// answer stands for in the maths. Drafted on Paper page "I · Fit check (draft)",
// settled with the owner on 4 Nov 2026:
// - a range counts as its middle; an open range ("Over 100") as 1.5 × its edge
// - business types (tick all that apply) decide who sees Diary and Stock
// - "how many apps hold your data" sets the share of admin time saved
// Changed after the owner tried the screens (4 Nov): business types and tools
// are tick-all-that-apply, "how unusual" is gone, the timing question moved to
// the result screen, and stock has an "I don't know".
//
// Plain data and a zod check only, so the screens (Sprint 9) and the server
// (Sprint 11) share it. The server re-checks every answer with `fitCheckAnswers`.

import { z } from "zod";
import { INDUSTRIES } from "../../data/industries.ts";
import { plainText } from "./text.ts";

export interface Choice {
  id: string;
  label: string;
}

export interface Band extends Choice {
  value: number;
}

export interface ShareBand extends Choice {
  low: number;
  high: number;
}

export const BUSINESS_TYPES: Choice[] = [
  ...INDUSTRIES.map((i) => ({ id: i.id, label: i.aboutName ?? i.name })),
  // Kitso's first audience (owner, 5 Nov 2026). It doesn't change the verdict: it
  // tells the sales representative, who can put these firms first.
  { id: "engineering", label: "Engineering" },
  { id: "other", label: "Other" },
];

const DIARY_TYPES = new Set(["professional-services", "equipment", "other"]);
const STOCK_TYPES = new Set(["retail", "manufacturing", "equipment", "construction", "engineering", "other"]);

// Someone who ticks several types sees a question if any of them needs it.
export const asksDiary = (types: readonly string[]) => types.some((t) => DIARY_TYPES.has(t));
export const asksStock = (types: readonly string[]) => types.some((t) => STOCK_TYPES.has(t));

export const TEAM_SIZES = [
  { id: "1", label: "Just me", value: 1 },
  { id: "2-5", label: "2–5", value: 3.5 },
  { id: "6-20", label: "6–20", value: 13 },
  { id: "21-50", label: "21–50", value: 35.5 },
  { id: "51-200", label: "51–200", value: 125.5 },
  { id: "200+", label: "200+", value: 300 },
] as const satisfies readonly Band[];

export const CIPA = [
  { id: "yes", label: "Yes, with CIPA in Botswana" },
  { id: "other-country", label: "Yes, in another country" },
  { id: "in-progress", label: "Registration is in progress" },
  { id: "no", label: "Not yet" },
] as const satisfies readonly Choice[];

// Tick all that apply. "Another system" opens a box to name it.
export const MAIN_TOOLS = [
  { id: "paper", label: "Paper" },
  { id: "spreadsheets", label: "Excel or Google Sheets" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "pastel-sage", label: "Pastel or Sage" },
  { id: "quickbooks-xero", label: "QuickBooks or Xero" },
  { id: "other-system", label: "Another system" },
] as const satisfies readonly Choice[];

// Asked on the result screen, once people have seen what they lose.
export const TIMING = [
  { id: "now", label: "Now" },
  { id: "3-months", label: "Within 3 months" },
  { id: "this-year", label: "This year" },
  { id: "exploring", label: "Just exploring" },
] as const satisfies readonly Choice[];

export const DECIDER = [
  { id: "me", label: "Yes, it's my call" },
  { id: "partner", label: "Yes, but others have a say" },
  { id: "someone-else", label: "No, someone else decides" },
] as const satisfies readonly Choice[];

export const ENQUIRIES = [
  { id: "under-10", label: "Under 10", value: 5 },
  { id: "10-30", label: "10 to 30", value: 20 },
  { id: "30-100", label: "30 to 100", value: 65 },
  { id: "over-100", label: "Over 100", value: 150 },
] as const satisfies readonly Band[];

export const GONE_COLD = [
  { id: "none", label: "None", value: 0 },
  { id: "a-few", label: "A few", value: 0.1 },
  { id: "quarter", label: "About a quarter", value: 0.25 },
  { id: "half", label: "Half or more", value: 0.75 },
] as const satisfies readonly Band[];

export const YEARLY_SALES = [
  { id: "under-500k", label: "Under P500,000", value: 250_000 },
  { id: "500k-2m", label: "P500,000 to P2 million", value: 1_250_000 },
  { id: "2m-10m", label: "P2 million to P10 million", value: 6_000_000 },
  { id: "10m-50m", label: "P10 million to P50 million", value: 30_000_000 },
  { id: "over-50m", label: "Over P50 million", value: 75_000_000 },
] as const satisfies readonly Band[];

export const DAYS_TO_PAY = [
  { id: "under-30", label: "Under 30 days", value: 15 },
  { id: "30-60", label: "30 to 60 days", value: 45 },
  { id: "60-90", label: "60 to 90 days", value: 75 },
  { id: "over-90", label: "Over 90 days", value: 135 },
] as const satisfies readonly Band[];

// Asked, saved in the Odoo notes for the call; no Pula figure uses them.
export const INVOICE_MISTAKES = [
  { id: "rarely", label: "Rarely" },
  { id: "sometimes", label: "Now and then" },
  { id: "often", label: "Often" },
] as const satisfies readonly Choice[];

export const BOOKINGS = [
  { id: "under-20", label: "Under 20", value: 10 },
  { id: "20-50", label: "20 to 50", value: 35 },
  { id: "50-150", label: "50 to 150", value: 100 },
  { id: "over-150", label: "Over 150", value: 225 },
] as const satisfies readonly Band[];

export const MISSED_BOOKINGS = [
  { id: "none", label: "None", value: 0 },
  { id: "a-few", label: "A few", value: 0.05 },
  { id: "one-in-ten", label: "About 1 in 10", value: 0.1 },
  { id: "one-in-five", label: "1 in 5 or more", value: 0.3 },
] as const satisfies readonly Band[];

export const ADMIN_PEOPLE = [
  { id: "1", label: "1", value: 1 },
  { id: "2-3", label: "2 or 3", value: 2.5 },
  { id: "4-6", label: "4 to 6", value: 5 },
  { id: "7+", label: "7 or more", value: 10.5 },
] as const satisfies readonly Band[];

export const ADMIN_HOURS = [
  { id: "under-2", label: "Under 2 hours", value: 1 },
  { id: "2-5", label: "2 to 5 hours", value: 3.5 },
  { id: "5-10", label: "5 to 10 hours", value: 7.5 },
  { id: "over-10", label: "Over 10 hours", value: 15 },
] as const satisfies readonly Band[];

export const APP_COUNT = [
  { id: "1", label: "1", low: 0.2, high: 0.3 },
  { id: "2-3", label: "2 or 3", low: 0.4, high: 0.6 },
  { id: "4-6", label: "4 to 6", low: 0.5, high: 0.7 },
  { id: "7+", label: "7 or more", low: 0.6, high: 0.8 },
] as const satisfies readonly ShareBand[];

export const STOCK_VALUE = [
  { id: "under-100k", label: "Under P100,000", value: 50_000 },
  { id: "100k-500k", label: "P100,000 to P500,000", value: 300_000 },
  { id: "500k-2m", label: "P500,000 to P2 million", value: 1_250_000 },
  { id: "over-2m", label: "Over P2 million", value: 3_000_000 },
  // Estimated from yearly sales instead (STOCK_FROM_SALES in calculate.ts).
  { id: "unknown", label: "I don't know", value: 0 },
] as const satisfies readonly Band[];

export const STOCK_PROBLEMS = [
  { id: "rarely", label: "Rarely", value: 0.05 },
  { id: "monthly", label: "Every month", value: 0.1 },
  { id: "weekly", label: "Every week", value: 0.2 },
] as const satisfies readonly Band[];

export const REPORT_TIME = [
  { id: "day", label: "A day or less", value: 4 },
  { id: "few-days", label: "A few days", value: 8 },
  { id: "week", label: "About a week", value: 16 },
  { id: "month", label: "A month or more", value: 32 },
] as const satisfies readonly Band[];

// Asked, saved in the Odoo notes for the call; no Pula figure uses them.
export const REPORT_CONFIDENCE = [
  { id: "sure", label: "Very sure" },
  { id: "fairly", label: "Fairly sure" },
  { id: "unsure", label: "Not sure" },
] as const satisfies readonly Choice[];

const oneOf = <const T extends readonly Choice[]>(options: T) =>
  z.enum(options.map((o) => o.id) as [T[number]["id"], ...T[number]["id"][]]);
// "+ 0" turns a crafted -0 into 0, so a figure never prints as "P-0".
const pula = z.number().finite().min(0).max(10_000_000).transform((n) => n + 0);

export const otherSystemName = plainText(80, "Please name the system");
const ticks = <const T extends readonly Choice[]>(options: T) =>
  z
    .array(oneOf(options))
    .min(1)
    .max(options.length)
    .refine((ids) => new Set(ids).size === ids.length, "Each answer once");

// The hourly cost of staff time, which visitors may change. P1 to P1,000.
export const HOURLY_RATE_LIMITS = { min: 1, max: 1_000 } as const;

export const fitCheckAnswers = z
  .object({
    businessTypes: ticks(BUSINESS_TYPES),
    teamSize: oneOf(TEAM_SIZES),
    cipa: oneOf(CIPA),
    mainTools: ticks(MAIN_TOOLS),
    otherSystem: otherSystemName.optional(),
    decider: oneOf(DECIDER),
    timing: oneOf(TIMING).optional(),

    enquiries: oneOf(ENQUIRIES),
    goneCold: oneOf(GONE_COLD),
    typicalSale: pula,

    yearlySales: oneOf(YEARLY_SALES),
    daysToPay: oneOf(DAYS_TO_PAY),
    invoiceMistakes: oneOf(INVOICE_MISTAKES),

    bookings: oneOf(BOOKINGS).optional(),
    missedBookings: oneOf(MISSED_BOOKINGS).optional(),
    bookingValue: pula.optional(),

    adminPeople: oneOf(ADMIN_PEOPLE),
    adminHours: oneOf(ADMIN_HOURS),
    appCount: oneOf(APP_COUNT),

    stockValue: oneOf(STOCK_VALUE).optional(),
    stockProblems: oneOf(STOCK_PROBLEMS).optional(),

    reportTime: oneOf(REPORT_TIME),
    reportConfidence: oneOf(REPORT_CONFIDENCE),

    hourlyRate: z.number().finite().min(HOURLY_RATE_LIMITS.min).max(HOURLY_RATE_LIMITS.max).optional(),
  })
  .strict()
  .superRefine((a, ctx) => {
    const need = (key: keyof typeof a) => {
      if (a[key] === undefined) ctx.addIssue({ code: "custom", path: [key], message: "Required for this business type" });
    };
    if (asksDiary(a.businessTypes)) (["bookings", "missedBookings", "bookingValue"] as const).forEach(need);
    if (asksStock(a.businessTypes)) (["stockValue", "stockProblems"] as const).forEach(need);
    if (a.otherSystem !== undefined && !a.mainTools.includes("other-system")) {
      ctx.addIssue({ code: "custom", path: ["otherSystem"], message: "Only with 'Another system' ticked" });
    }
  });

export type FitCheckAnswers = z.infer<typeof fitCheckAnswers>;

export function bandOf<T extends Choice>(options: readonly T[], id: string): T {
  const found = options.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown answer "${id}"`);
  return found;
}
