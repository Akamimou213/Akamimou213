// Asset paths, relative to public/ (resolved with staticFile()). Licences: public/fonts/LICENSE-*.txt;
// the WAVs are synthesized by scripts/make-sfx.mjs.
export const ASSETS = {
  fonts: {
    serif: "fonts/instrument-serif-latin-400-normal.woff2",
    sans: "fonts/archivo-latin-wght-normal.woff2",
  },
  sfx: {
    click: "sfx/click.wav",
    move: "sfx/move.wav",
    complete: "sfx/complete.wav",
  },
} as const;

export type SfxName = keyof typeof ASSETS.sfx;
