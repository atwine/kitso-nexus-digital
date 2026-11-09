// Honest advice for someone Odoo isn't right for yet, based on what their own
// answers show (owner, 5 Nov 2026: "advise accordingly", and don't be salesy).
// Plain text only, so the screens and the emailed report can share it.

import { CUSTOM_SOFTWARE_FROM_BAND, salesAtLeast, type AreaId, type FitCheckResult, type NotYetReason } from "./calculate.ts";
import type { FitCheckAnswers } from "./questions.ts";

export interface Advice {
  why: string;
  steps: string[];
  comeBackWhen: string[];
  customSoftware: boolean;
}

type StatedReason = Exclude<NotYetReason, "already-covered" | "little-at-stake">;
const isStated = (r: NotYetReason): r is StatedReason => r !== "already-covered" && r !== "little-at-stake";

const WHY: Record<StatedReason, string> = {
  "not-registered": "your business isn't registered yet",
  solo: "you're running it on your own",
  "small-sales": "at your current sales, the yearly cost of a full system would take more than it gives back",
  "few-sales": "your money comes from a few big sales a year, so a monthly system bill would be hard to carry",
};

// Only said when nothing bigger stands in the way, so the explanation stays short.
const LITTLE_AT_STAKE = "what you're losing is too small for a full system to pay for itself";

const STEP_FOR_AREA: Record<AreaId, string> = {
  missedSales: "Keep every enquiry in one Excel or Google Sheets list, and reply the same day.",
  gettingPaid: "Send each invoice the day the work is done, take a deposit up front, and follow up every week.",
  diary: "Put every booking in a free calendar such as Google Calendar, with a reminder the day before. A simple website can take bookings for you.",
  betweenApps: "Pick one spreadsheet as your master list, so nothing gets typed twice.",
  stock: "Count your stock once a month in a simple spreadsheet, and set a level that tells you when to reorder.",
  reports: "Keep a one-page summary of your sales, costs and money owed each month.",
};

const sentence = (parts: string[]) => {
  const list = parts.length < 2 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `Right now, ${list}.`;
};

export function adviceFor(a: FitCheckAnswers, result: FitCheckResult): Advice {
  const reasons = result.notYetReasons;

  if (reasons.length === 1 && reasons[0] === "already-covered") {
    return {
      why: "Right now, you already run on one proper system. Replacing it is a big step, and you may not need to.",
      steps: ["Keep what you have, and ask its supplier whether it can close any gaps shown here.", "Take this check again if you add a branch, a new line of business or more staff."],
      comeBackWhen: [],
      customSoftware: salesAtLeast(a, CUSTOM_SOFTWARE_FROM_BAND),
    };
  }

  const fromAreas = result.weakestTwo.map((area) => STEP_FOR_AREA[area.id]);
  const steps = [...(reasons.includes("not-registered") ? ["Register your business with CIPA."] : []), ...fromAreas];
  const comeBackWhen = [
    ...(reasons.includes("solo") ? ["You've hired your first staff member."] : []),
    ...(reasons.includes("small-sales") ? ["Your sales have grown enough for a system to pay for itself."] : []),
    ...(reasons.includes("few-sales") ? ["Your income is steady from month to month."] : []),
    "You're juggling several tools and things are still slipping.",
  ];
  const stated = reasons.filter(isStated).map((r) => WHY[r]);
  return {
    why: `${sentence(stated.length > 0 ? stated : [LITTLE_AT_STAKE])} Odoo could solve these problems, but it isn't the right spend yet.`,
    steps: steps.length > 0 ? steps : ["Keep using what you have, because it's working."],
    comeBackWhen,
    customSoftware: false,
  };
}
