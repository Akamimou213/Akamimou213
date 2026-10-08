import { Audio } from "@remotion/media";
import React from "react";
import { staticFile, useVideoConfig } from "remotion";
import { ASSETS } from "../content/assets";
import { CUES } from "../content/timeline";

// One <Audio> per cue, starting on the cue's interaction frame. The cues are one data-driven template
// (timeline.ts → CUES), so they are generated in a loop rather than authored one by one.
export const Sound: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CUES.map((cue) => (
        <Audio
          key={`${cue.sfx}-${cue.frame}`}
          name={`${cue.sfx} · ${cue.why}`}
          src={staticFile(ASSETS.sfx[cue.sfx])}
          from={cue.frame}
          volume={cue.gain}
          premountFor={fps}
        />
      ))}
    </>
  );
};
