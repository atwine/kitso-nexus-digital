// The fit check's maths: Pula and hours lost per area, the health score, the
// verdict and the hot / warm / cold call label. Pure functions, no screens.
// Formulas are from Paper page "I · Fit check (draft)", logic board; the score
// and the app count were settled with the owner on 4 Nov 2026, and the verdict on 5 Nov.

import {
  ADMIN_HOURS,
  ADMIN_PEOPLE,
  APP_COUNT,
  BOOKINGS,
  DAYS_TO_PAY,
  ENQUIRIES,
  GONE_COLD,
  MISSED_BOOKINGS,
  REPORT_TIME,
  STOCK_PROBLEMS,
  STOCK_VALUE,
  TEAM_SIZES,
  HOURLY_RATE_LIMITS,
  YEARLY_SALES,
  asksDiary,
  asksStock,
  bandOf,
  type Band,
  type FitCheckAnswers,
} from "./questions.ts";

// P7,692 a month ÷ 173 hours (Statistics Botswana, Q3 2023). Visitors can change it.
export const DEFAULT_HOURLY_RATE = 44;
export const WORK_WEEKS = 46;
export const PRIME_RATE = 0.072;
export const PAYMENT_TERMS_DAYS = 30;

// The share of the loss Kitso's work could win back, low and high.
export const SHARES = {
  salesWon: { low: 0.2, high: 0.3 },
  bookingsKept: { low: 0.7, high: 1 },
  stockCarrying: { low: 0.1, high: 0.2 },
  reportsSaved: { low: 0.5, high: 0.75 },
} as const;

// An area scores 0 once it loses this share of yearly sales.
export const SCORE_FLOOR_SHARE = 0.03;
// How serious an area's loss is, as a share of yearly sales (owner, 4 Nov):
// under 1% is small, 1% to 3% is worth fixing, 3% or more is serious.
export const SEVERITY = { worthFixing: 0.01, serious: 0.03 } as const;
export type Severity = "small" | "worth-fixing" | "serious";
// A loss that can reach a large sum is never called small, however big the business.
export const NEVER_SMALL_FROM = 100_000;
export const severityOf = (share: number, highestPula: number): Severity =>
  share >= SEVERITY.serious ? "serious" : share >= SEVERITY.worthFixing || highestPula >= NEVER_SMALL_FROM ? "worth-fixing" : "small";

// Answers that don't add up can't produce a loss bigger than the business itself.
export const MAX_AREA_SHARE = 0.25;
export const MAX_TOTAL_SHARE = 0.5;

// What makes a business right for Odoo and for Kitso (owner, 5 Nov 2026).
// A sale of "around 500 pula" is too small for Kitso; "5,000 plus" is worth considering.
export const BIG_SALE_FROM = 5_000;
// Over this, the size of the business shows it can pay, however small each sale is.
export const SIZE_SHOWS_IT_CAN_PAY_BAND = "over-50m";
// One sale worth this share of a year's sales means only a handful of sales a year.
export const FEW_SALES_SHARE = 0.1;
// Money at stake a year (low end), set against what a system costs to set up and run.
export const FIT_FROM = 50_000;
export const STRONG_FROM = 150_000;
// Where the conversation about custom software starts. About P830,000 a month.
export const CUSTOM_SOFTWARE_FROM_BAND = "10m-50m";

// "I don't know" for stock value: stock is taken as a tenth of yearly sales.
export const STOCK_FROM_SALES = 0.1;

export interface Range {
  low: number;
  high: number;
}

export type AreaId = "missedSales" | "gettingPaid" | "diary" | "betweenApps" | "stock" | "reports";

export const AREA_LABELS: Record<AreaId, string> = {
  missedSales: "Missed sales",
  gettingPaid: "Getting paid",
  diary: "Bookings and appointments",
  betweenApps: "Time lost between apps",
  stock: "Stock",
  reports: "Reports and mistakes",
};

export interface AreaResult {
  id: AreaId;
  label: string;
  pula: Range; // a year, rounded to the nearest P1,000
  hoursPerWeek: Range;
  score: number; // 0 to 100
  share: number; // the middle of the loss as a share of yearly sales
  severity: Severity;
  estimated?: boolean; // worked out from a guess we made, not from their answer
}

// "How unusual is the way you work?" was removed (owner, 4 Nov), so the
// custom-software verdicts went with it.
export type Verdict = "strong-fit" | "fit" | "not-yet";
export type NotYetReason = "not-registered" | "solo" | "small-sales" | "few-sales" | "little-at-stake" | "already-covered";
export type Temperature = "hot" | "warm" | "cold";
// Why the sales representative is contacting someone who can't simply book a call.
export type ContactReason = "custom-software" | "reach-decider";

export const VERDICT_LABELS: Record<Verdict, string> = {
  "strong-fit": "Odoo is a strong fit",
  fit: "Odoo can help, starting small",
  "not-yet": "Not yet",
};

export interface FitCheckResult {
  areas: AreaResult[];
  total: Range; // a year, rounded to the nearest P5,000
  hoursPerWeek: Range;
  score: number;
  weakestTwo: AreaResult[];
  weakestTwoPula: Range; // the two areas shown, added up
  verdict: Verdict;
  notYetReasons: NotYetReason[]; // empty unless the verdict is not-yet, most important first
  temperature: Temperature;
  customSoftwareLead: boolean; // Odoo isn't right, but custom software could be if they're ready
  offersCall: boolean; // they can book a call themselves
  contactReason: ContactReason | null;
  figuresCapped: boolean; // the answers didn't add up, so the losses were limited
}

const range = (low: number, high = low): Range => ({ low, high });
const times = (r: Range, k: number): Range => range(r.low * k, r.high * k);
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const roundRange = (r: Range, step: number): Range => range(roundTo(r.low, step), roundTo(r.high, step));
const sum = (rs: Range[]): Range => range(
  rs.reduce((t, r) => t + r.low, 0),
  rs.reduce((t, r) => t + r.high, 0),
);
const value = (options: readonly Band[], id: string) => bandOf(options, id).value;

interface RawArea {
  id: AreaId;
  pula: Range;
  hoursPerWeek: Range;
  estimated?: boolean;
}

function rawAreas(a: FitCheckAnswers, hourlyRate: number): RawArea[] {
  const areas: RawArea[] = [];
  const none = range(0);

  // enquiries × share gone cold × 20–30% we'd have won × typical sale × 12
  const lostSales = value(ENQUIRIES, a.enquiries) * value(GONE_COLD, a.goneCold) * a.typicalSale * 12;
  areas.push({ id: "missedSales", pula: times(SHARES.salesWon, lostSales), hoursPerWeek: none });

  // yearly sales × (days to pay − 30) ÷ 365 = cash stuck, × prime rate
  const stuck = value(YEARLY_SALES, a.yearlySales) * Math.max(0, value(DAYS_TO_PAY, a.daysToPay) - PAYMENT_TERMS_DAYS) / 365;
  areas.push({ id: "gettingPaid", pula: range(stuck * PRIME_RATE), hoursPerWeek: none });

  if (asksDiary(a.businessTypes) && a.bookings && a.missedBookings && a.bookingValue !== undefined) {
    // missed bookings × 70–100% × value of one × 12
    const missed = value(BOOKINGS, a.bookings) * value(MISSED_BOOKINGS, a.missedBookings) * a.bookingValue * 12;
    areas.push({ id: "diary", pula: times(SHARES.bookingsKept, missed), hoursPerWeek: none });
  }

  // admin people × hours a week × share saved (set by how many apps hold the data)
  // The admin team can't be bigger than the whole team.
  const people = Math.min(value(ADMIN_PEOPLE, a.adminPeople), value(TEAM_SIZES, a.teamSize));
  const share = bandOf(APP_COUNT, a.appCount);
  const adminHours = times(share, people * value(ADMIN_HOURS, a.adminHours));
  areas.push({ id: "betweenApps", pula: times(adminHours, hourlyRate * WORK_WEEKS), hoursPerWeek: adminHours });

  if (asksStock(a.businessTypes) && a.stockValue && a.stockProblems) {
    // stock value × extra share × 10–20% a year to hold it
    const unknown = a.stockValue === "unknown";
    const worth = unknown ? STOCK_FROM_SALES * value(YEARLY_SALES, a.yearlySales) : value(STOCK_VALUE, a.stockValue);
    const extra = worth * value(STOCK_PROBLEMS, a.stockProblems);
    areas.push({ id: "stock", pula: times(SHARES.stockCarrying, extra), hoursPerWeek: none, ...(unknown && { estimated: true }) });
  }

  // report hours a month × hourly rate × 12 × 50–75% saved
  const reportHoursSaved = times(SHARES.reportsSaved, value(REPORT_TIME, a.reportTime));
  areas.push({
    id: "reports",
    pula: times(reportHoursSaved, hourlyRate * 12),
    hoursPerWeek: times(reportHoursSaved, 12 / 52),
  });

  return areas;
}

function areaScore(loss: Range, yearlySales: number): number {
  const mid = (loss.low + loss.high) / 2;
  return Math.round(100 * (1 - Math.min(1, mid / (SCORE_FLOOR_SHARE * yearlySales))));
}

type SalesBand = (typeof YEARLY_SALES)[number]["id"];
export const salesAtLeast = (a: FitCheckAnswers, band: SalesBand) =>
  YEARLY_SALES.findIndex((b) => b.id === a.yearlySales) >= YEARLY_SALES.findIndex((b) => b.id === band);

/** The areas where this business is actually losing something: what the report goes through. */
export const areasWithCost = (result: Pick<FitCheckResult, "areas">) => result.areas.filter((area) => area.pula.high > 0);

export const isReadySoon = (timing: string | undefined) => timing === "now" || timing === "3-months";

// Registered in another country counts the same as registered with CIPA.
const isRegistered = (a: FitCheckAnswers) => a.cipa === "yes" || a.cipa === "other-country";

// Can they pay for a system and its upkeep every year? Sales of P2 million show that.
// Below it, only a business whose sales are big individually can start small.
const earnsWellPerSale = (a: FitCheckAnswers) => salesAtLeast(a, "500k-2m") && a.typicalSale >= BIG_SALE_FROM;
const canAfford = (a: FitCheckAnswers) => salesAtLeast(a, "2m-10m") || earnsWellPerSale(a);

// Under P2 million, one sale this big means the money comes in lumps, which makes a
// retainer every month hard to carry.
const livesOnFewSales = (a: FitCheckAnswers) =>
  !salesAtLeast(a, "2m-10m") && a.typicalSale >= FEW_SALES_SHARE * value(YEARLY_SALES, a.yearlySales);

// Odoo wouldn't be worth the change for a business that already runs on one proper
// system. Someone who says everything lives in it is taken at their word, because a
// large sale value can inflate the estimate. Otherwise nothing serious may be slipping.
const SYSTEMS = new Set(["pastel-sage", "quickbooks-xero", "other-system"]);
const alreadyCovered = (a: FitCheckAnswers, totalLow: number) => {
  if (!a.mainTools.some((t) => SYSTEMS.has(t))) return false;
  const onTheSide = a.mainTools.some((t) => t === "paper" || t === "spreadsheets");
  if (a.appCount === "1" && !onTheSide) return true;
  const oneSystem = a.appCount === "1" || (a.appCount === "2-3" && !onTheSide);
  return oneSystem && totalLow < SEVERITY.serious * value(YEARLY_SALES, a.yearlySales);
};

// Why Odoo isn't right for them yet, most important first. Empty when it is.
export function notYetReasonsFor(a: FitCheckAnswers, totalLow: number): NotYetReason[] {
  const reasons: NotYetReason[] = [];
  if (a.cipa === "no") reasons.push("not-registered");
  // Someone working alone can still start small if their work shows they can pay.
  if (a.teamSize === "1" && !earnsWellPerSale(a)) reasons.push("solo");
  if (!canAfford(a)) reasons.push("small-sales");
  else if (livesOnFewSales(a)) reasons.push("few-sales");
  if (alreadyCovered(a, totalLow)) reasons.push("already-covered");
  else if (totalLow < FIT_FROM) reasons.push("little-at-stake");
  return reasons;
}

// False positives cost more than missed ones, so a strong business needs everything
// in place: registered, a team, sales of P5,000 or more a time (unless its size shows
// it can pay), sales of P2 million or more, scattered tools and real money at stake.
const isStrongBusiness = (a: FitCheckAnswers, totalLow: number) =>
  notYetReasonsFor(a, totalLow).length === 0 &&
  isRegistered(a) &&
  a.teamSize !== "1" &&
  (a.typicalSale >= BIG_SALE_FROM || salesAtLeast(a, SIZE_SHOWS_IT_CAN_PAY_BAND)) &&
  salesAtLeast(a, "2m-10m") &&
  a.appCount !== "1" &&
  totalLow >= STRONG_FROM;

// A strong fit also has to be theirs to decide, and they have to be ready: someone
// just exploring is told to start small.
export function verdictFor(a: FitCheckAnswers, totalLow: number): Verdict {
  if (notYetReasonsFor(a, totalLow).length > 0) return "not-yet";
  return isStrongBusiness(a, totalLow) && a.decider !== "someone-else" && a.timing !== "exploring" ? "strong-fit" : "fit";
}

// Odoo isn't right for a big firm already running on one system, but custom software
// can be, if nothing else stands in the way and the person can decide.
const isCustomSoftwareLead = (a: FitCheckAnswers, totalLow: number) => {
  const reasons = notYetReasonsFor(a, totalLow);
  return reasons.length === 1 && reasons[0] === "already-covered" && isRegistered(a) && a.decider !== "someone-else" && salesAtLeast(a, CUSTOM_SOFTWARE_FROM_BAND);
};

// Who the sales representative should talk to. Someone who can't decide is only worth
// contacting at a strong business that's ready, as a way to reach whoever does. A strong
// business that's just exploring is worth keeping in touch with. Timing is asked on the
// result screen and may be left blank.
export function temperatureFor(a: FitCheckAnswers, totalLow: number): Temperature {
  const verdict = verdictFor(a, totalLow);
  const soon = isReadySoon(a.timing);
  if (verdict === "not-yet") return soon && isCustomSoftwareLead(a, totalLow) ? "warm" : "cold";
  if (a.decider === "someone-else") return soon && isStrongBusiness(a, totalLow) ? "warm" : "cold";
  if (a.timing === "exploring") return isStrongBusiness(a, totalLow) ? "warm" : "cold";
  if (verdict === "strong-fit") return soon ? "hot" : "warm";
  return soon || a.timing === "this-year" ? "warm" : "cold";
}

// Only someone who can decide books a call. A warm lead who can't is contacted instead.
const offersCall = (a: FitCheckAnswers, verdict: Verdict) => verdict !== "not-yet" && a.decider !== "someone-else";
const contactReasonFor = (a: FitCheckAnswers, verdict: Verdict, temperature: Temperature): ContactReason | null => {
  if (temperature === "cold") return null;
  if (verdict === "not-yet") return "custom-software";
  return a.decider === "someone-else" ? "reach-decider" : null;
};

function limitToSales(raw: RawArea[], sales: number): { areas: RawArea[]; capped: boolean } {
  const areaCap = MAX_AREA_SHARE * sales;
  const totalCap = MAX_TOTAL_SHARE * sales;
  const limited = raw.map((r) => (r.pula.high <= areaCap ? r : { ...r, pula: range(Math.min(r.pula.low, areaCap), areaCap) }));
  const high = sum(limited.map((r) => r.pula)).high;
  const areas = high <= totalCap ? limited : limited.map((r) => ({ ...r, pula: times(r.pula, totalCap / high) }));
  return { areas, capped: raw.some((r) => r.pula.high > areaCap) || high > totalCap };
}

export function calculateFitCheck(a: FitCheckAnswers): FitCheckResult {
  const hourlyRate = a.hourlyRate ?? DEFAULT_HOURLY_RATE;
  if (!(hourlyRate >= HOURLY_RATE_LIMITS.min && hourlyRate <= HOURLY_RATE_LIMITS.max)) {
    throw new Error(`Hourly rate must be P${HOURLY_RATE_LIMITS.min} to P${HOURLY_RATE_LIMITS.max}`);
  }
  const sales = value(YEARLY_SALES, a.yearlySales);

  const { areas: limited, capped } = limitToSales(rawAreas(a, hourlyRate), sales);
  const areas: AreaResult[] = limited.map((r) => ({
    id: r.id,
    label: AREA_LABELS[r.id],
    pula: roundRange(r.pula, 1_000),
    hoursPerWeek: roundRange(r.hoursPerWeek, 1),
    score: areaScore(r.pula, sales),
    share: (r.pula.low + r.pula.high) / 2 / sales,
    severity: severityOf((r.pula.low + r.pula.high) / 2 / sales, r.pula.high),
    ...(r.estimated && { estimated: true }),
  }));

  const total = roundRange(sum(limited.map((r) => r.pula)), 5_000);
  const hoursPerWeek = roundRange(sum(limited.map((r) => r.hoursPerWeek)), 1);
  const score = Math.round(areas.reduce((t, r) => t + r.score, 0) / areas.length);

  const verdict = verdictFor(a, total.low);
  const temperature = temperatureFor(a, total.low);

  const order = limited
    .map((r, i) => ({ r, area: areas[i] }))
    .sort((x, y) => x.area.score - y.area.score || (y.r.pula.low + y.r.pula.high) - (x.r.pula.low + x.r.pula.high));
  // The two most painful areas; an area that loses nothing is never one of them.
  const weakest = order.filter((w) => w.r.pula.high > 0).slice(0, 2);

  return {
    areas,
    total,
    hoursPerWeek,
    score,
    weakestTwo: weakest.map((w) => w.area),
    weakestTwoPula: sum(weakest.map((w) => w.area.pula)),
    verdict,
    notYetReasons: notYetReasonsFor(a, total.low),
    temperature,
    customSoftwareLead: isCustomSoftwareLead(a, total.low),
    offersCall: offersCall(a, verdict),
    contactReason: contactReasonFor(a, verdict, temperature),
    figuresCapped: capped,
  };
}
