import { describe, expect, it, vi } from "vitest";
import { countsEmail, sendDailyCounts, yesterdayInGaborone, type CountEntry, type CountStore } from "./counts.ts";

const many = (step: string, n: number, source: string | null = null): CountEntry[] => Array.from({ length: n }, () => ({ step, source }));
const day: CountEntry[] = [
  ...many("opened", 10),
  ...many("opened", 6, "flyer"),
  ...many("businessTypes", 12),
  ...many("teamSize", 11),
  ...many("cipa", 11),
  ...many("mainTools", 10),
  ...many("decider", 10),
  ...many("missedSales", 9),
  ...many("gettingPaid", 4),
  ...many("diary", 2),
  ...many("betweenApps", 4),
  ...many("reports", 4),
  ...many("result", 4),
  ...many("details", 3),
  ...many("sent", 2),
  ...many("sent", 1, "flyer"),
  ...many("report-opened", 2),
  ...many("book", 1),
];

describe("yesterday, in Gaborone", () => {
  it("uses Gaborone's date, not the server's", () => {
    expect(yesterdayInGaborone(new Date("2026-11-10T06:00:00Z"))).toBe("2026-11-09");
    expect(yesterdayInGaborone(new Date("2026-11-09T23:00:00Z"))).toBe("2026-11-09");
    expect(yesterdayInGaborone(new Date("2026-11-01T06:00:00Z"))).toBe("2026-10-31");
  });
});

describe("the counts email", () => {
  const { subject, html, text } = countsEmail("2026-11-09", day);

  it("says the day's result in the subject", () => {
    expect(subject).toBe("Fit check counts for Monday 9 November: 16 opened, 3 sent");
  });

  it("has the report's look", () => {
    expect(html).toContain("#0C4243");
  });

  it("counts each step, everyone and from the flyer", () => {
    for (const body of [html, text]) {
      expect(body).toContain("Opened the check");
      expect(body).toContain("Report sent");
      expect(body).toContain("Clicked to book");
      expect(body).toContain("From flyer");
    }
    expect(text).toContain("Opened the check: 16 (flyer 6)");
    expect(text).toContain("Report sent: 3 (flyer 1)");
  });

  it("doesn't claim a flyer number where it can't know one", () => {
    const lines = text.split(/\r?\n/);
    expect(lines).toContain("Clicked to book: 1");
    expect(lines).toContain("Opened the report page: 2");
  });

  it("names the biggest drop, skipping steps only some businesses see", () => {
    for (const body of [html, text]) expect(body).toContain("Biggest drop: Missed sales to Getting paid, 5 people");
    expect(html + text).not.toContain("to Bookings");
  });

  it("marks the steps only some businesses see", () => {
    expect(text).toContain("Bookings (only some businesses): 2");
  });

  it("leaves out a step nobody reached that only some see", () => {
    expect(text).not.toContain("Stock");
  });

  it("ignores anything that isn't a known step, and other labels count only in the total", () => {
    const { text: odd } = countsEmail("2026-11-09", [...many("opened", 2), ...many("opened", 1, "poster"), ...many("nonsense", 9)]);
    expect(odd).toContain("Opened the check: 3 (flyer 0)");
    expect(odd).not.toContain("nonsense");
  });

  it("copes with a day where only one step was reached", () => {
    expect(countsEmail("2026-11-09", many("opened", 1)).text).not.toContain("Biggest drop");
  });
});

describe("the morning job", () => {
  const NOW = new Date("2026-11-10T06:00:00Z");
  const storeWith = (entries: CountEntry[]) => {
    const asked: string[] = [];
    const store: CountStore = {
      add: async () => {},
      entriesFor: async (date) => {
        asked.push(date);
        return entries;
      },
    };
    return { store, asked };
  };

  it("emails yesterday's counts to the team", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const { store, asked } = storeWith(day);
    await sendDailyCounts(store, { alertTo: ["info@kitsonexus.com"], sendMail }, NOW);
    expect(asked).toEqual(["2026-11-09"]);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toEqual(["info@kitsonexus.com"]);
    expect(sendMail.mock.calls[0][0].html).toContain("Report sent");
  });

  it("sends nothing on a day nobody took the check", async () => {
    const sendMail = vi.fn();
    await sendDailyCounts(storeWith([]).store, { alertTo: ["info@kitsonexus.com"], sendMail }, NOW);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
