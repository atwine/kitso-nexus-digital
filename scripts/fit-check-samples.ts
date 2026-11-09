// Prints a sheet of fit check results for four made-up businesses, plus every number the maths assumes, so the owner and Fredrick can
// check the figures and the call rules by hand.
//
//   npm run fit:samples                 prints the sheet
//   npm run fit:samples -- sheet.md     writes it to a file

import fs from "node:fs";
import {
  AREA_LABELS,
  DEFAULT_HOURLY_RATE,
  BIG_SALE_FROM,
  CUSTOM_SOFTWARE_FROM_BAND,
  FEW_SALES_SHARE,
  FIT_FROM,
  MAX_AREA_SHARE,
  MAX_TOTAL_SHARE,
  NEVER_SMALL_FROM,
  SEVERITY,
  SIZE_SHOWS_IT_CAN_PAY_BAND,
  STRONG_FROM,
  PAYMENT_TERMS_DAYS,
  PRIME_RATE,
  SCORE_FLOOR_SHARE,
  SHARES,
  STOCK_FROM_SALES,
  VERDICT_LABELS,
  WORK_WEEKS,
  calculateFitCheck,
} from "../src/lib/fitCheck/calculate.ts";
import * as Q from "../src/lib/fitCheck/questions.ts";
import type { Band, Choice, FitCheckAnswers } from "../src/lib/fitCheck/questions.ts";

const samples: { name: string; about: string; answers: FitCheckAnswers }[] = [
  {
    name: "Tlotlo Auto",
    about: "a car workshop with 6–20 people, run on spreadsheets",
    answers: {
      businessTypes: ["equipment"], teamSize: "6-20", cipa: "yes", mainTools: ["spreadsheets"],
      timing: "now", decider: "me", enquiries: "30-100", goneCold: "quarter", typicalSale: 3500,
      yearlySales: "2m-10m", daysToPay: "60-90", invoiceMistakes: "sometimes", bookings: "50-150",
      missedBookings: "one-in-ten", bookingValue: 800, adminPeople: "2-3", adminHours: "5-10", appCount: "4-6",
      stockValue: "500k-2m", stockProblems: "monthly", reportTime: "week", reportConfidence: "fairly",
    },
  },
  {
    name: "Kgosi Builders",
    about: "a builder that also hires out machines, 21–50 people, unsure what its stock is worth",
    answers: {
      businessTypes: ["construction", "equipment"], teamSize: "21-50", cipa: "yes", mainTools: ["pastel-sage", "spreadsheets", "whatsapp"],
      timing: "3-months", decider: "partner", enquiries: "10-30", goneCold: "a-few", typicalSale: 250_000,
      yearlySales: "10m-50m", daysToPay: "over-90", invoiceMistakes: "often", adminPeople: "4-6",
      adminHours: "over-10", appCount: "7+", stockValue: "unknown", stockProblems: "weekly", reportTime: "month",
      reportConfidence: "unsure",
    },
  },
  {
    name: "Naledi Tutors",
    about: "a tutoring business with 2–5 people, run on WhatsApp and Excel",
    answers: {
      businessTypes: ["professional-services"], teamSize: "2-5", cipa: "in-progress", mainTools: ["whatsapp", "spreadsheets"],
      timing: "this-year", decider: "me", enquiries: "10-30", goneCold: "quarter", typicalSale: 1200,
      yearlySales: "500k-2m", daysToPay: "30-60", invoiceMistakes: "sometimes", bookings: "20-50",
      missedBookings: "one-in-five", bookingValue: 250, adminPeople: "1", adminHours: "2-5", appCount: "2-3",
      reportTime: "few-days", reportConfidence: "fairly",
    },
  },
  {
    name: "Mpho's Sewing",
    about: "one person sewing to order, with a notebook",
    answers: {
      businessTypes: ["other"], teamSize: "1", cipa: "no", mainTools: ["paper"], timing: "exploring",
      decider: "me", enquiries: "under-10", goneCold: "a-few", typicalSale: 300, yearlySales: "under-500k",
      daysToPay: "under-30", invoiceMistakes: "rarely", bookings: "under-20", missedBookings: "a-few", bookingValue: 150,
      adminPeople: "1", adminHours: "under-2", appCount: "1", stockValue: "under-100k", stockProblems: "rarely",
      reportTime: "day", reportConfidence: "sure",
    },
  },
];

const P = (n: number) => `P${Math.round(n).toLocaleString("en-GB")}`;
const span = (r: { low: number; high: number }, f: (n: number) => string) =>
  r.low === r.high ? f(r.low) : `${f(r.low)} to ${f(r.high)}`;
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const label = (options: readonly Choice[], id: string | undefined) => (id ? Q.bandOf(options, id).label : "not asked");

const out: string[] = [];
const line = (s = "") => out.push(s);

line("# Fit check: sample results to check");
line();
line(`Made by \`npm run fit:samples\` from the code in \`src/lib/fitCheck/\`. Every figure is a year unless it says otherwise. Hourly cost: P${DEFAULT_HOURLY_RATE}.`);

for (const s of samples) {
  const a = s.answers;
  const r = calculateFitCheck(a);
  line();
  line(`## ${s.name}: ${s.about}`);
  line();
  const people = a.teamSize === "1" ? "just one person" : `${label(Q.TEAM_SIZES, a.teamSize)} people`;
  const admins = a.adminPeople === "1" ? "1 person" : `${label(Q.ADMIN_PEOPLE, a.adminPeople)} people`;
  const apps = a.appCount === "1" ? "1 app" : `${label(Q.APP_COUNT, a.appCount)} apps`;
  const parts = [
    `${a.businessTypes.map((t) => label(Q.BUSINESS_TYPES, t)).join(" and ")}, ${people}, registered: ${label(Q.CIPA, a.cipa)}, uses ${a.mainTools.map((t) => label(Q.MAIN_TOOLS, t)).join(", ")}, wants it: ${label(Q.TIMING, a.timing).toLowerCase()}, final decision: ${label(Q.DECIDER, a.decider).toLowerCase()}.`,
    `Enquiries a month: ${label(Q.ENQUIRIES, a.enquiries).toLowerCase()}, ${label(Q.GONE_COLD, a.goneCold).toLowerCase()} go cold, typical sale ${P(a.typicalSale)}.`,
    `Yearly sales: ${label(Q.YEARLY_SALES, a.yearlySales)}, paid in ${label(Q.DAYS_TO_PAY, a.daysToPay).toLowerCase()}.`,
  ];
  if (a.bookings && a.missedBookings && a.bookingValue !== undefined) {
    parts.push(`Bookings a month: ${label(Q.BOOKINGS, a.bookings).toLowerCase()}, ${label(Q.MISSED_BOOKINGS, a.missedBookings).toLowerCase()} missed, ${P(a.bookingValue)} each.`);
  }
  parts.push(`Admin: ${admins}, ${label(Q.ADMIN_HOURS, a.adminHours).toLowerCase()} a week each, data in ${apps}.`);
  if (a.stockValue && a.stockProblems) {
    parts.push(`Stock: ${label(Q.STOCK_VALUE, a.stockValue)}, runs out or over-orders ${label(Q.STOCK_PROBLEMS, a.stockProblems).toLowerCase()}.`);
  }
  parts.push(`Monthly numbers take ${label(Q.REPORT_TIME, a.reportTime).toLowerCase()}.`);
  line(`Answers: ${parts.join(" ")}`);
  line();
  line("| Area | Lost a year | Hours a week | Score |");
  line("|---|---|---|---|");
  for (const ar of r.areas) line(`| ${ar.label}${ar.estimated ? " (estimated)" : ""} | ${span(ar.pula, P)} | ${span(ar.hoursPerWeek, String)} | ${ar.score} |`);
  line(`| **Total** | **${span(r.total, P)}** | **${span(r.hoursPerWeek, String)}** | **${r.score} out of 100** |`);
  line();
  line(`- Free result shows: ${r.weakestTwo.map((w) => w.label).join(" and ")}, worth ${span(r.weakestTwoPula, P)} a year to fix.`);
  line(`- Verdict: **${VERDICT_LABELS[r.verdict]}**`);
  line(`- Call label: **${r.temperature}**`);
}

const bands = (title: string, options: readonly Band[], f: (n: number) => string) =>
  line(`- ${title}: ${options.map((o) => `${o.label} = ${f(o.value)}`).join(" · ")}`);

line();
line("## Every number the maths assumes");
line();
line("A range counts as its middle. An open range (\"Over 100\") counts as 1.5 times its edge.");
line();
bands("People", Q.TEAM_SIZES, String);
bands("Enquiries a month", Q.ENQUIRIES, String);
bands("Share gone cold", Q.GONE_COLD, pct);
bands("Yearly sales", Q.YEARLY_SALES, P);
bands("Days to get paid", Q.DAYS_TO_PAY, String);
bands("Bookings a month", Q.BOOKINGS, String);
bands("Share of bookings missed", Q.MISSED_BOOKINGS, pct);
bands("Admin people", Q.ADMIN_PEOPLE, String);
bands("Admin hours a week each", Q.ADMIN_HOURS, String);
line(`- Admin time saved, by apps holding the data: ${Q.APP_COUNT.map((o) => `${o.label} = ${pct(o.low)} to ${pct(o.high)}`).join(" · ")}`);
bands("Stock value", Q.STOCK_VALUE.filter((o) => o.id !== "unknown"), P);
line(`- Stock value "I don't know": ${pct(STOCK_FROM_SALES)} of yearly sales, marked estimated.`);
bands("Extra stock from running out or over-ordering", Q.STOCK_PROBLEMS, pct);
bands("Hours a month on the monthly numbers", Q.REPORT_TIME, String);
line(`- Sales we'd have won back: ${pct(SHARES.salesWon.low)} to ${pct(SHARES.salesWon.high)}. Missed bookings kept: ${pct(SHARES.bookingsKept.low)} to ${pct(SHARES.bookingsKept.high)}. Yearly cost of holding extra stock: ${pct(SHARES.stockCarrying.low)} to ${pct(SHARES.stockCarrying.high)}. Report time saved: ${pct(SHARES.reportsSaved.low)} to ${pct(SHARES.reportsSaved.high)}.`);
line(`- Getting paid: anything over ${PAYMENT_TERMS_DAYS} days is cash stuck, costed at the prime rate of ${pct(PRIME_RATE)}.`);
line(`- Hourly cost P${DEFAULT_HOURLY_RATE}, ${WORK_WEEKS} working weeks a year. The admin team is never counted as bigger than the whole team.`);
line(`- Score: an area scores 100 when it loses nothing and 0 when it loses ${pct(SCORE_FLOOR_SHARE)} or more of yearly sales. The overall score is the average of the areas asked.`);
line(`- "At stake" means the low end of the total, limited so no area passes ${pct(MAX_AREA_SHARE)} of yearly sales and the total never passes ${pct(MAX_TOTAL_SHARE)}.`);
line(`- How serious a loss is, as a share of yearly sales: under ${pct(SEVERITY.worthFixing)} is small, ${pct(SEVERITY.worthFixing)} to ${pct(SEVERITY.serious)} is worth fixing, ${pct(SEVERITY.serious)} or more is serious. A loss that can reach ${P(NEVER_SMALL_FROM)} is never called small.`);
line(`- Not yet: not registered, or just one person (unless sales are P500,000 or more at ${P(BIG_SALE_FROM)} or more a time), or sales under P500,000, or sales under P2 million with a typical sale under ${P(BIG_SALE_FROM)}, or sales under P2 million with one sale worth ${pct(FEW_SALES_SHARE)} or more of the year, or under ${P(FIT_FROM)} at stake, or one proper system already doing the job (everything lives in it, or with only chat on the side and under ${pct(SEVERITY.serious)} of sales at stake).`);
line(`- Strong fit: registered, a team, the decision is theirs, not just exploring, a typical sale of ${P(BIG_SALE_FROM)} or more (or sales of "${label(Q.YEARLY_SALES, SIZE_SHOWS_IT_CAN_PAY_BAND)}"), sales of P2 million or more, more than one tool, and ${P(STRONG_FROM)} or more at stake. Anything else is a fit, so start small.`);
line(`- Call label. Hot: strong fit, wants it now or within 3 months. Warm: strong fit later or undated, a strong business just exploring, a fit this year or sooner, someone who can't decide at a strong business that's ready within 3 months, or a firm with sales from "${label(Q.YEARLY_SALES, CUSTOM_SOFTWARE_FROM_BAND)}" already on one system and ready within 3 months (a custom software lead). Cold: everything else.`);
line("- Who can book a call: anyone who fits and can decide. Someone who can't decide, or who hears \"not yet\", can't.");
line("- Engineering is a plus: it doesn't change the verdict, but the sales representative sees it on the lead and can put those firms first.");
line(`- Areas: ${Object.values(AREA_LABELS).join(", ")}. Invoice mistakes and "how sure are you of the numbers" are asked, but only go into the Odoo notes for the call.`);

const text = out.join("\n") + "\n";
const target = process.argv[2];
if (target) {
  fs.writeFileSync(target, text);
  console.log(`Wrote ${target}`);
} else {
  process.stdout.write(text);
}
