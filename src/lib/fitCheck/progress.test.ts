import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearProgress, loadProgress, saveProgress, sourceFromSearch, tabRunId } from "./progress";

const KEY = "kitso-fit-check-progress";
const NOW = new Date("2026-12-03T10:00:00Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("saved answers", () => {
  it("brings back the answers and where the visitor came from", () => {
    saveProgress({ draft: { teamSize: "6-20", businessTypes: ["equipment"], typicalSale: 3500 }, source: "flyer" }, NOW);
    expect(loadProgress(NOW)).toEqual({ draft: { teamSize: "6-20", businessTypes: ["equipment"], typicalSale: 3500 }, source: "flyer" });
  });

  it("forgets them after 14 days, so an old visit can't resurface", () => {
    saveProgress({ draft: { teamSize: "6-20" }, source: null }, NOW);
    expect(loadProgress(NOW + 14 * DAY - 1)).not.toBeNull();
    expect(loadProgress(NOW + 14 * DAY)).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("clears on request", () => {
    saveProgress({ draft: { teamSize: "6-20" }, source: "flyer" }, NOW);
    clearProgress();
    expect(loadProgress(NOW)).toBeNull();
  });

  it("stores nothing when there is nothing to remember", () => {
    saveProgress({ draft: {}, source: null }, NOW);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("drops anything that isn't a known answer of the right shape", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ savedAt: NOW, source: "<b>bad</b>", draft: { teamSize: "6-20", firstName: "Thabo", businessTypes: "retail", mainTools: [1], typicalSale: {} } }),
    );
    expect(loadProgress(NOW)).toEqual({ draft: { teamSize: "6-20" }, source: null });
  });

  it("drops old answers the check no longer offers, so nobody gets stuck on them", () => {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: NOW, source: null, draft: { teamSize: "6-20", cipa: "maybe", timing: "someday", businessTypes: ["gone"], __proto__x: "1", hourlyRate: 5000 } }));
    expect(loadProgress(NOW)?.draft).toEqual({ teamSize: "6-20" });
  });

  it("ignores damaged saved data", () => {
    for (const bad of ["{not json", "null", "[]", '{"savedAt":"soon","draft":{}}', `{"savedAt":${NOW},"draft":[]}`]) {
      localStorage.setItem(KEY, bad);
      expect(loadProgress(NOW)).toBeNull();
    }
  });

  it("still works when the browser refuses storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveProgress({ draft: { teamSize: "6-20" }, source: null }, NOW)).not.toThrow();
    expect(loadProgress(NOW)).toBeNull();
  });
});

describe("this tab's run", () => {
  it("stays the same across a reload in one tab, and differs in a new tab", () => {
    const first = tabRunId();
    expect(tabRunId()).toBe(first);
    sessionStorage.clear();
    expect(tabRunId()).not.toBe(first);
  });
});

describe("where the visitor came from", () => {
  it("reads a tidy label from the address", () => {
    expect(sourceFromSearch("?from=flyer")).toBe("flyer");
    expect(sourceFromSearch("?from=notice-board-2")).toBe("notice-board-2");
  });

  it("ignores a missing or untidy label", () => {
    for (const bad of ["", "?other=1", "?from=", "?from=<script>", "?from=FLYER", `?from=${"a".repeat(31)}`]) {
      expect(sourceFromSearch(bad)).toBeNull();
    }
  });
});
