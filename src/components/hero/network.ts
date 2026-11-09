// The "Network of points" hero background, chosen by the owner on 4 Nov 2026
// (Paper page J, option 2). The still pictures in public/hero/ were drawn from
// this same recipe (70 points from seed 23, lines between points closer than
// 135px, every 11th point lime). makePoints() and linesAt() repeat it, so the
// first moving frame is identical to the still picture, dot for dot and line
// for line; network.test.ts checks that against the picture.

export const W = 1440;
export const H = 560;
export const LINK_DISTANCE = 135;
const LIME = "#A5C337";

export interface Point {
  x: number;
  y: number;
  lime: boolean;
  r: number;
  opacity: number;
  // Slow drift around the starting spot.
  ax: number;
  ay: number;
  speed: number;
  phase: number;
}

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const round1 = (n: number) => Math.round(n * 10) / 10;

export const makePoints = (): Point[] => {
  const rnd = seeded(23);
  const spots: [number, number][] = [];
  for (let i = 0; i < 70; i++) spots.push([round1(W * (0.2 + 0.8 * Math.sqrt(rnd()))), round1(H * rnd())]);

  const drift = seeded(91);
  return spots.map(([x, y], i) => {
    const lime = i % 11 === 0;
    return {
      x,
      y,
      lime,
      r: lime ? 4.5 : round1(1.5 + rnd() * 1.8),
      opacity: lime ? 1 : round1(0.4 + rnd() * 0.4),
      ax: 10 + drift() * 14,
      ay: 8 + drift() * 12,
      speed: (2 * Math.PI) / (22 + drift() * 20), // one loop every 22 to 42 seconds
      phase: drift() * 2 * Math.PI,
    };
  });
};

// Where each point sits t seconds in. At t = 0 every point is on its spot.
export const positionAt = (p: Point, t: number): [number, number] => [
  p.x + p.ax * (Math.sin(p.speed * t + p.phase) - Math.sin(p.phase)),
  p.y + p.ay * (Math.cos(p.speed * t + p.phase) - Math.cos(p.phase)),
];

// Fits the 1440x560 design into the canvas like CSS "cover", pinned to the
// right edge so narrow screens keep the lit right side in view.
export const coverRight = (width: number, height: number) => {
  const scale = Math.max(width / W, height / H);
  return { scale, x: width - W * scale, y: (height - H * scale) / 2 };
};

export type Line = { x1: number; y1: number; x2: number; y2: number; strength: number };

// Lines between points closer than LINK_DISTANCE. A line's strength is the
// still picture's own rule, (1 - distance / 135) * 0.3 rounded to one decimal,
// so lines come in just three strengths (0.1, 0.2, 0.3) and fade in steps.
export const linesAt = (points: Point[], t: number): Line[] => {
  const at = points.map((p) => positionAt(p, t));
  const lines: Line[] = [];
  for (let i = 0; i < at.length; i++) {
    for (let j = i + 1; j < at.length; j++) {
      const [x1, y1] = at[i];
      const [x2, y2] = at[j];
      const distance = Math.hypot(x1 - x2, y1 - y2);
      if (distance >= LINK_DISTANCE) continue;
      const strength = round1((1 - distance / LINK_DISTANCE) * 0.3);
      if (strength > 0) lines.push({ x1, y1, x2, y2, strength });
    }
  }
  return lines;
};

// Draws only the dots and lines, on a transparent canvas. The teal, its glow
// and the shading on the left are still pictures layered around the canvas.
// Lines of the same strength go out in one stroke, so a frame needs three
// strokes instead of one per line. width and height are in CSS pixels; dpr is
// the screen's pixel density.
export const drawNetwork = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  t: number,
  width: number,
  height: number,
  dpr = 1,
) => {
  const fit = coverRight(width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(fit.scale * dpr, 0, 0, fit.scale * dpr, fit.x * dpr, fit.y * dpr);

  const byStrength = new Map<number, Line[]>();
  for (const line of linesAt(points, t)) {
    const group = byStrength.get(line.strength);
    if (group) group.push(line);
    else byStrength.set(line.strength, [line]);
  }
  ctx.lineWidth = 1;
  for (const [strength, lines] of byStrength) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${strength})`;
    ctx.beginPath();
    for (const line of lines) {
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
    }
    ctx.stroke();
  }

  points.forEach((p) => {
    const [x, y] = positionAt(p, t);
    if (p.lime) {
      ctx.fillStyle = "rgba(165, 195, 55, 0.14)";
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = LIME;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    }
    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, 2 * Math.PI);
    ctx.fill();
  });
};
