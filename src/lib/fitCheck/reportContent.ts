// What a fit check report says, in one place: the email (netlify/lib/report.ts)
// and the report page (src/pages/FitReport.tsx) draw the same words.
import { CONSULTATION_MINUTES } from "../contact.ts";
import { adviceFor } from "./advice.ts";
import { areasWithCost, type AreaId, type AreaResult, type FitCheckResult, type Severity } from "./calculate.ts";
import * as Q from "./questions.ts";
import type { FitCheckAnswers } from "./questions.ts";

const P = (n: number) => `P${Math.round(n).toLocaleString("en-GB")}`;
const money = ({ low, high }: { low: number; high: number }) => (low === high ? `About ${P(low)}` : low === 0 ? `Up to ${P(high)}` : `${P(low)} to ${P(high)}`);
const worth = (range: { low: number; high: number }) => money(range).replace("About ", "");
const hours = ({ low, high }: { low: number; high: number }) => (low === high ? `${low} hour${low === 1 ? "" : "s"}` : `${low} to ${high} hours`);
const value = (options: readonly Q.Band[], id: string) => Q.bandOf(options, id).value;

export const verdictPill = ({ verdict, notYetReasons }: Pick<FitCheckResult, "verdict" | "notYetReasons">, decider?: string) => {
  if (verdict === "strong-fit") return "Odoo is a strong fit for you";
  if (verdict === "fit") return decider === "someone-else" ? "Odoo can help" : "Odoo can help. Start small";
  const alreadySorted = notYetReasons.every((r) => r === "little-at-stake" || r === "already-covered");
  return alreadySorted ? "You may not need Odoo right now" : "Not yet. Start simpler first";
};

function story(area: AreaResult, a: FitCheckAnswers): string {
  switch (area.id) {
    case "missedSales": {
      const all = value(Q.ENQUIRIES, a.enquiries);
      const cold = Math.round(all * value(Q.GONE_COLD, a.goneCold));
      return `About ${cold} of your ${all} monthly enquiries go cold before anyone follows up. Winning back 20 to 30% of them is worth this much.`;
    }
    case "gettingPaid": {
      const days = value(Q.DAYS_TO_PAY, a.daysToPay);
      const stuck = (value(Q.YEARLY_SALES, a.yearlySales) * Math.max(0, days - 30)) / 365;
      return `Customers take about ${days} days to pay, so about ${P(Math.round(stuck / 10_000) * 10_000)} sits in their bank instead of yours. Borrowing that costs this much.`;
    }
    case "diary": {
      const all = value(Q.BOOKINGS, a.bookings!);
      const share = value(Q.MISSED_BOOKINGS, a.missedBookings!);
      const amount = P(a.bookingValue!);
      return all * share >= 1
        ? `About ${Math.round(all * share)} of your ${all} monthly bookings are missed, forgotten or double-booked, at ${amount} each.`
        : `About 1 in ${Math.round(1 / share)} of your monthly bookings is missed or forgotten, at ${amount} each.`;
    }
    case "betweenApps": {
      const each = Q.bandOf(Q.ADMIN_HOURS, a.adminHours).label.toLowerCase();
      const who = a.teamSize === "1" ? "You spend" : a.adminPeople === "1" ? "One person spends" : `${Q.bandOf(Q.ADMIN_PEOPLE, a.adminPeople).label} people each spend`;
      const where = a.appCount === "1" ? "on retyping and searching" : `retyping between ${Q.bandOf(Q.APP_COUNT, a.appCount).label} apps`;
      return `${who} ${each} a week ${where}. One system would save ${hours(area.hoursPerWeek)} of that.`;
    }
    case "stock": {
      const how = { rarely: "now and then", monthly: "about once a month", weekly: "most weeks" }[a.stockProblems!];
      return `You run out of something, or order too much, ${how}. Holding the extra stock costs this much.`;
    }
    case "reports": {
      const label = Q.bandOf(Q.REPORT_TIME, a.reportTime).label;
      return `Last month's numbers take ${label[0].toLowerCase()}${label.slice(1)} to put together. Half to three quarters of that time can go.`;
    }
  }
}

const QUICK_WIN: Record<AreaId, { title: string; body: string }> = {
  missedSales: { title: "Stop losing enquiries", body: "Put every call, WhatsApp and walk-in in one list, and reply within the hour." },
  gettingPaid: { title: "Get paid sooner", body: "Send each invoice the day the work is done, and let reminders go out by themselves." },
  diary: { title: "Stop losing bookings", body: "Put every booking in one calendar, with a reminder before each one." },
  betweenApps: { title: "Stop typing things twice", body: "Bring the records you retype most into one place, so each is entered once." },
  stock: { title: "Know what's on the shelf", body: "Keep stock in one place, and set the level that tells you when to reorder." },
  reports: { title: "Get your numbers sooner", body: "Pull sales, costs and money owed into one place, so last month's picture is ready when you need it." },
};

export const WHAT_ODOO_FIXES = "One place for your work, so nothing is typed twice and nothing slips.";
export const WHAT_IT_WONT_FIX = "A team that doesn't use it. Plan time for training.";

export interface ReportArea {
  id: AreaId;
  label: string;
  cost: string;
  story: string;
  severity: Severity;
  /** How full its bar is, out of 100. */
  barPercent: number;
}

export interface ReportCard {
  dark: boolean;
  eyebrow: string;
  title: string;
  lines: string[];
  foot?: string;
}

export interface ReportClosing {
  title: string;
  body: string;
  /** Null for someone who can't decide: the email offers them no booking. */
  main: { kind: "book" | "retake"; label: string } | null;
}

export function buildReport(a: FitCheckAnswers, result: FitCheckResult) {
  const notYet = result.verdict === "not-yet";
  const advice = notYet ? adviceFor(a, result) : null;
  const shown = areasWithCost(result).sort((x, y) => y.pula.high - x.pula.high);
  const types = a.businessTypes.map((t) => Q.bandOf(Q.BUSINESS_TYPES, t).label).join(", ");
  const team = a.teamSize === "1" ? "Just you" : `${Q.bandOf(Q.TEAM_SIZES, a.teamSize).label} people`;
  const first = shown[0];
  const rest = shown.slice(1);
  const restWorth = { low: rest.reduce((t, x) => t + x.pula.low, 0), high: rest.reduce((t, x) => t + x.pula.high, 0) };

  const closing: ReportClosing = notYet
    ? { title: "Come back when things change", body: "Take the check again once things change. It's free and takes 4 minutes.", main: { kind: "retake", label: "Take the check again" } }
    : result.offersCall
      ? { title: "Want help with your two costliest areas?", body: `Book a free ${CONSULTATION_MINUTES}-minute review. We go through this report with you, online, and show what fixing them would look like.`, main: { kind: "book", label: "Book my review" } }
      : { title: "Share this with whoever decides", body: "Forward this report to the person who makes the decision. It has everything they need.", main: null };

  const plan: ReportCard[] = advice
    ? [
        { dark: true, eyebrow: "Start here · No new system needed", title: advice.steps.length === 1 ? "One simple step" : "Simple steps to start with", lines: [...advice.steps, ...(advice.customSoftware ? ["If your system ever leaves a gap, we also build custom software."] : [])] },
        ...(advice.comeBackWhen.length ? [{ dark: false, eyebrow: "Later · When things change", title: "Odoo starts to make sense when", lines: advice.comeBackWhen }] : []),
      ]
    : [
        ...(first ? [{ dark: true, eyebrow: "First 30 days · Your quick win", title: QUICK_WIN[first.id].title, lines: [`${QUICK_WIN[first.id].body} This is your costliest problem, so it comes first.`], foot: `Worth about ${worth(first.pula)} a year` }] : []),
        ...(rest.length ? [{ dark: false, eyebrow: "Days 31 to 90 · The bigger picture", title: "Connect the rest", lines: [`${rest.map((x) => x.label).join(", ")}, all in one system, once the first step is working.`], foot: `Worth about a further ${worth(restWorth)} a year` }] : []),
      ];

  return {
    notYet,
    verdict: result.verdict,
    why: advice?.why ?? null,
    pill: verdictPill(result, a.decider),
    who: `${types} · ${team}`,
    total: money(result.total),
    hours: hours(result.hoursPerWeek),
    timeLabel: a.teamSize === "1" ? "of your time each week" : "of your team's time each week",
    score: `${result.score} / 100`,
    areas: shown.map((x): ReportArea => ({ id: x.id, label: x.label, cost: money(x.pula), story: story(x, a), severity: x.severity, barPercent: Math.max(3, Math.min(100, Math.round((x.share / 0.1) * 100))) })),
    planHeading: notYet ? "What we'd do in your place" : "Your plan, one step at a time",
    plan,
    closing,
  };
}
