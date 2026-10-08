import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CardCopy, Lang, Row } from "../content/copy";
import { chips, colors, fonts, layout, type } from "../content/theme";
import { SPRINGS, T } from "../content/timeline";
import { lerp, progress } from "../lib/motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { card } = layout;

const Chip: React.FC<{ readonly text: string; readonly kind: keyof typeof chips; readonly opacity: number }> = ({
  text,
  kind,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      opacity,
      padding: "5px 12px",
      borderRadius: 999,
      background: chips[kind].bg,
      color: chips[kind].fg,
      fontSize: type.chip.size,
      fontWeight: 600,
      letterSpacing: type.chip.tracking,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const RowView: React.FC<{ readonly row: Row; readonly flip: number; readonly last: boolean }> = ({ row, flip, last }) => {
  const same = row.before.text === row.after.text && row.before.kind === row.after.kind;
  const blip = same ? 1 : 1 + 0.06 * Math.sin(Math.PI * flip);
  return (
    <div
      style={{
        height: card.rowHeight,
        padding: "14px 24px 0",
        borderBottom: last ? "none" : `1.5px solid ${colors.line}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: type.row.size,
          fontWeight: 500,
          color: colors.ink,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        <span>{row.name}</span>
        <span>{row.amount}</span>
      </div>
      <div style={{ position: "relative", height: 34, marginTop: 10, scale: String(blip), transformOrigin: "left center" }}>
        <Chip text={row.before.text} kind={row.before.kind} opacity={same ? 1 : 1 - flip} />
        {same ? null : <Chip text={row.after.text} kind={row.after.kind} opacity={flip} />}
      </div>
    </div>
  );
};

// One report card. Its position is a single spring from where it sits in scene 1 to its overview slot,
// so it never jumps: only translation, rotation and shadow change, never size.
export const ReportCard: React.FC<{ readonly copy: CardCopy; readonly index: number; readonly lang: Lang }> = ({
  copy,
  index,
  lang,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, delay: T.cardIn[index], config: SPRINGS.enter });
  const enterOpacity = interpolate(frame, [T.cardIn[index], T.cardIn[index] + 4], [0, 1], clamp);
  const gather = spring({ frame, fps, delay: T.gather[index], config: SPRINGS.gather });

  const from = layout.scattered[index];
  const to = layout.slots[index];
  const cx = lerp(from.x, to.x, gather);
  const cy = lerp(from.y, to.y, gather) + (1 - enter) * 40;
  const rotate = lerp(from.rotate, to.rotate, gather);
  const lift = 1 - Math.min(1, gather);

  const selected = progress(frame, T.select[index], 3) * (1 - progress(frame, T.ringsOut, 10));
  const check = spring({ frame, fps, delay: T.select[index], config: SPRINGS.pop }) * (1 - progress(frame, T.ringsOut, 10));
  const badge = spring({ frame, fps, delay: T.badgePop[index], config: SPRINGS.pop }) * (1 - progress(frame, T.badgesOut, 7));
  const flip = progress(frame, T.chipFlip[index], 6);

  return (
    <div
      style={{
        position: "absolute",
        left: cx - card.width / 2,
        top: cy - card.height / 2,
        width: card.width,
        height: card.height,
        rotate: `${rotate}deg`,
        opacity: enterOpacity,
        borderRadius: card.radius,
        background: colors.card,
        border: `1.5px solid ${colors.line}`,
        boxSizing: "border-box",
        outline: `3px solid rgba(35, 33, 31, ${selected})`,
        outlineOffset: 2,
        boxShadow: `0 ${24 * lift}px ${48 * lift}px rgba(35, 33, 31, ${0.12 * lift}), 0 2px 6px rgba(35, 33, 31, ${0.06 * lift})`,
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          height: card.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 22px 0 24px",
          borderBottom: `1.5px solid ${colors.line}`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: type.cardLabel.size[lang], fontWeight: 600, color: colors.ink, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
          {copy.label}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: colors.coral,
            color: colors.card,
            fontSize: 22,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            scale: String(Math.max(0, badge)),
          }}
        >
          {copy.badge}
        </div>
      </div>
      <div style={{ paddingTop: 8 }}>
        {copy.rows.map((row, i) => (
          <RowView key={row.name + row.amount} row={row} flip={flip} last={i === copy.rows.length - 1} />
        ))}
      </div>
      {/* Selection check, outside the top-right corner */}
      <div
        style={{
          position: "absolute",
          right: -18,
          top: -18,
          width: 44,
          height: 44,
          borderRadius: 999,
          background: colors.lime,
          border: `2px solid ${colors.ink}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(Math.max(0, check)),
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22">
          <path d="M4 11.5 L9 16 L18 6" fill="none" stroke={colors.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
