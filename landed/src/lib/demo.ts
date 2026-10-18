import { addDays, dayKey, fromDisplay, parseDay, trend } from "./calc";
import type { CheckIn, Data, Dose, Meal, MealAnalysis, Weight, Workout } from "./types";

/** Deterministic PRNG so the demo looks the same on every load. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(day: string, h: number, m = 0): string {
  const d = parseDay(day);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export interface DemoMeal {
  id: string;
  label: string;
  description: string;
  art: "yogurt" | "wrap" | "eggs" | "soup";
  analysis: MealAnalysis;
}

export const DEMO_MEALS: DemoMeal[] = [
  {
    id: "yogurt",
    label: "Greek yogurt bowl",
    description: "1 cup greek yogurt with berries and a handful of almonds",
    art: "yogurt",
    analysis: {
      title: "Greek yogurt bowl with berries",
      items: [
        { name: "Greek yogurt", portion: "1 cup (170g)", proteinG: 17, confidence: "high" },
        { name: "Almonds", portion: "small handful", proteinG: 6, confidence: "medium" },
        { name: "Mixed berries", portion: "½ cup", proteinG: 1, confidence: "high" },
      ],
      proteinLowG: 20,
      proteinHighG: 28,
      proteinEstimateG: 24,
      isLikelyFood: true,
      boost: [
        { idea: "Stir in a scoop of protein powder", extraProteinG: 20 },
        { idea: "Top with hemp seeds", extraProteinG: 5 },
      ],
      note: "Easy on a small appetite.",
    },
  },
  {
    id: "wrap",
    label: "Chicken Caesar wrap",
    description: "chicken caesar wrap",
    art: "wrap",
    analysis: {
      title: "Chicken Caesar wrap",
      items: [
        { name: "Grilled chicken", portion: "about 3 oz", proteinG: 24, confidence: "medium" },
        { name: "Flour tortilla", portion: "1 large", proteinG: 5, confidence: "high" },
        { name: "Parmesan & dressing", portion: "1 tbsp each", proteinG: 3, confidence: "low" },
      ],
      proteinLowG: 26,
      proteinHighG: 38,
      proteinEstimateG: 32,
      isLikelyFood: true,
      boost: [{ idea: "Add a cup of bone broth on the side", extraProteinG: 9 }],
      note: null,
    },
  },
  {
    id: "eggs",
    label: "Two eggs on toast",
    description: "2 eggs on 1 slice of toast",
    art: "eggs",
    analysis: {
      title: "Two eggs on toast",
      items: [
        { name: "Eggs", portion: "2 large", proteinG: 12, confidence: "high" },
        { name: "Toast", portion: "1 slice", proteinG: 3, confidence: "high" },
      ],
      proteinLowG: 13,
      proteinHighG: 18,
      proteinEstimateG: 15,
      isLikelyFood: true,
      boost: [
        { idea: "Add cottage cheese on the side", extraProteinG: 12 },
        { idea: "Swap one egg for two egg whites", extraProteinG: 1 },
      ],
      note: null,
    },
  },
  {
    id: "soup",
    label: "Lentil soup",
    description: "a bowl of lentil soup",
    art: "soup",
    analysis: {
      title: "Lentil soup",
      items: [{ name: "Lentil soup", portion: "1 bowl (~1.5 cups)", proteinG: 13, confidence: "medium" }],
      proteinLowG: 10,
      proteinHighG: 18,
      proteinEstimateG: 13,
      isLikelyFood: true,
      boost: [
        { idea: "Stir in shredded chicken", extraProteinG: 15 },
        { idea: "Add a side of Greek yogurt", extraProteinG: 17 },
      ],
      note: "Warm and gentle if your stomach is unsettled.",
    },
  },
];

const MEAL_POOL: [string, number][] = [
  ["Greek yogurt bowl", 24],
  ["Two eggs on toast", 15],
  ["Protein shake", 30],
  ["Chicken salad", 32],
  ["Tuna on crackers", 22],
  ["Cottage cheese & fruit", 14],
  ["Salmon, rice & greens", 29],
  ["Lentil soup", 13],
  ["Turkey roll-ups", 15],
  ["Chicken Caesar wrap", 32],
];

export function buildDemo(today: string = dayKey()): Data {
  const r = rng(42);
  const firstDoseOffset = -3;
  const doseWeekday = parseDay(addDays(today, firstDoseOffset)).getDay();

  // Doses: every 7 days back from 3 days ago.
  const doseOffsets = [-66, -59, -52, -45, -38, -31, -24, -17, -10, -3];
  const sites = ["Abdomen L", "Abdomen R", "Thigh L", "Thigh R"];
  const doses: Dose[] = doseOffsets.map((o, i) => ({
    id: `d${i}`,
    at: at(addDays(today, o), 8, 10),
    medication: "Zepbound",
    dose: i < 4 ? "2.5 mg" : i < 7 ? "5 mg" : "2.5 mg",
    site: sites[i % 4],
  }));
  const changeDate = addDays(today, -17);

  // Weight in lb (converted to kg at the end).
  const lbAt = (o: number): number => {
    if (o <= -45) return 214 - ((o + 69) / 24) * 11; // -69 → 214, -45 → 203
    if (o <= -31) return 203 - ((o + 45) / 14) * 1; // plateau 203 → 202
    if (o <= -17) return 202 - ((o + 31) / 14) * 6; // 202 → 196
    return 196 + ((o + 17) / 17) * 3.8; // drift after taper: 196 → 199.8
  };
  const weights: Weight[] = [];
  for (let o = -69; o <= 0; o++) {
    if (o !== 0 && r() < 0.5) continue;
    const lb = lbAt(o) + (r() - 0.5) * 1.2;
    weights.push({ id: `w${o}`, day: addDays(today, o), kg: fromDisplay(lb, "lb") });
  }

  // Check-ins: nausea higher on days 1–2 after a dose; food noise louder after the taper.
  const checkins: CheckIn[] = [];
  for (let o = -60; o <= 0; o++) {
    if (o !== 0 && r() < 0.15) continue;
    const day = addDays(today, o);
    const lastDose = [...doseOffsets].reverse().find((d) => d <= o);
    const since = lastDose === undefined ? 7 : o - lastDose;
    const nausea = since >= 1 && since <= 2 ? 2 + Math.round(r()) : Math.round(r() * 1.2);
    const foodNoise = o >= -17 ? 2 + Math.round(r() * 1.4) : Math.round(r() * 1.3);
    checkins.push({ id: `c${o}`, day, foodNoise: Math.min(4, foodNoise), nausea: Math.min(4, nausea), energy: 2 + Math.round(r()) });
  }

  // Meals: 3 per day for 4 weeks; today has two so far.
  const meals: Meal[] = [];
  for (let o = -27; o <= 0; o++) {
    const day = addDays(today, o);
    const slots = o === 0 ? [7, 12] : [8, 13, 19];
    for (const h of slots) {
      const [title, protein] = MEAL_POOL[Math.floor(r() * MEAL_POOL.length)];
      meals.push({ id: `m${o}_${h}`, at: at(day, h, 30), title, protein, source: "demo" });
    }
    if (o < 0 && r() < 0.75) meals.push({ id: `m${o}_s`, at: at(day, 15, 30), title: "Protein shake", protein: 30, source: "demo" });
    if (o < 0 && r() < 0.5) meals.push({ id: `m${o}_y`, at: at(day, 21, 0), title: "Greek yogurt cup", protein: 17, source: "demo" });
  }

  // Workouts: strength twice most weeks, walks in between.
  const workouts: Workout[] = [];
  for (let o = -63; o <= -1; o++) {
    const dow = parseDay(addDays(today, o)).getDay();
    if ((dow === 1 || dow === 4) && r() > 0.2) workouts.push({ id: `s${o}`, day: addDays(today, o), kind: "strength", minutes: 35 });
    else if (r() < 0.3) workouts.push({ id: `k${o}`, day: addDays(today, o), kind: "walk", minutes: 30 });
  }

  const pts = trend(weights);
  const landingKg = [...pts].reverse().find((p) => p.day <= changeDate)?.avg ?? fromDisplay(196, "lb");

  return {
    profile: {
      name: "Jordan",
      adult: true,
      medication: "Zepbound",
      medForm: "injection",
      doseWeekday,
      doseTime: "08:00",
      currentDose: "2.5 mg",
      phase: "descent",
      startKg: fromDisplay(214, "lb"),
      goalKg: fromDisplay(185, "lb"),
      heightCm: 175,
      units: "lb",
      proteinTarget: 100,
      dietary: [],
      strength: "2x",
      worries: ["regain", "muscle"],
      hideWeight: false,
      theme: "system",
      plan: "plus",
      onboarded: true,
    },
    doses,
    meals,
    checkins,
    weights,
    workouts,
    landing: {
      changeKind: "taper",
      changeDate,
      landingKg,
      zonePct: 3,
      habitProtein: 5,
      habitStrength: 2,
      habitWeighins: 3,
      active: true,
    },
  };
}
