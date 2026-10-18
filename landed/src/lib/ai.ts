import { estimateFromText } from "./protein";
import type { MealAnalysis } from "./types";

/**
 * Meal analysis client.
 * - If VITE_ANALYZE_MEAL_URL is set (a Bolt server function / Supabase edge function URL), photos and text go there.
 * - Without it, typed descriptions use the offline estimator, and photos ask the user to describe the meal.
 */
const ENDPOINT = import.meta.env.VITE_ANALYZE_MEAL_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const aiConnected = Boolean(ENDPOINT);

export class AnalysisError extends Error {
  constructor(public kind: "no-ai" | "timeout" | "invalid" | "not-food" | "nothing-found" | "network", message: string) {
    super(message);
  }
}

export async function compressImage(file: File, maxSide = 1024, quality = 0.7): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image."));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isAnalysis(x: unknown): x is MealAnalysis {
  const a = x as MealAnalysis;
  return (
    !!a &&
    typeof a.title === "string" &&
    Array.isArray(a.items) &&
    typeof a.proteinEstimateG === "number" &&
    typeof a.proteinLowG === "number" &&
    typeof a.proteinHighG === "number" &&
    typeof a.isLikelyFood === "boolean"
  );
}

/** Clamp and reconcile numbers so the UI never shows impossible values. */
export function sanitize(a: MealAnalysis): MealAnalysis {
  const items = a.items.map((i) => ({ ...i, proteinG: Math.max(0, Math.min(150, Math.round(i.proteinG))) }));
  const sum = items.reduce((s, i) => s + i.proteinG, 0);
  let est = Math.round(a.proteinEstimateG);
  if (items.length && Math.abs(est - sum) > Math.max(5, sum * 0.25)) est = sum;
  const low = Math.min(Math.round(a.proteinLowG), est);
  const high = Math.max(Math.round(a.proteinHighG), est);
  const banned = /calori|kcal|\bdose|\bmg\b|medication|titrat|taper/i;
  return {
    ...a,
    items,
    proteinEstimateG: est,
    proteinLowG: Math.max(0, low),
    proteinHighG: high,
    boost: (a.boost ?? []).filter((b) => !banned.test(b.idea)).slice(0, 3),
    note: a.note && !banned.test(a.note) ? a.note : null,
  };
}

export async function analyzeMeal(input: { imageDataUrl?: string; description?: string; proteinLeftG: number }): Promise<MealAnalysis> {
  if (!ENDPOINT) {
    if (input.description) {
      const local = estimateFromText(input.description);
      if (!local) throw new AnalysisError("nothing-found", "We couldn't recognise those foods. Try simpler words, like “2 eggs, toast”.");
      return local;
    }
    throw new AnalysisError("no-ai", "Photo estimates aren't connected yet. Describe the meal instead and we'll estimate it.");
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(ANON_KEY ? { Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY } : {}),
      },
      body: JSON.stringify({ imageBase64: input.imageDataUrl, description: input.description, proteinLeftG: input.proteinLeftG }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.error) {
      console.error("analyze-meal failed", res.status, json?.error);
      throw new AnalysisError("invalid", "We couldn't read this one. Try again, or describe it instead.");
    }
    if (!isAnalysis(json)) throw new AnalysisError("invalid", "We couldn't read this one. Try again, or describe it instead.");
    if (!json.isLikelyFood) throw new AnalysisError("not-food", "That doesn't look like a meal. Try again or describe it.");
    return sanitize(json);
  } catch (e) {
    if (e instanceof AnalysisError) throw e;
    if ((e as Error).name === "AbortError") throw new AnalysisError("timeout", "That took too long. Try again, or describe it instead.");
    console.error("analyze-meal network error", (e as Error).message);
    // Typed descriptions still work offline.
    if (input.description) {
      const local = estimateFromText(input.description);
      if (local) return local;
    }
    throw new AnalysisError("network", "Couldn't reach the estimator. Describe it instead?");
  } finally {
    clearTimeout(timer);
  }
}
