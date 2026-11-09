import { describe, expect, it } from "vitest";
import { officeStatus } from "./officeHours";

// Gaborone is two hours ahead of UTC all year.
const at = (iso: string) => officeStatus(new Date(iso));

describe("officeStatus", () => {
  it("is open from 8:00 until just before 17:00 on a weekday, Gaborone time", () => {
    expect(at("2026-11-04T06:00:00Z")).toEqual({ open: true, text: "We're open now, until 17:00 in Gaborone" });
    expect(at("2026-11-04T14:59:00Z").open).toBe(true);
  });

  it("uses Gaborone's clock, not the visitor's", () => {
    // 05:59 UTC is 07:59 in Gaborone, and 15:00 UTC is 17:00.
    expect(at("2026-11-04T05:59:00Z").open).toBe(false);
    expect(at("2026-11-04T15:00:00Z").open).toBe(false);
  });

  it("says when it next opens", () => {
    expect(at("2026-11-04T04:00:00Z").text).toBe("We're closed now. We open today at 8:00 in Gaborone");
    expect(at("2026-11-04T16:00:00Z").text).toBe("We're closed now. We open tomorrow at 8:00 in Gaborone");
    // Thursday evening opens Friday; Friday evening and the weekend open Monday.
    expect(at("2026-11-05T16:00:00Z").text).toContain("tomorrow");
    expect(at("2026-11-06T16:00:00Z").text).toContain("on Monday");
    expect(at("2026-11-07T10:00:00Z").text).toContain("on Monday");
    expect(at("2026-11-08T10:00:00Z").text).toContain("on Monday");
  });
});
