import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { countStep, forgetCounted } from "./count";

const sent = (mock: ReturnType<typeof vi.fn>) => mock.mock.calls.map((c) => JSON.parse(c[1].body));

beforeEach(() => sessionStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("counting a step", () => {
  it("sends only the step and the label", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    countStep("teamSize", "flyer");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/count");
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
    expect(sent(fetchMock)).toEqual([{ step: "teamSize", source: "flyer" }]);
  });

  it("counts a step once per person, even if they go back or reload", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    countStep("teamSize", null);
    countStep("cipa", null);
    countStep("teamSize", null);
    expect(sent(fetchMock).map((b) => b.step)).toEqual(["teamSize", "cipa"]);
  });

  it("counts the next person on a shared tablet", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    countStep("opened", null);
    forgetCounted();
    countStep("opened", null);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses no cookies", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
    countStep("opened", null);
    expect(document.cookie).toBe("");
  });

  it("never gets in the visitor's way", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(() => countStep("opened", null)).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve));

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => countStep("cipa", null)).not.toThrow();
  });
});
