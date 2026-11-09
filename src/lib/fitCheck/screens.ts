// The fit check's question screens, in order, with their words. Answers and
// their numbers live in questions.ts; this file only says what each screen asks.
// Screens 1–5 are about the business; screens 6–11 ask about one area each and
// may ask two or three things. Diary and Stock appear only for some business
// types. "When do you want this sorted?" is asked on the result screen.

import * as Q from "./questions.ts";
import { asksDiary, asksStock, type Choice, type FitCheckAnswers } from "./questions.ts";

export type AnswerKey = Exclude<keyof FitCheckAnswers, "hourlyRate" | "timing" | "otherSystem">;
export type PulaKey = "typicalSale" | "bookingValue";
export type TickKey = "businessTypes" | "mainTools";

type Words = { label?: string; help?: string }; // label and help for the 2nd and 3rd questions

export type Field = Words &
  (
    | { key: AnswerKey; kind: "list"; options: readonly Choice[] } // big radio rows
    | { key: AnswerKey; kind: "grid"; options: readonly Choice[] } // two-column tiles
    | { key: AnswerKey; kind: "pills"; options: readonly Choice[] } // small chips
    | { key: TickKey; kind: "ticks"; options: readonly Choice[]; otherId?: string } // tick all that apply
    | { key: PulaKey; kind: "pula" } // an amount in Pula
  );

export interface Screen {
  id: string;
  eyebrow: string;
  title: string; // the first field's question
  help?: string;
  fields: [Field, ...Field[]];
  when?: (businessTypes: readonly string[]) => boolean;
}

export const ABOUT = "About your business";

export const SCREENS: Screen[] = [
  {
    id: "businessTypes",
    eyebrow: ABOUT,
    title: "What kind of business do you run?",
    help: "Tick all that apply.",
    fields: [{ key: "businessTypes", kind: "ticks", options: Q.BUSINESS_TYPES }],
  },
  {
    id: "teamSize",
    eyebrow: ABOUT,
    title: "How many people work in the business, including you?",
    fields: [{ key: "teamSize", kind: "grid", options: Q.TEAM_SIZES }],
  },
  {
    id: "cipa",
    eyebrow: ABOUT,
    title: "Is your business registered?",
    help: "In Botswana, that's with CIPA, the Companies and Intellectual Property Authority. It helps us tailor your report.",
    fields: [{ key: "cipa", kind: "list", options: Q.CIPA }],
  },
  {
    id: "mainTools",
    eyebrow: ABOUT,
    title: "What do you use to run the business today?",
    help: "Tick all that apply.",
    fields: [{ key: "mainTools", kind: "ticks", options: Q.MAIN_TOOLS, otherId: "other-system" }],
  },
  {
    id: "decider",
    eyebrow: ABOUT,
    title: "Are you the one who makes the final decision on new systems?",
    fields: [{ key: "decider", kind: "list", options: Q.DECIDER }],
  },
  {
    id: "missedSales",
    eyebrow: "Missed sales",
    title: "How many enquiries come in each month?",
    help: "Calls, WhatsApps, walk-ins and emails. A rough guess is fine.",
    fields: [
      { key: "enquiries", kind: "grid", options: Q.ENQUIRIES },
      { key: "goneCold", kind: "pills", options: Q.GONE_COLD, label: "How many go cold without a follow-up?" },
      { key: "typicalSale", kind: "pula", label: "If one of those enquiries had become a sale, how much would the customer usually pay?" },
    ],
  },
  {
    id: "gettingPaid",
    eyebrow: "Getting paid",
    title: "Roughly what are your sales in a year?",
    help: "Your best guess. Nobody checks.",
    fields: [
      { key: "yearlySales", kind: "list", options: Q.YEARLY_SALES },
      {
        key: "daysToPay",
        kind: "pills",
        options: Q.DAYS_TO_PAY,
        label: "How long do customers usually take to pay?",
        help: "Money customers still owe you is money you can't use. The longer they take, the more it costs you.",
      },
      { key: "invoiceMistakes", kind: "pills", options: Q.INVOICE_MISTAKES, label: "How often does an invoice go out wrong?" },
    ],
  },
  {
    id: "diary",
    eyebrow: "Bookings and appointments",
    title: "How many bookings or appointments a month?",
    help: "Jobs, visits, sessions or consultations.",
    fields: [
      { key: "bookings", kind: "grid", options: Q.BOOKINGS },
      { key: "missedBookings", kind: "pills", options: Q.MISSED_BOOKINGS, label: "How many are missed, forgotten or double-booked?" },
      { key: "bookingValue", kind: "pula", label: "When one of those bookings is lost, how much money do you lose?", help: "Usually what the customer would have paid for it." },
    ],
    when: asksDiary,
  },
  {
    id: "betweenApps",
    eyebrow: "Time lost between apps",
    title: "How many apps, spreadsheets or notebooks hold your business data?",
    help: "Count WhatsApp, Excel, your accounting package, notebooks: anything you copy from.",
    fields: [
      { key: "appCount", kind: "grid", options: Q.APP_COUNT },
      {
        key: "adminPeople",
        kind: "pills",
        options: Q.ADMIN_PEOPLE,
        label: "How many people do admin, like typing up orders or invoices?",
        help: "We multiply this by the hours below to find your team's lost time.",
      },
      { key: "adminHours", kind: "pills", options: Q.ADMIN_HOURS, label: "How many hours a week does each spend retyping or searching?" },
    ],
  },
  {
    id: "stock",
    eyebrow: "Stock",
    title: "Roughly what is your stock worth?",
    help: "Not sure? Pick \"I don't know\" and we'll estimate it from your sales.",
    fields: [
      { key: "stockValue", kind: "grid", options: Q.STOCK_VALUE },
      { key: "stockProblems", kind: "pills", options: Q.STOCK_PROBLEMS, label: "How often do you run out of something, or order too much?" },
    ],
    when: asksStock,
  },
  {
    id: "reports",
    eyebrow: "Reports and mistakes",
    title: "How long do last month's numbers take to put together?",
    fields: [
      { key: "reportTime", kind: "grid", options: Q.REPORT_TIME },
      { key: "reportConfidence", kind: "pills", options: Q.REPORT_CONFIDENCE, label: "How sure are you that they're right?" },
    ],
  },
];

// The screens this visitor sees, given the business types they ticked.
export const screensFor = (businessTypes: readonly string[] | undefined): Screen[] =>
  SCREENS.filter((s) => !s.when || s.when(businessTypes ?? []));

export const MAX_SCREENS = SCREENS.length;

export const SECONDS_PER_SCREEN = 20;

export const minutesLeft = (screensLeft: number) => Math.max(1, Math.round((screensLeft * SECONDS_PER_SCREEN) / 60));
