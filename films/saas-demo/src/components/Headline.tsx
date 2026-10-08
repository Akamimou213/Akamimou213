import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts, layout, type } from "../content/theme";
import { enterExit } from "../lib/motion";

type Props = {
  readonly text: string;
  readonly inAt: number;
  readonly outAt: number | null;
  readonly rise?: number;
  readonly inDuration?: number;
  readonly support?: {
    readonly text: string;
    readonly inAt: number;
    readonly inDuration: number;
    readonly size: number;
    readonly color: string;
  };
};

// Headlines share one anchor (layout.headline) so each new line lands exactly where the last one was.
// Between its entrance and its exit a headline does not move.
export const Headline: React.FC<Props> = ({ text, inAt, outAt, rise = 24, inDuration = 12, support }) => {
  const frame = useCurrentFrame();
  const h = enterExit(frame, inAt, outAt, rise, inDuration);
  const s = support ? enterExit(frame, support.inAt, outAt, 16, support.inDuration) : null;
  if (h.opacity <= 0 && (!s || s.opacity <= 0)) return null;
  return (
    <div style={{ position: "absolute", left: layout.headline.x, top: layout.headline.top, width: layout.headline.width }}>
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: type.headline.size,
          lineHeight: type.headline.lineHeight,
          letterSpacing: type.headline.tracking,
          color: colors.ink,
          whiteSpace: "pre-line",
          opacity: h.opacity,
          translate: `0px ${h.y}px`,
        }}
      >
        {text}
      </div>
      {support && s && support.text ? (
        <div
          style={{
            marginTop: 36,
            fontFamily: fonts.sans,
            fontSize: support.size,
            lineHeight: type.support.lineHeight,
            fontWeight: 400,
            color: support.color,
            whiteSpace: "pre-line",
            opacity: s.opacity,
            translate: `0px ${s.y}px`,
          }}
        >
          {support.text}
        </div>
      ) : null}
    </div>
  );
};
