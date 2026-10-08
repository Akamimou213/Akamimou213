import React from "react";
import type { Copy } from "../content/copy";
import { colors, fonts, layout, type } from "../content/theme";

// Static on every frame (0–449). Never animates, never overlaps the product area.
export const ConceptLabel: React.FC<{ readonly copy: Copy }> = ({ copy }) => (
  <div
    style={{
      position: "absolute",
      left: layout.label.x,
      top: layout.label.y,
      height: layout.label.height,
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily: fonts.sans,
      whiteSpace: "nowrap",
    }}
  >
    <div
      style={{
        height: layout.label.height,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderRadius: 999,
        background: colors.card,
        border: `1.5px solid ${colors.line}`,
        color: colors.ink,
        fontSize: type.label.size,
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}
    >
      {copy.label}
    </div>
    <div style={{ color: colors.muted, fontSize: type.labelNote.size, fontWeight: 500 }}>{copy.labelNote}</div>
  </div>
);
