import { useEffect, useRef, useState } from "react";
import { drawNetwork, makePoints } from "./network";

// The dots move a few pixels a second, so 15 frames a second looks smooth and
// keeps the work small (measured in Sprint 2b: see the speed check notes).
const FRAME_MS = 1000 / 15;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Shows the still dots-and-lines picture, then swaps it for the moving
// version. The first moving frame is identical to the picture, so the swap is
// instant and invisible. The movement never runs for visitors who ask for less
// motion (checked live), and it stops while the hero is off screen.
const NetworkCanvas = ({ layerClassName }: { layerClassName: string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const points = makePoints();
    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = 0;
    let pausedAt = 0;
    let lastT = 0;
    let onScreen = true;
    let showing = false; // mirrors `moving`, so React is told only when it changes
    let size = { width: 0, height: 0, dpr: 1 };

    const draw = (t: number) => {
      lastT = t;
      drawNetwork(ctx, points, t, size.width, size.height, size.dpr);
    };

    // Resizing a canvas wipes it, so redraw at once rather than at the next frame.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { width, height } = el.getBoundingClientRect();
      size = { width, height, dpr };
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      if (started) draw(lastT);
    };

    // A timer wakes the loop 15 times a second and only then asks for a frame.
    // Asking for a frame every time (60 a second) made the browser prepare
    // frames it then threw away, which cost more than the drawing itself.
    const tick = (now: number) => {
      frame = 0;
      if (!started) started = now;
      draw((now - started) / 1000);
      if (!showing) {
        showing = true;
        setMoving(true);
      }
      timer = setTimeout(() => (frame = requestAnimationFrame(tick)), FRAME_MS);
    };

    const start = () => {
      if (frame || timer || !onScreen || reducedMotion.matches || document.visibilityState !== "visible") return;
      // Resume where it stopped, rather than jumping ahead by the time it was paused.
      if (pausedAt && started) started += performance.now() - pausedAt;
      pausedAt = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame || timer) pausedAt = performance.now();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = undefined;
    };

    const onMotionSetting = () => {
      if (reducedMotion.matches) {
        stop();
        showing = false;
        setMoving(false);
      } else start();
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());

    resize();
    const resizer = new ResizeObserver(resize);
    resizer.observe(el);
    const watcher = new IntersectionObserver((entries) => {
      // Several readings can arrive together after a fast scroll; the last is current.
      onScreen = entries[entries.length - 1].isIntersecting;
      if (onScreen) start();
      else stop();
    });
    watcher.observe(el);
    reducedMotion.addEventListener("change", onMotionSetting);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      resizer.disconnect();
      watcher.disconnect();
      reducedMotion.removeEventListener("change", onMotionSetting);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <img src="/hero/network-dots.svg" alt="" className={`${layerClassName} ${moving ? "invisible" : ""}`} />
      <canvas ref={canvas} aria-hidden="true" className={`${layerClassName} ${moving ? "" : "invisible"}`} />
    </>
  );
};

export default NetworkCanvas;
