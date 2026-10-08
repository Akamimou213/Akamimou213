// Every frame number in the film (30 fps, 0-based). storyboard.md mirrors this file.
// Animation components and sound cues both read from here, so picture and sound cannot drift apart.
import type { SfxName } from "./assets";
import { layout, type Point } from "./theme";

// Inclusive frame ranges; together they cover 0–449 exactly once.
export const SCENES = {
  tooManyTabs: [0, 89],
  selectAndGather: [90, 209],
  oneClearView: [210, 359],
  exploreTheDemo: [360, 449],
} as const;

// Card order everywhere: 0 Rent roll, 1 Bank portal, 2 Supplier bills.
export const T = {
  // Negative = already entering at frame 0, so the first frame is never empty paper.
  cardIn: [-6, 2, -4] as readonly number[],
  headline1: { in: 12, out: 192 },
  badgePop: [36, 46, 56] as readonly number[],
  cursorEnter: 90,
  select: [110, 126, 142] as readonly number[],
  toolbar: { in: 146, out: 170 },
  combineClick: 166,
  gather: [168, 172, 176] as readonly number[],
  badgesOut: 168,
  ringsOut: 176,
  cursorFade: 184,
  window: 176,
  footer: 190,
  chipFlip: [212, 218, 224] as readonly number[],
  headline2: { in: 228, out: 344 },
  support2In: 246,
  followUpPulse: 282,
  headline3In: 352,
  brandLineIn: 354,
  finalHold: 360,
} as const;

// Remotion spring() configs. GATHER is the requested tuning baseline.
export const SPRINGS = {
  gather: { mass: 1, stiffness: 180, damping: 22 },
  enter: { mass: 1, stiffness: 260, damping: 24 },
  pop: { mass: 1, stiffness: 260, damping: 14 },
} as const;

// A point given in a card's own coordinates (origin at its centre), placed where the card sits in scene 1–2.
const onScatteredCard = (i: number, local: Point): Point => {
  const c = layout.scattered[i];
  const r = (c.rotate * Math.PI) / 180;
  return {
    x: Math.round(c.x + local.x * Math.cos(r) - local.y * Math.sin(r)),
    y: Math.round(c.y + local.x * Math.sin(r) + local.y * Math.cos(r)),
  };
};

const tb = layout.toolbar;
const toolbarLeft = tb.centerX - (tb.pad * 2 + tb.countWidth + tb.buttonWidth) / 2;
export const BUTTON_CENTER: Point = {
  x: toolbarLeft + tb.pad + tb.countWidth + tb.buttonWidth / 2,
  y: tb.centerY,
};

// Cursor path: [frame, point]. The cursor travels between keys with an eased, slightly arced path and holds at
// a key until the next one starts. Each card is clicked 3 frames after the cursor arrives on it.
export const CURSOR_KEYS: readonly (readonly [number, Point])[] = [
  [T.cursorEnter, { x: 1990, y: 1060 }],
  [T.select[0] - 3, onScatteredCard(0, { x: 30, y: 40 })],
  [T.select[0] + 2, onScatteredCard(0, { x: 30, y: 40 })],
  [T.select[1] - 2, onScatteredCard(1, { x: 20, y: 30 })],
  [T.select[1] + 2, onScatteredCard(1, { x: 20, y: 30 })],
  [T.select[2] - 2, onScatteredCard(2, { x: -10, y: 40 })],
  [T.toolbar.in + 2, onScatteredCard(2, { x: -10, y: 40 })],
  [T.combineClick - 4, { x: BUTTON_CENTER.x + 8, y: BUTTON_CENTER.y + 8 }],
];

export const CLICK_FRAMES: readonly number[] = [...T.select, T.combineClick];

// Sound cues on the actual interaction frames.
export type Cue = { readonly frame: number; readonly sfx: SfxName; readonly gain: number; readonly why: string };
export const CUES: readonly Cue[] = [
  { frame: T.select[0], sfx: "click", gain: 0.55, why: "cursor presses Rent roll" },
  { frame: T.select[1], sfx: "click", gain: 0.55, why: "cursor presses Bank portal" },
  { frame: T.select[2], sfx: "click", gain: 0.55, why: "cursor presses Supplier bills" },
  { frame: T.combineClick, sfx: "click", gain: 0.8, why: "cursor presses Combine into one view" },
  { frame: T.gather[0], sfx: "move", gain: 0.7, why: "first card starts gathering" },
  { frame: T.headline2.in, sfx: "complete", gain: 0.6, why: "last chip flipped; One clear view lands" },
];
