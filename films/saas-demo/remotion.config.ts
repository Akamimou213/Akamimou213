/**
 * CLI render settings. All options: https://remotion.dev/docs/config
 * (The Node.js APIs ignore this file; pass options directly there.)
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
