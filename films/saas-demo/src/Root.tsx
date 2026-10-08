import React from "react";
import { Composition } from "remotion";
import { SaaSDemo } from "./SaaSDemo";

// 1920×1080 · 30 fps · 450 frames (15 s). Timing lives in src/content/timeline.ts.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SaaSDemo"
        component={SaaSDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lang: "en" as const }}
      />
      <Composition
        id="SaaSDemoFR"
        component={SaaSDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lang: "fr" as const }}
      />
    </>
  );
};
