import React from "react";
import { AbsoluteFill } from "remotion";
import { ConceptLabel } from "./components/ConceptLabel";
import { Cursor } from "./components/Cursor";
import { Headline } from "./components/Headline";
import { OverviewWindow } from "./components/OverviewWindow";
import { ReportCard } from "./components/ReportCard";
import { Sound } from "./components/Sound";
import { Toolbar } from "./components/Toolbar";
import { COPY, type Lang } from "./content/copy";
import { colors, layout, type } from "./content/theme";
import { T } from "./content/timeline";
import "./fonts";

export type SaaSDemoProps = {
  readonly lang: Lang;
};

// Layers, back to front: overview window → cards → toolbar → headlines → concept label → cursor. Sound has no layer.
// Scene ranges and every frame number: src/content/timeline.ts (mirrored in storyboard.md).
export const SaaSDemo: React.FC<SaaSDemoProps> = ({ lang }) => {
  const copy = COPY[lang];
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <OverviewWindow copy={copy} />
      {layout.stacking.map((i) => (
        <ReportCard key={copy.cards[i].label} copy={copy.cards[i]} index={i} lang={lang} />
      ))}
      <Toolbar copy={copy} />
      <Headline text={copy.headline1} inAt={T.headline1.in} outAt={T.headline1.out} />
      <Headline
        text={copy.headline2}
        inAt={T.headline2.in}
        outAt={T.headline2.out}
        support={{ text: copy.support2, inAt: T.support2In, inDuration: 12, size: type.support.size, color: colors.muted }}
      />
      <Headline
        text={copy.headline3}
        inAt={T.headline3In}
        outAt={null}
        rise={16}
        inDuration={T.finalHold - 1 - T.headline3In}
        support={{
          text: copy.brandLine,
          inAt: T.brandLineIn,
          inDuration: T.finalHold - 1 - T.brandLineIn,
          size: type.brandLine.size,
          color: colors.muted,
        }}
      />
      <ConceptLabel copy={copy} />
      <Cursor />
      <Sound />
    </AbsoluteFill>
  );
};
