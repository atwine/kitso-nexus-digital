import { describe, expect, it } from "vitest";
import { adviceFor } from "./advice.ts";
import { calculateFitCheck, notYetReasonsFor, severityOf, temperatureFor, verdictFor } from "./calculate.ts";
import { BUSINESS_TYPES, asksDiary, asksStock, fitCheckAnswers, type FitCheckAnswers } from "./questions.ts";
import { INDUSTRIES } from "../../data/industries.ts";

// A car workshop with 6–20 people. Every figure below is worked out by hand.
const workshop: FitCheckAnswers = {
  businessTypes: ["equipment"],
  teamSize: "6-20",
  cipa: "yes",
  mainTools: ["spreadsheets"],
  timing: "now",
  decider: "me",
  enquiries: "30-100",
  goneCold: "quarter",
  typicalSale: 3500,
  yearlySales: "2m-10m",
  daysToPay: "60-90",
  invoiceMistakes: "sometimes",
  bookings: "50-150",
  missedBookings: "one-in-ten",
  bookingValue: 800,
  adminPeople: "2-3",
  adminHours: "5-10",
  appCount: "4-6",
  stockValue: "500k-2m",
  stockProblems: "monthly",
  reportTime: "week",
  reportConfidence: "fairly",
};

const area = (r: ReturnType<typeof calculateFitCheck>, id: string) => r.areas.find((a) => a.id === id)!;

describe("each area's Pula figure", () => {
  const r = calculateFitCheck(workshop);

  it("missed sales: 65 enquiries × 25% cold × P3,500 × 12 × 20–30% won", () => {
    expect(area(r, "missedSales").pula).toEqual({ low: 137_000, high: 205_000 });
  });

  it("getting paid: P6m × (75 − 30) days ÷ 365 × 7.2%", () => {
    expect(area(r, "gettingPaid").pula).toEqual({ low: 53_000, high: 53_000 });
  });

  it("diary: 100 bookings × 10% missed × P800 × 12 × 70–100%", () => {
    expect(area(r, "diary").pula).toEqual({ low: 67_000, high: 96_000 });
  });

  it("time between apps: 2.5 people × 7.5 h × 50–70% saved (4–6 apps) × P44 × 46 weeks", () => {
    expect(area(r, "betweenApps").pula).toEqual({ low: 19_000, high: 27_000 });
    expect(area(r, "betweenApps").hoursPerWeek).toEqual({ low: 9, high: 13 });
  });

  it("stock: P1.25m × 10% extra (monthly) × 10–20% a year", () => {
    expect(area(r, "stock").pula).toEqual({ low: 13_000, high: 25_000 });
  });

  it("reports: 16 h a month × 50–75% × P44 × 12", () => {
    expect(area(r, "reports").pula).toEqual({ low: 4_000, high: 6_000 });
  });

  it("adds up the total to the nearest P5,000, and the hours a week", () => {
    expect(r.total).toEqual({ low: 295_000, high: 410_000 });
    expect(r.hoursPerWeek).toEqual({ low: 11, high: 16 });
  });
});

describe("health score", () => {
  const r = calculateFitCheck(workshop);

  it("scores each area against 3% of yearly sales, and averages them", () => {
    expect(r.areas.map((a) => [a.id, a.score])).toEqual([
      ["missedSales", 5],
      ["gettingPaid", 70],
      ["diary", 55],
      ["betweenApps", 87],
      ["stock", 90],
      ["reports", 97],
    ]);
    expect(r.score).toBe(67);
  });

  it("labels each area small, worth fixing or serious by its share of yearly sales", () => {
    const r = calculateFitCheck(workshop);
    expect(area(r, "missedSales").share).toBeCloseTo(170_625 / 6_000_000);
    expect(area(r, "missedSales").severity).toBe("worth-fixing"); // 2.8% of sales
    expect(calculateFitCheck({ ...workshop, goneCold: "half" }).areas[0].severity).toBe("serious");
    expect(area(r, "reports").severity).toBe("small");
    expect(severityOf(0.009, 5_000)).toBe("small");
    expect(severityOf(0.01, 5_000)).toBe("worth-fixing");
    expect(severityOf(0.03, 5_000)).toBe("serious");
    // A large sum is never called small, even in a very big business.
    expect(severityOf(0.009, 266_000)).toBe("worth-fixing");
    // Nor is one that can reach that much, like P74,000 to P105,000.
    expect(severityOf(0.009, 99_999)).toBe("small");
    expect(severityOf(0.009, 100_000)).toBe("worth-fixing");
  });

  it("never counts an area that loses nothing among the weakest", () => {
    const r = calculateFitCheck({ ...workshop, goneCold: "none", missedBookings: "none" });
    expect(r.weakestTwo.map((a) => a.id)).not.toContain("missedSales");
    expect(r.weakestTwo.map((a) => a.id)).not.toContain("diary");
    expect(r.weakestTwo.every((a) => a.pula.high > 0)).toBe(true);
  });

  it("names the two weakest areas and what fixing them is worth", () => {
    expect(r.weakestTwo.map((a) => a.id)).toEqual(["missedSales", "diary"]);
    expect(r.weakestTwoPula).toEqual({ low: 204_000, high: 301_000 });
  });

  it("puts the bigger Pula loss first when two areas tie", () => {
    const r = calculateFitCheck({ ...workshop, yearlySales: "under-500k", typicalSale: 500, bookingValue: 500 });
    expect(area(r, "missedSales").score).toBe(0);
    expect(area(r, "diary").score).toBe(0);
    expect(r.weakestTwo.map((a) => a.id)).toEqual(["diary", "missedSales"]);
  });

  it("never goes below 0 or above 100", () => {
    const awful = calculateFitCheck({ ...workshop, yearlySales: "under-500k", typicalSale: 10_000_000, goneCold: "half" });
    expect(area(awful, "missedSales").score).toBe(0);
    const perfect = calculateFitCheck({ ...workshop, goneCold: "none", daysToPay: "under-30" });
    expect(area(perfect, "missedSales").score).toBe(100);
    expect(area(perfect, "gettingPaid").score).toBe(100);
  });
});

describe("the more apps hold the data, the more admin time is saved", () => {
  it("raises the share saved with the app count", () => {
    const lows = (["1", "2-3", "4-6", "7+"] as const).map(
      (n) => area(calculateFitCheck({ ...workshop, appCount: n }), "betweenApps").pula.low,
    );
    expect(lows).toEqual([...lows].sort((x, y) => x - y));
    expect(new Set(lows).size).toBe(4);
  });

  it("never counts more admin people than the whole team", () => {
    const solo = calculateFitCheck({ ...workshop, teamSize: "1", adminPeople: "7+" });
    const oneAdmin = calculateFitCheck({ ...workshop, teamSize: "1", adminPeople: "1" });
    expect(area(solo, "betweenApps").pula).toEqual(area(oneAdmin, "betweenApps").pula);
  });
});

describe("who is asked about the diary and stock", () => {
  it("knows every business type on the site", () => {
    expect(BUSINESS_TYPES.map((b) => b.id)).toEqual([...INDUSTRIES.map((i) => i.id), "engineering", "other"]);
    expect(BUSINESS_TYPES.map((b) => b.label)).not.toContain("Non-profit or church");
  });

  it.each([
    ["manufacturing", false, true],
    ["equipment", true, true],
    ["professional-services", true, false],
    ["retail", false, true],
    ["construction", false, true],
    ["engineering", false, true],
    ["other", true, true],
  ])("%s: diary %s, stock %s", (type, diary, stock) => {
    expect(asksDiary([type])).toBe(diary);
    expect(asksStock([type])).toBe(stock);
  });

  it("leaves out areas the business wasn't asked about", () => {
    const { bookings: _b, missedBookings: _m, bookingValue: _v, ...retail } = workshop;
    const r = calculateFitCheck({ ...retail, businessTypes: ["retail"] });
    expect(r.areas.map((a) => a.id)).toEqual(["missedSales", "gettingPaid", "betweenApps", "stock", "reports"]);
  });
});

describe("several business types", () => {
  it("asks about the diary or stock if any ticked type needs it", () => {
    expect(asksDiary(["retail", "professional-services"])).toBe(true);
    expect(asksStock(["retail", "professional-services"])).toBe(true);
    expect(asksDiary(["retail", "manufacturing"])).toBe(false);
    expect(asksStock(["professional-services"])).toBe(false);
  });
});

describe("stock value not known", () => {
  it("takes stock as a tenth of yearly sales and marks it estimated", () => {
    const r = calculateFitCheck({ ...workshop, stockValue: "unknown" });
    // P6m × 10% = P600,000 of stock; × 10% extra (monthly) × 10–20% a year
    expect(area(r, "stock").pula).toEqual({ low: 6_000, high: 12_000 });
    expect(area(r, "stock").estimated).toBe(true);
    expect(area(calculateFitCheck(workshop), "stock").estimated).toBeUndefined();
  });
});

// A real client (owner, 5 Nov 2026): she works alone training bridesmaids to dance,
// charges about P2,000, isn't registered, and wanted Odoo for bookings and invoicing.
const rehearsalTrainer: FitCheckAnswers = {
  businessTypes: ["professional-services"],
  teamSize: "1",
  cipa: "no",
  mainTools: ["whatsapp", "paper"],
  timing: "now",
  decider: "me",
  enquiries: "10-30",
  goneCold: "a-few",
  typicalSale: 2000,
  yearlySales: "under-500k",
  daysToPay: "under-30",
  invoiceMistakes: "sometimes",
  bookings: "under-20",
  missedBookings: "a-few",
  bookingValue: 2000,
  adminPeople: "1",
  adminHours: "2-5",
  appCount: "2-3",
  reportTime: "few-days",
  reportConfidence: "fairly",
};

describe("the real client Odoo wasn't right for", () => {
  it("tells her not yet, with no sales call, however soon she wants it", () => {
    const result = calculateFitCheck(rehearsalTrainer);
    expect(result.verdict).toBe("not-yet");
    expect(result.temperature).toBe("cold");
    expect(result.notYetReasons).toEqual(expect.arrayContaining(["not-registered", "solo", "small-sales"]));
  });

  it("gives her advice from her own answers: register first, and a calendar for bookings", () => {
    const advice = adviceFor(rehearsalTrainer, calculateFitCheck(rehearsalTrainer));
    expect(advice.steps[0]).toBe("Register your business with CIPA.");
    expect(advice.steps.join(" ")).toMatch(/calendar/i);
    expect(advice.why).toMatch(/isn't registered/);
    expect(advice.why).toMatch(/on your own/);
    // Three reasons is plenty: the money at stake only comes up when it's the whole story.
    expect(advice.why).not.toMatch(/too small/);
    expect(advice.customSoftware).toBe(false);
  });

  it("stays not yet even once she registers, while she works alone on small sales", () => {
    expect(calculateFitCheck({ ...rehearsalTrainer, cipa: "yes" }).verdict).toBe("not-yet");
  });
});

describe("verdict", () => {
  // The workshop, with sales of P6,000 a time.
  const big: FitCheckAnswers = { ...workshop, typicalSale: 6_000 };

  it("strong fit needs everything the owner listed", () => {
    expect(verdictFor(big, 150_000)).toBe("strong-fit");
    expect(verdictFor(big, 145_000)).toBe("fit");
    expect(verdictFor({ ...big, cipa: "in-progress" }, 500_000)).toBe("fit");
    expect(verdictFor({ ...big, decider: "someone-else" }, 500_000)).toBe("fit");
    expect(verdictFor({ ...big, decider: "partner" }, 500_000)).toBe("strong-fit");
    expect(verdictFor({ ...big, timing: "exploring" }, 500_000)).toBe("fit");
    expect(verdictFor({ ...big, appCount: "1" }, 500_000)).toBe("fit");
    expect(verdictFor({ ...big, cipa: "other-country" }, 500_000)).toBe("strong-fit");
  });

  it("before they've said how soon, a strong fit still shows as one", () => {
    const { timing: _t, ...noTiming } = big;
    expect(verdictFor(noTiming, 500_000)).toBe("strong-fit");
  });

  it("a sale under P5,000 is a fit at most, until sales over P50 million show they can pay", () => {
    expect(verdictFor(workshop, 500_000)).toBe("fit");
    expect(verdictFor({ ...workshop, typicalSale: 4_999 }, 500_000)).toBe("fit");
    expect(verdictFor({ ...workshop, typicalSale: 5_000 }, 500_000)).toBe("strong-fit");
    expect(verdictFor({ ...workshop, typicalSale: 900, yearlySales: "10m-50m", teamSize: "21-50" }, 500_000)).toBe("fit");
    expect(verdictFor({ ...workshop, typicalSale: 210, yearlySales: "over-50m", teamSize: "51-200" }, 500_000)).toBe("strong-fit");
  });

  it("a small team can be a strong fit once its sales show it can pay", () => {
    expect(verdictFor({ ...big, teamSize: "2-5" }, 500_000)).toBe("strong-fit");
    expect(verdictFor({ ...big, teamSize: "2-5", yearlySales: "500k-2m" }, 500_000)).toBe("fit");
  });

  it("not yet, whatever is at stake, for someone not registered or working alone on small sales", () => {
    expect(notYetReasonsFor({ ...big, cipa: "no" }, 5_000_000)).toEqual(["not-registered"]);
    expect(notYetReasonsFor({ ...workshop, teamSize: "1" }, 5_000_000)).toEqual(["solo"]);
  });

  it("someone alone whose work shows they can pay can start small, and is never a strong fit", () => {
    const surveyor: FitCheckAnswers = { ...big, teamSize: "1", yearlySales: "500k-2m", typicalSale: 38_000 };
    expect(notYetReasonsFor(surveyor, 215_000)).toEqual([]);
    expect(verdictFor(surveyor, 215_000)).toBe("fit");
    expect(temperatureFor(surveyor, 215_000)).toBe("warm");
    expect(verdictFor({ ...big, teamSize: "1" }, 5_000_000)).toBe("fit");
    expect(notYetReasonsFor({ ...surveyor, typicalSale: 4_999 }, 215_000)).toEqual(["solo", "small-sales"]);
    expect(notYetReasonsFor({ ...surveyor, yearlySales: "under-500k" }, 215_000)).toEqual(["solo", "small-sales"]);
  });

  it("not yet for a small firm living on a few big sales a year", () => {
    const tenders: FitCheckAnswers = { ...big, yearlySales: "500k-2m", typicalSale: 180_000 };
    expect(notYetReasonsFor(tenders, 330_000)).toEqual(["few-sales"]);
    // A tenth of P1.25 million, the middle of their sales answer.
    expect(notYetReasonsFor({ ...tenders, typicalSale: 124_999 }, 330_000)).toEqual([]);
    expect(notYetReasonsFor({ ...tenders, typicalSale: 125_000 }, 330_000)).toEqual(["few-sales"]);
    // Sales of P2 million or more are steady enough.
    expect(notYetReasonsFor({ ...tenders, yearlySales: "2m-10m" }, 330_000)).toEqual([]);
    const advice = adviceFor(tenders, calculateFitCheck(tenders));
    expect(advice.why).toMatch(/few big sales/);
    expect(advice.comeBackWhen).toContain("Your income is steady from month to month.");
  });

  it("not yet below a sale value and sales level that can carry a system", () => {
    expect(notYetReasonsFor({ ...big, yearlySales: "under-500k", typicalSale: 50_000 }, 100_000)).toEqual(["small-sales"]);
    expect(notYetReasonsFor({ ...big, yearlySales: "500k-2m", typicalSale: 500 }, 100_000)).toEqual(["small-sales"]);
    expect(verdictFor({ ...big, yearlySales: "500k-2m", typicalSale: 5_000 }, 100_000)).toBe("fit");
  });

  it("not yet when too little is at stake for a system to pay for itself", () => {
    expect(notYetReasonsFor(big, 45_000)).toEqual(["little-at-stake"]);
    expect(verdictFor(big, 50_000)).toBe("fit");
  });

  it("doesn't sell to a business already well served by one proper system", () => {
    const covered: FitCheckAnswers = { ...big, appCount: "1", mainTools: ["other-system"], otherSystem: "SAP", yearlySales: "over-50m" };
    expect(notYetReasonsFor(covered, 500_000)).toEqual(["already-covered"]);
    expect(adviceFor(covered, calculateFitCheck(covered)).customSoftware).toBe(true);
    // One spreadsheet isn't a system.
    expect(notYetReasonsFor({ ...covered, mainTools: ["spreadsheets"] }, 500_000)).toEqual([]);
    // A proper system plus WhatsApp is still one system; plus spreadsheets isn't.
    const withChat: FitCheckAnswers = { ...big, appCount: "2-3", mainTools: ["other-system", "whatsapp"], otherSystem: "Broker system" };
    expect(notYetReasonsFor(withChat, 140_000)).toEqual(["already-covered"]);
    expect(notYetReasonsFor({ ...withChat, mainTools: ["other-system", "spreadsheets"] }, 140_000)).toEqual([]);
    // If something serious is slipping, the system isn't covering it.
    expect(notYetReasonsFor(withChat, 180_000)).toEqual([]);
    // Everything in one system is taken at their word, however large the estimate.
    expect(notYetReasonsFor(covered, 11_000_000)).toEqual(["already-covered"]);
    // But not if they also keep paper or spreadsheets on the side.
    const onTheSide: FitCheckAnswers = { ...covered, mainTools: ["other-system", "spreadsheets"] };
    expect(notYetReasonsFor(onTheSide, 500_000)).toEqual(["already-covered"]);
    expect(notYetReasonsFor(onTheSide, 11_000_000)).toEqual([]);
  });
});

describe("answers that don't add up", () => {
  const unlikely: FitCheckAnswers = { ...workshop, yearlySales: "under-500k", enquiries: "over-100", goneCold: "half", typicalSale: 100_000 };

  it("can't show a loss bigger than the business", () => {
    const result = calculateFitCheck(unlikely);
    expect(result.figuresCapped).toBe(true);
    expect(result.total.high).toBeLessThanOrEqual(125_000);
    for (const a of result.areas) expect(a.pula.high).toBeLessThanOrEqual(62_500);
  });

  it("leaves sensible answers alone", () => {
    expect(calculateFitCheck(workshop).figuresCapped).toBe(false);
  });
});

describe("hot, warm or cold", () => {
  const strong: FitCheckAnswers = { ...workshop, typicalSale: 6_000 };
  const stake = 500_000;

  it("hot: a strong fit who can decide and is ready soon", () => {
    expect(temperatureFor(strong, stake)).toBe("hot");
    expect(temperatureFor({ ...strong, decider: "partner", timing: "3-months" }, stake)).toBe("hot");
  });

  it("warm: a strong fit later on, or a fit this year or sooner", () => {
    expect(temperatureFor({ ...strong, timing: "this-year" }, stake)).toBe("warm");
    expect(temperatureFor(workshop, stake)).toBe("warm");
    expect(temperatureFor({ ...workshop, timing: "this-year" }, stake)).toBe("warm");
  });

  it("warm: a strong business that's just exploring is worth keeping in touch with", () => {
    expect(temperatureFor({ ...strong, timing: "exploring" }, stake)).toBe("warm");
  });

  it("cold: not yet, or a smaller fit just exploring", () => {
    expect(temperatureFor({ ...strong, cipa: "no" }, stake)).toBe("cold");
    expect(temperatureFor({ ...workshop, timing: "exploring" }, stake)).toBe("cold");
  });

  it("someone who can't decide: only a strong business that's ready is worth reaching through them", () => {
    const admin: FitCheckAnswers = { ...strong, decider: "someone-else" };
    expect(verdictFor(admin, stake)).toBe("fit");
    expect(temperatureFor(admin, stake)).toBe("warm");
    expect(temperatureFor({ ...admin, timing: "3-months" }, stake)).toBe("warm");
    expect(temperatureFor({ ...admin, timing: "this-year" }, stake)).toBe("cold");
    expect(temperatureFor({ ...admin, timing: "exploring" }, stake)).toBe("cold");
    // A smaller business, here P3,500 a sale, still gets no contact.
    expect(temperatureFor({ ...workshop, decider: "someone-else" }, stake)).toBe("cold");
  });

  it("only someone who can decide books a call, and the sales representative contacts a warm lead who can't", () => {
    const decides = calculateFitCheck({ ...strong, decider: "partner" });
    expect(decides.offersCall).toBe(true);
    expect(decides.contactReason).toBeNull();
    const admin = calculateFitCheck({ ...strong, decider: "someone-else", typicalSale: 60_000 });
    expect(admin.temperature).toBe("warm");
    expect(admin.offersCall).toBe(false);
    expect(admin.contactReason).toBe("reach-decider");
    const notReady = calculateFitCheck({ ...strong, decider: "someone-else", typicalSale: 60_000, timing: "this-year" });
    expect(notReady.offersCall).toBe(false);
    expect(notReady.contactReason).toBeNull();
    expect(calculateFitCheck({ ...strong, cipa: "no" }).offersCall).toBe(false);
  });

  it("without a timing answer: a strong fit is warm, and a fit isn't chased", () => {
    const { timing: _s, ...strongUndated } = strong;
    expect(temperatureFor(strongUndated, stake)).toBe("warm");
    const { timing: _w, ...fitUndated } = workshop;
    expect(temperatureFor(fitUndated, stake)).toBe("cold");
  });
});

describe("a big firm already running on one system", () => {
  const bottler: FitCheckAnswers = {
    ...workshop,
    typicalSale: 52_000,
    teamSize: "200+",
    yearlySales: "over-50m",
    appCount: "1",
    mainTools: ["other-system"],
    otherSystem: "SAP",
    decider: "partner",
    timing: "3-months",
  };
  const stake = 240_000;

  it("isn't told Odoo fits, but is a custom software lead when it's ready", () => {
    const result = calculateFitCheck(bottler);
    expect(result.verdict).toBe("not-yet");
    expect(result.customSoftwareLead).toBe(true);
    expect(result.temperature).toBe("warm");
    expect(result.offersCall).toBe(false);
    expect(result.contactReason).toBe("custom-software");
    expect(temperatureFor({ ...bottler, yearlySales: "10m-50m" }, stake)).toBe("warm");
  });

  it("gets no contact below about P830,000 a month, or if it isn't ready or can't decide", () => {
    expect(temperatureFor({ ...bottler, yearlySales: "2m-10m" }, stake)).toBe("cold");
    expect(temperatureFor({ ...bottler, timing: "this-year" }, stake)).toBe("cold");
    const { timing: _t, ...undated } = bottler;
    expect(temperatureFor(undated, stake)).toBe("cold");
    expect(temperatureFor({ ...bottler, decider: "someone-else" }, stake)).toBe("cold");
    expect(temperatureFor({ ...bottler, cipa: "in-progress" }, stake)).toBe("cold");
    expect(calculateFitCheck({ ...bottler, yearlySales: "2m-10m" }).customSoftwareLead).toBe(false);
  });

  it("only hears about custom software above the same line", () => {
    expect(adviceFor(bottler, calculateFitCheck(bottler)).customSoftware).toBe(true);
    const smaller: FitCheckAnswers = { ...bottler, yearlySales: "2m-10m" };
    expect(adviceFor(smaller, calculateFitCheck(smaller)).customSoftware).toBe(false);
  });
});

describe("advice never contradicts the numbers beside it", () => {
  it("doesn't tell someone on scattered tools with little at stake that what they have is working", () => {
    const small: FitCheckAnswers = { ...workshop, enquiries: "under-10", goneCold: "a-few", typicalSale: 6_000, bookingValue: 100, missedBookings: "a-few", bookings: "under-20", stockValue: "under-100k", stockProblems: "rarely", daysToPay: "under-30", adminPeople: "1", adminHours: "under-2", reportTime: "day", yearlySales: "500k-2m", appCount: "2-3" };
    const result = calculateFitCheck(small);
    expect(result.notYetReasons).toEqual(["little-at-stake"]);
    const advice = adviceFor(small, result);
    expect(advice.why).toMatch(/too small for a full system to pay for itself/);
    expect(advice.why).not.toMatch(/aren't losing much/);
    expect(advice.steps.join(" ")).not.toMatch(/it's working/);
  });

  it("doesn't tell a firm on one system that a new one wouldn't pay for itself, beside a large figure", () => {
    const dealer: FitCheckAnswers = { ...workshop, appCount: "1", mainTools: ["other-system"], otherSystem: "Dealer system", yearlySales: "over-50m", teamSize: "51-200", typicalSale: 310_000 };
    const result = calculateFitCheck(dealer);
    expect(result.notYetReasons).toEqual(["already-covered"]);
    const advice = adviceFor(dealer, result);
    expect(advice.why).not.toMatch(/pay for itself/);
    expect(advice.steps[0]).toMatch(/ask its supplier/);
  });
});

describe("engineering firms", () => {
  it("get the verdict their answers earn: the plus is for the sales representative", () => {
    const { bookings: _b, missedBookings: _m, bookingValue: _v, ...noDiary } = workshop;
    const engineer: FitCheckAnswers = { ...noDiary, businessTypes: ["engineering"] };
    const builder: FitCheckAnswers = { ...noDiary, businessTypes: ["construction"] };
    expect(fitCheckAnswers.safeParse(engineer).success).toBe(true);
    expect(calculateFitCheck(engineer).verdict).toBe(calculateFitCheck(builder).verdict);
    expect(calculateFitCheck(engineer).temperature).toBe(calculateFitCheck(builder).temperature);
  });
});

describe("answer check (the server uses this too)", () => {
  it("accepts a full set of answers", () => {
    expect(fitCheckAnswers.safeParse(workshop).success).toBe(true);
  });

  it("asks for the diary answers when the business type gets that question", () => {
    const { bookings: _b, ...missing } = workshop;
    const result = fitCheckAnswers.safeParse({ ...missing, businessTypes: ["professional-services"] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["bookings"]);
  });

  it("rejects unknown answers, extra fields and silly amounts", () => {
    expect(fitCheckAnswers.safeParse({ ...workshop, teamSize: "1000" }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, admin: true }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, typicalSale: -5 }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, typicalSale: 1e12 }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, typicalSale: Number.NaN }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, businessTypes: [] }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, mainTools: ["paper", "paper"] }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, otherSystem: "Line one\nBcc: x@evil.com" }).success).toBe(false);
    expect(fitCheckAnswers.safeParse({ ...workshop, mainTools: ["other-system"], otherSystem: "Sage Evolution" }).success).toBe(true);
    expect(fitCheckAnswers.safeParse({ ...workshop, otherSystem: "Sage Evolution" }).success).toBe(false);
    expect(fitCheckAnswers.parse({ ...workshop, typicalSale: -0 }).typicalSale).toBe(0);
    expect(Object.is(fitCheckAnswers.parse({ ...workshop, typicalSale: -0 }).typicalSale, -0)).toBe(false);
  });

  it("lets visitors change the hourly cost, within P1 to P1,000", () => {
    const at88 = calculateFitCheck({ ...workshop, hourlyRate: 88 });
    expect(area(at88, "reports").pula).toEqual({ low: 8_000, high: 13_000 });
    expect(fitCheckAnswers.safeParse({ ...workshop, hourlyRate: 88 }).success).toBe(true);
    for (const bad of [0, -1, 1_001, 1e308, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(fitCheckAnswers.safeParse({ ...workshop, hourlyRate: bad }).success).toBe(false);
      expect(() => calculateFitCheck({ ...workshop, hourlyRate: bad })).toThrow();
    }
  });
});
