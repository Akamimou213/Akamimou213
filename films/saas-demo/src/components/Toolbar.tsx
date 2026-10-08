import React from "react";
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../content/copy";
import { colors, fonts, layout, type } from "../content/theme";
import { SPRINGS, T } from "../content/timeline";
import { progress } from "../lib/motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const tb = layout.toolbar;

// Floating selection toolbar (dramatized action, see brief.md). Fixed widths keep the cursor target exact.
export const Toolbar: React.FC<{ readonly copy: Copy }> = ({ copy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, delay: T.toolbar.in, config: SPRINGS.enter });
  const opacity = progress(frame, T.toolbar.in, 6) * (1 - progress(frame, T.toolbar.out, 8));
  if (opacity <= 0) return null;
  const pressed = interpolate(frame, [T.combineClick - 1, T.combineClick], [0, 1], clamp);
  const width = tb.pad * 2 + tb.countWidth + tb.buttonWidth;

  return (
    <div
      style={{
        position: "absolute",
        left: tb.centerX - width / 2,
        top: tb.centerY - tb.height / 2,
        width,
        height: tb.height,
        boxSizing: "border-box",
        padding: tb.pad,
        borderRadius: 999,
        background: colors.ink,
        display: "flex",
        alignItems: "center",
        opacity,
        translate: `0px ${(1 - enter) * 24}px`,
        fontFamily: fonts.sans,
        fontSize: type.toolbar.size,
        boxShadow: "0 18px 40px rgba(35, 33, 31, 0.18)",
      }}
    >
      <div style={{ width: tb.countWidth, textAlign: "center", color: colors.paper, fontWeight: 500, whiteSpace: "nowrap" }}>
        {copy.selectedCount}
      </div>
      <div
        style={{
          width: tb.buttonWidth,
          height: tb.height - tb.pad * 2,
          borderRadius: 999,
          background: interpolateColors(pressed, [0, 1], [colors.lime, colors.limePressed]),
          color: colors.ink,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          scale: String(1 - 0.03 * pressed),
        }}
      >
        {copy.combine}
      </div>
    </div>
  );
};
