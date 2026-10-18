import type { MealAnalysis, MealItem } from "./types";

/**
 * Offline protein estimator for typed meal descriptions.
 * Values are typical grams of protein per stated unit, rounded; good enough for a range, not a lab.
 */
interface Food {
  keys: string[];
  name: string;
  unit: string; // how one "qty" is described
  protein: number; // grams per unit
}

const FOODS: Food[] = [
  { keys: ["egg white"], name: "Egg whites", unit: "white", protein: 3.6 },
  { keys: ["egg"], name: "Egg", unit: "egg", protein: 6.3 },
  { keys: ["greek yogurt", "greek yoghurt", "skyr"], name: "Greek yogurt", unit: "cup (170g)", protein: 17 },
  { keys: ["yogurt", "yoghurt"], name: "Yogurt", unit: "cup", protein: 9 },
  { keys: ["cottage cheese"], name: "Cottage cheese", unit: "half cup", protein: 12 },
  { keys: ["protein shake", "shake", "premier protein", "fairlife"], name: "Protein shake", unit: "bottle", protein: 30 },
  { keys: ["protein bar"], name: "Protein bar", unit: "bar", protein: 20 },
  { keys: ["protein milk", "ultrafiltered milk"], name: "Protein milk", unit: "cup", protein: 13 },
  { keys: ["milk"], name: "Milk", unit: "cup", protein: 8 },
  { keys: ["string cheese", "cheese stick"], name: "String cheese", unit: "stick", protein: 7 },
  { keys: ["cheese"], name: "Cheese", unit: "slice (28g)", protein: 7 },
  { keys: ["chicken breast", "chicken"], name: "Chicken", unit: "palm (4 oz)", protein: 30 },
  { keys: ["turkey"], name: "Turkey", unit: "palm (4 oz)", protein: 28 },
  { keys: ["steak", "beef", "burger patty", "mince"], name: "Beef", unit: "palm (4 oz)", protein: 28 },
  { keys: ["pork", "ham"], name: "Pork", unit: "palm (4 oz)", protein: 26 },
  { keys: ["salmon"], name: "Salmon", unit: "fillet (4 oz)", protein: 25 },
  { keys: ["tuna"], name: "Tuna", unit: "can", protein: 25 },
  { keys: ["shrimp", "prawn"], name: "Shrimp", unit: "palm (4 oz)", protein: 24 },
  { keys: ["fish", "cod", "tilapia"], name: "White fish", unit: "fillet (4 oz)", protein: 23 },
  { keys: ["tofu"], name: "Tofu", unit: "half block (150g)", protein: 15 },
  { keys: ["tempeh"], name: "Tempeh", unit: "half cup", protein: 16 },
  { keys: ["edamame"], name: "Edamame", unit: "cup", protein: 17 },
  { keys: ["lentil soup"], name: "Lentil soup", unit: "bowl", protein: 12 },
  { keys: ["lentil"], name: "Lentils", unit: "cup cooked", protein: 18 },
  { keys: ["chickpea", "hummus"], name: "Chickpeas / hummus", unit: "half cup", protein: 7 },
  { keys: ["beans", "black beans", "kidney beans"], name: "Beans", unit: "cup", protein: 15 },
  { keys: ["bone broth"], name: "Bone broth", unit: "cup", protein: 9 },
  { keys: ["peanut butter", "almond butter"], name: "Nut butter", unit: "2 tbsp", protein: 7 },
  { keys: ["nuts", "almonds", "peanuts"], name: "Nuts", unit: "handful", protein: 6 },
  { keys: ["quinoa"], name: "Quinoa", unit: "cup cooked", protein: 8 },
  { keys: ["oat", "oatmeal", "porridge"], name: "Oats", unit: "bowl", protein: 6 },
  { keys: ["toast", "bread", "bagel"], name: "Bread", unit: "slice", protein: 4 },
  { keys: ["wrap", "tortilla"], name: "Tortilla wrap", unit: "wrap", protein: 5 },
  { keys: ["rice"], name: "Rice", unit: "cup", protein: 4 },
  { keys: ["pasta", "noodles"], name: "Pasta", unit: "cup", protein: 8 },
  { keys: ["potato"], name: "Potato", unit: "medium", protein: 4 },
  { keys: ["soup"], name: "Soup", unit: "bowl", protein: 6 },
  { keys: ["salad"], name: "Salad greens", unit: "bowl", protein: 2 },
  { keys: ["broccoli"], name: "Broccoli", unit: "cup", protein: 3 },
  { keys: ["berries", "banana", "apple", "fruit"], name: "Fruit", unit: "serving", protein: 1 },
  { keys: ["coffee with milk", "latte"], name: "Latte", unit: "cup", protein: 6 },
  { keys: ["crackers"], name: "Crackers", unit: "serving", protein: 2 },
];

const WORD_NUMS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, couple: 2 };

function parseQty(chunk: string): number {
  const m = chunk.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/);
  if (m) return m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]);
  for (const [w, n] of Object.entries(WORD_NUMS)) {
    if (new RegExp(`\\b${w}\\b`).test(chunk)) return n;
  }
  return 1;
}

export function estimateFromText(description: string): MealAnalysis | null {
  const text = description.toLowerCase();
  const chunks = text.split(/,|\band\b|\bwith\b|\+|;|\n/).map((c) => c.trim()).filter(Boolean);
  const items: MealItem[] = [];
  for (const chunk of chunks) {
    // Find every food in the chunk, longest keys first, without overlaps ("chicken caesar wrap" → chicken + wrap).
    const hits: { f: Food; at: number }[] = [];
    const taken: [number, number][] = [];
    const keys = FOODS.flatMap((f) => f.keys.map((k) => ({ f, k }))).sort((a, b) => b.k.length - a.k.length);
    for (const { f, k } of keys) {
      const at = chunk.indexOf(k);
      if (at < 0 || taken.some(([s, e]) => at < e && at + k.length > s) || hits.some((h) => h.f === f)) continue;
      taken.push([at, at + k.length]);
      hits.push({ f, at });
    }
    hits.sort((a, b) => a.at - b.at);
    hits.forEach((h, idx) => pushItem(h.f, idx === 0 ? chunk : ""));
  }
  function pushItem(match: Food, chunk: string) {
    let qty = parseQty(chunk);
    // grams/oz written explicitly for meat & fish: scale from a 4 oz portion
    const oz = chunk.match(/(\d+(?:\.\d+)?)\s*oz/);
    const g = chunk.match(/(\d+(?:\.\d+)?)\s*g\b/);
    if (match.unit.includes("4 oz") && (oz || g)) qty = oz ? Number(oz[1]) / 4 : Number(g![1]) / 113;
    qty = Math.min(Math.max(qty, 0.25), 8);
    items.push({
      name: match.name,
      portion: `${Number.isInteger(qty) ? qty : qty.toFixed(1)} × ${match.unit}`,
      proteinG: Math.round(match.protein * qty),
      confidence: oz || g ? "high" : "medium",
    });
  }
  if (!items.length) return null;
  const est = items.reduce((s, i) => s + i.proteinG, 0);
  return {
    title: items.map((i) => i.name).slice(0, 3).join(", "),
    items,
    proteinEstimateG: est,
    proteinLowG: Math.max(0, Math.round(est * 0.8)),
    proteinHighG: Math.round(est * 1.2),
    isLikelyFood: true,
    boost: boostIdeas(est),
    note: null,
  };
}

function boostIdeas(current: number): { idea: string; extraProteinG: number }[] {
  if (current >= 35) return [{ idea: "Strong protein meal. Nothing to add.", extraProteinG: 0 }];
  return [
    { idea: "Add a side of Greek yogurt", extraProteinG: 17 },
    { idea: "Swap your drink for protein milk", extraProteinG: 13 },
    { idea: "Add a hard-boiled egg", extraProteinG: 6 },
  ];
}

// ---------- "Close the gap" suggestions (local, deterministic) ----------

export interface Suggestion {
  name: string;
  proteinG: number;
  why: string;
  tags: string[]; // veg, vegan, dairy, pork, gentle
}

const SUGGESTIONS: Suggestion[] = [
  { name: "Protein shake, sipped slowly", proteinG: 30, why: "Easy to get down when you're not hungry.", tags: ["veg", "dairy", "gentle"] },
  { name: "Greek yogurt cup", proteinG: 17, why: "Cold, soft and mild.", tags: ["veg", "dairy", "gentle"] },
  { name: "Cottage cheese with crackers", proteinG: 14, why: "Small portion, lots of protein.", tags: ["veg", "dairy", "gentle"] },
  { name: "Bone broth in a mug", proteinG: 9, why: "Warm and gentle on the stomach.", tags: ["gentle"] },
  { name: "Two hard-boiled eggs", proteinG: 13, why: "Make a batch once, grab them all week.", tags: ["veg"] },
  { name: "String cheese ×2", proteinG: 14, why: "Zero prep, fits in a bag.", tags: ["veg", "dairy"] },
  { name: "Tuna on crackers", proteinG: 22, why: "Shelf-stable and fast.", tags: [] },
  { name: "Deli turkey roll-ups", proteinG: 15, why: "No cooking, very little volume.", tags: [] },
  { name: "Edamame, one cup", proteinG: 17, why: "Plant protein you can snack on.", tags: ["veg", "vegan"] },
  { name: "Silken tofu smoothie", proteinG: 15, why: "Blends smooth, dairy-free.", tags: ["veg", "vegan", "gentle"] },
  { name: "Protein milk, one glass", proteinG: 13, why: "Drinkable when food feels like a lot.", tags: ["veg", "dairy", "gentle"] },
  { name: "Lentil soup, small bowl", proteinG: 12, why: "Soft, warm, plant-based.", tags: ["veg", "vegan", "gentle"] },
];

export function suggestProtein(gapG: number, nausea: number, dietary: string[]): Suggestion[] {
  const vegan = dietary.includes("vegan");
  const veg = vegan || dietary.includes("vegetarian");
  const noDairy = vegan || dietary.includes("dairy-free");
  let pool = SUGGESTIONS.filter((s) => {
    if (vegan && !s.tags.includes("vegan")) return false;
    if (veg && !s.tags.includes("veg")) return false;
    if (noDairy && s.tags.includes("dairy")) return false;
    return true;
  });
  if (nausea >= 3) {
    const gentle = pool.filter((s) => s.tags.includes("gentle"));
    if (gentle.length >= 3) pool = gentle;
  }
  // prefer options that close most of the gap without overshooting by much
  return [...pool].sort((a, b) => Math.abs(gapG - a.proteinG) - Math.abs(gapG - b.proteinG)).slice(0, 3);
}
