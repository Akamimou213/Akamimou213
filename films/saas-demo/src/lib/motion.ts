// Pure helpers: every value is a function of the frame number. No state, no timers, no randomness.
import { Easing, interpolate } from "remotion";
import { CURSOR_KEYS, CLICK_FRAMES } from "../content/timeline";
import type { Point } from "../content/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const travel = Easing.bezier(0.45, 0, 0.15, 1);

// 0→1 over [from, from + duration], eased out.
export const progress = (frame: number, from: number, duration: number) =>
  interpolate(frame, [from, from + duration], [0, 1], { ...clamp, easing: easeOut });

// Fade/rise in at `inAt`, fade/rise out at `outAt` (optional). Returns opacity and a y offset in px.
export const enterExit = (frame: number, inAt: number, outAt: number | null, rise: number, inDur = 12, outDur = 8) => {
  const a = progress(frame, inAt, inDur);
  const b = outAt === null ? 0 : interpolate(frame, [outAt, outAt + outDur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { opacity: a * (1 - b), y: (1 - a) * rise - b * 12 };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Cursor tip position: holds at each key, travels between keys on an eased path with a slight arc.
export const cursorAt = (frame: number): Point => {
  const keys = CURSOR_KEYS;
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, p0] = keys[i - 1];
    const [f1, p1] = keys[i];
    if (frame <= f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: travel });
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(Math.PI * t) * Math.min(40, len * 0.08); // bow to the side of travel
      return { x: lerp(p0.x, p1.x, t) + (-dy / len) * arc, y: lerp(p0.y, p1.y, t) + (dx / len) * arc };
    }
  }
  return keys[keys.length - 1][1];
};

// Cursor press: dips to 0.86 on the click frame and recovers over 3 frames.
export const pressScale = (frame: number) =>
  CLICK_FRAMES.reduce(
    (s, c) => Math.min(s, interpolate(frame, [c - 1, c, c + 3], [1, 0.86, 1], clamp)),
    1,
  );
