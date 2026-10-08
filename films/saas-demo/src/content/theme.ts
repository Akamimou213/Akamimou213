// Colours, type and layout. Values are explained in style-guide.md; edit them here only.
import type { ChipKind } from "./copy";

export const colors = {
  paper: "#F4F2EC",
  card: "#FFFFFF",
  ink: "#23211F",
  muted: "#6B675F",
  line: "#D8D4CA",
  neutralChip: "#EFEDE7",
  lime: "#D9F26A",
  limePressed: "#C2DB4C",
  limeTint: "#EEF8C8",
  limeInk: "#3E4A0E",
  coral: "#E5674B",
  coralTint: "#FBE4DD",
  coralInk: "#9E3B25",
} as const;

export const chips: Record<ChipKind, { readonly bg: string; readonly fg: string }> = {
  neutral: { bg: colors.neutralChip, fg: colors.muted },
  attention: { bg: colors.coralTint, fg: colors.coralInk },
  resolved: { bg: colors.limeTint, fg: colors.limeInk },
};

// Family names registered by src/fonts.ts.
export const fonts = {
  serif: "Instrument Serif",
  sans: "Archivo",
} as const;

export const type = {
  headline: { size: 150, lineHeight: 0.98, tracking: "-0.01em" },
  support: { size: 44, lineHeight: 1.2 },
  brandLine: { size: 40 },
  // Per language: "Portail bancaire" needs 34 px to clear the count badge in a 352 px card.
  cardLabel: { size: { en: 38, fr: 34 } },
  row: { size: 26 },
  chip: { size: 19, tracking: "0.06em" },
  label: { size: 32 },
  labelNote: { size: 26 },
  toolbar: { size: 28 },
  overviewTitle: { size: 32 },
  overviewMeta: { size: 26 },
  attention: { size: 30 },
} as const;

export type Point = { readonly x: number; readonly y: number };
export type Placement = Point & { readonly rotate: number };

export const layout = {
  label: { x: 80, y: 52, height: 54 },
  // Headline column; the headline's top edge stays at the same y in every scene.
  headline: { x: 120, top: 360, width: 540 },
  card: { width: 352, height: 500, radius: 18, headerHeight: 84, rowHeight: 96 },
  // Scene 1–2: loose, overlapping "tabs". Centre + rotation in degrees. Order: Rent roll, Bank portal, Supplier bills.
  scattered: [
    { x: 870, y: 380, rotate: -8 },
    { x: 1250, y: 615, rotate: 4 },
    { x: 1625, y: 400, rotate: 9 },
  ] as readonly [Placement, Placement, Placement],
  // Bottom-to-top stacking order of the cards (indices into scattered).
  stacking: [0, 2, 1] as readonly number[],
  // Scene 3–4: slots inside the overview window (centres).
  slots: [
    { x: 900, y: 508, rotate: 0 },
    { x: 1270, y: 508, rotate: 0 },
    { x: 1640, y: 508, rotate: 0 },
  ] as readonly [Placement, Placement, Placement],
  window: { x: 700, y: 150, width: 1140, height: 770, radius: 28, headerHeight: 84 },
  footer: { x: 724, y: 790, width: 1092, height: 96 },
  // Floating toolbar: fixed widths so the cursor target is known without measuring text.
  toolbar: { centerX: 1270, centerY: 932, height: 72, countWidth: 220, buttonWidth: 372, pad: 8 },
  cursor: { scale: 1.6 },
} as const;
