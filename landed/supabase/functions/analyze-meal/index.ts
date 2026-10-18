// Bolt Cloud server function (Supabase Edge Function, Deno runtime): "analyze-meal"
// Secrets: AI_API_KEY (required), AI_BASE_URL (default https://openrouter.ai/api/v1),
//          AI_MODEL (text), AI_VISION_MODEL (must accept image input).
// Never logs meal text or images.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You estimate the protein in a meal from a photo or a description, for an adult on a GLP-1 medication who is trying to reach a daily protein target. Return ONLY a JSON object with this exact shape:
{"title": string, "items": [{"name": string, "portion": string, "proteinG": number, "confidence": "low"|"medium"|"high"}], "proteinLowG": number, "proteinHighG": number, "proteinEstimateG": number, "isLikelyFood": boolean, "boost": [{"idea": string, "extraProteinG": number}], "note": string|null}
Rules:
1. Identify visible foods and plausible portions. Be honest about uncertainty: give a low–high protein range and per-item confidence. Do not invent hidden ingredients.
2. If the image is not food, set isLikelyFood=false and return empty items.
3. Suggest 1–3 small, easy ways to add protein to this meal that suit a small appetite (e.g., Greek yogurt, cottage cheese, eggs, protein milk, tofu, beans, tuna, a protein shake).
4. Never comment on calories, weight, or whether the meal is "good" or "bad". No medical advice. No dosing advice.
5. JSON only, no markdown.`;

type Item = { name: string; portion: string; proteinG: number; confidence: string };
type Analysis = {
  title: string;
  items: Item[];
  proteinLowG: number;
  proteinHighG: number;
  proteinEstimateG: number;
  isLikelyFood: boolean;
  boost: { idea: string; extraProteinG: number }[];
  note: string | null;
};

function validate(x: unknown): string[] {
  const errs: string[] = [];
  const a = x as Analysis;
  if (!a || typeof a !== "object") return ["not an object"];
  if (typeof a.title !== "string") errs.push("title must be a string");
  if (!Array.isArray(a.items)) errs.push("items must be an array");
  else a.items.forEach((i, n) => {
    if (typeof i?.name !== "string") errs.push(`items[${n}].name must be a string`);
    if (typeof i?.proteinG !== "number") errs.push(`items[${n}].proteinG must be a number`);
  });
  for (const k of ["proteinLowG", "proteinHighG", "proteinEstimateG"] as const) if (typeof a[k] !== "number") errs.push(`${k} must be a number`);
  if (typeof a.isLikelyFood !== "boolean") errs.push("isLikelyFood must be a boolean");
  if (!Array.isArray(a.boost)) errs.push("boost must be an array");
  return errs;
}

const BANNED = /calori|kcal|\bdose|\bmg\b|medication|titrat|taper/i;
function sanitize(a: Analysis): Analysis {
  const items = a.items.map((i) => ({ ...i, proteinG: Math.max(0, Math.min(150, Math.round(i.proteinG))), confidence: ["low", "medium", "high"].includes(i.confidence) ? i.confidence : "medium" }));
  const sum = items.reduce((s, i) => s + i.proteinG, 0);
  let est = Math.round(a.proteinEstimateG);
  if (items.length && Math.abs(est - sum) > Math.max(5, sum * 0.25)) est = sum;
  return {
    ...a,
    items,
    proteinEstimateG: est,
    proteinLowG: Math.max(0, Math.min(Math.round(a.proteinLowG), est)),
    proteinHighG: Math.max(Math.round(a.proteinHighG), est),
    boost: a.boost.filter((b) => typeof b?.idea === "string" && !BANNED.test(b.idea)).slice(0, 3),
    note: a.note && !BANNED.test(a.note) ? a.note : null,
  };
}

function parse(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

async function callModel(messages: unknown[], model: string): Promise<string> {
  const base = Deno.env.get("AI_BASE_URL") ?? "https://openrouter.ai/api/v1";
  const key = Deno.env.get("AI_API_KEY");
  if (!key) throw new Error("Missing secret AI_API_KEY");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 40_000);
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, temperature: 0.2, response_format: { type: "json_object" } }),
    });
    if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
    const json = await res.json();
    return json?.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
  const started = Date.now();
  try {
    const { imageBase64, description, proteinLeftG } = await req.json();
    if (!imageBase64 && !description) return reply({ error: "Send a photo or a description." }, 400);
    if (imageBase64 && imageBase64.length > 2_800_000) return reply({ error: "Image too large." }, 413);
    if (description && description.length > 1000) return reply({ error: "Description too long." }, 413);

    const textModel = Deno.env.get("AI_MODEL") ?? "z-ai/glm-5.3-flash";
    const visionModel = Deno.env.get("AI_VISION_MODEL") ?? textModel;
    const userContent = imageBase64
      ? [
          { type: "text", text: `Estimate the protein in this meal. The user has about ${proteinLeftG ?? "unknown"}g of protein left today.${description ? ` Their note: ${description}` : ""}` },
          { type: "image_url", image_url: { url: imageBase64 } },
        ]
      : `Meal description: ${description}\nThe user has about ${proteinLeftG ?? "unknown"}g of protein left today.`;

    const messages: unknown[] = [
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ];
    const model = imageBase64 ? visionModel : textModel;

    let raw = await callModel(messages, model);
    let parsed: unknown;
    let errs: string[] = [];
    try {
      parsed = parse(raw);
      errs = validate(parsed);
    } catch {
      errs = ["response was not valid JSON"];
    }
    if (errs.length) {
      raw = await callModel([...messages, { role: "assistant", content: raw }, { role: "user", content: `Your JSON was invalid: ${errs.join("; ")}. Return corrected JSON only.` }], model);
      parsed = parse(raw);
      errs = validate(parsed);
      if (errs.length) {
        console.error("analyze-meal invalid output", { ms: Date.now() - started, errs });
        return reply({ error: "Could not read this meal." }, 502);
      }
    }
    console.log("analyze-meal ok", { ms: Date.now() - started, image: Boolean(imageBase64) });
    return reply(sanitize(parsed as Analysis));
  } catch (e) {
    console.error("analyze-meal error", { ms: Date.now() - started, message: (e as Error).message });
    return reply({ error: (e as Error).message.startsWith("Missing secret") ? (e as Error).message : "Could not read this meal." }, 500);
  }
});
