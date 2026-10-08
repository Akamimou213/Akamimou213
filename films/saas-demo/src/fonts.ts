// Explicit font loading with Remotion's supported mechanism (@remotion/fonts → FontFace + delayRender),
// from local OFL files in public/fonts/, so renders never wait on the network.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { ASSETS } from "./content/assets";
import { fonts } from "./content/theme";

export const fontsLoaded = Promise.all([
  loadFont({ family: fonts.serif, url: staticFile(ASSETS.fonts.serif), weight: "400", display: "block" }),
  loadFont({ family: fonts.sans, url: staticFile(ASSETS.fonts.sans), weight: "100 900", display: "block" }),
]);
