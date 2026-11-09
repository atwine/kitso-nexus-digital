/// <reference types="node" />
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { coverRight, linesAt, makePoints, positionAt } from "./network";

const svg = readFileSync(resolve(__dirname, "../../../public/hero/network-dots.svg"), "utf8");
// Each point in the still picture is a circle; lime points add a soft glow circle (r="16") first.
const dots = [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)]
  .map((m) => ({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) }))
  .filter((c) => c.r !== 16);

describe("moving network", () => {
  it("starts on exactly the points of the chosen still picture", () => {
    const points = makePoints();
    expect(points).toHaveLength(dots.length);
    points.forEach((p, i) => {
      const [x, y] = positionAt(p, 0);
      expect(x).toBeCloseTo(dots[i].x, 6);
      expect(y).toBeCloseTo(dots[i].y, 6);
      expect(p.r).toBe(dots[i].r);
    });
  });

  it("starts with exactly the lines of the chosen still picture", () => {
    const pictureLines = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="#FFFFFF" stroke-opacity="([\d.]+)"/g)]
      .map((m) => m.slice(1, 6).map(Number).join(" "))
      .sort();
    const startLines = linesAt(makePoints(), 0)
      .map((l) => [l.x1, l.y1, l.x2, l.y2, l.strength].join(" "))
      .sort();
    expect(pictureLines.length).toBeGreaterThan(100);
    expect(startLines).toEqual(pictureLines);
  });

  it("drifts only a little from each spot", () => {
    for (const p of makePoints()) {
      for (const t of [5, 17, 60, 600]) {
        const [x, y] = positionAt(p, t);
        expect(Math.abs(x - p.x)).toBeLessThanOrEqual(2 * p.ax);
        expect(Math.abs(y - p.y)).toBeLessThanOrEqual(2 * p.ay);
      }
    }
  });

  it("keeps the right edge of the drawing on the right edge of a phone", () => {
    const fit = coverRight(390, 600);
    expect(fit.x + 1440 * fit.scale).toBeCloseTo(390);
    expect(1440 * fit.scale).toBeGreaterThan(390);
  });
});
