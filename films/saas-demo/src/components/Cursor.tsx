import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, layout } from "../content/theme";
import { T } from "../content/timeline";
import { cursorAt, pressScale, progress } from "../lib/motion";

// Original arrow cursor. Its tip is the path's origin, so the tip sits exactly on the timeline's target points.
export const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.cursorEnter) return null;
  const opacity = 1 - progress(frame, T.cursorFade, 11);
  if (opacity <= 0) return null;
  const p = cursorAt(frame);
  return (
    <svg
      width={22 * layout.cursor.scale}
      height={34 * layout.cursor.scale}
      viewBox="-1.5 -1.5 22 34"
      style={{
        position: "absolute",
        left: p.x - 1.5 * layout.cursor.scale,
        top: p.y - 1.5 * layout.cursor.scale,
        opacity,
        scale: String(pressScale(frame)),
        transformOrigin: `${1.5 * layout.cursor.scale}px ${1.5 * layout.cursor.scale}px`,
        overflow: "visible",
        filter: "drop-shadow(0 3px 4px rgba(35, 33, 31, 0.25))",
      }}
    >
      <path
        d="M0 0 L0 26 L6.2 20.2 L10.4 29.6 L14.6 27.8 L10.5 18.6 L18.6 18.6 Z"
        fill={colors.ink}
        stroke={colors.card}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
};
