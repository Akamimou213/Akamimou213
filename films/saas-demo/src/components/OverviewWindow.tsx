import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { Copy } from "../content/copy";
import { chips, colors, fonts, layout, type } from "../content/theme";
import { T } from "../content/timeline";
import { enterExit, progress } from "../lib/motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { window: win, footer } = layout;

// The container that forms around the gathered cards (behind them), plus its header bar and the NSF footer row.
export const OverviewWindow: React.FC<{ readonly copy: Copy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const shown = progress(frame, T.window, 10);
  if (shown <= 0) return null;
  const foot = enterExit(frame, T.footer, null, 12, 10);
  const pulse = interpolate(frame, [T.followUpPulse, T.followUpPulse + 6, T.followUpPulse + 15], [1, 1.08, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        borderRadius: win.radius,
        background: colors.card,
        border: `1.5px solid ${colors.line}`,
        boxSizing: "border-box",
        overflow: "hidden",
        opacity: shown,
        scale: String(interpolate(shown, [0, 1], [0.985, 1])),
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          height: win.headerHeight,
          background: colors.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}
      >
        <div style={{ color: colors.paper, fontSize: type.overviewTitle.size, fontWeight: 600 }}>{copy.overviewTitle}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: colors.paper, opacity: 0.78, fontSize: type.overviewMeta.size, fontWeight: 500 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: colors.lime }} />
          {copy.overviewMeta}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: footer.x - win.x,
          top: footer.y - win.y,
          width: footer.width,
          height: footer.height,
          borderRadius: 18,
          background: colors.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxSizing: "border-box",
          opacity: foot.opacity,
          translate: `0px ${foot.y}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: type.attention.size, fontWeight: 500, color: colors.ink }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: colors.coral }} />
          {copy.attention}
        </div>
        <div
          style={{
            padding: "8px 20px",
            borderRadius: 999,
            background: chips.attention.bg,
            color: chips.attention.fg,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: type.chip.tracking,
            textTransform: "uppercase",
            scale: String(pulse),
          }}
        >
          {copy.followUp}
        </div>
      </div>
    </div>
  );
};
