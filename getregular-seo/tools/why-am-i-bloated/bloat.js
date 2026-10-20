/*
 * "Why am I bloated?" pattern check: questions, matching and red flags.
 * review_status: draft-needs-medical-review
 * Pattern table and alarm features mirror blogs/bloating-gas/why-am-i-so-bloated.md
 * (AGA 2023 clinical practice update, PMID 37452811; NICE NG12 ovarian; NIDDK gas).
 */

export const BLOAT_SOURCES = {
  aga: { label: "AGA clinical practice update on bloating, 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37452811/" },
  survey: { label: "Oh et al. 2023, survey of 88,795 Americans", url: "https://pubmed.ncbi.nlm.nih.gov/36396061/" },
  houghton: { label: "Houghton et al. 2006, Gastroenterology", url: "https://pubmed.ncbi.nlm.nih.gov/17030170/" },
  nice: { label: "NICE NG12: ovarian cancer recognition", url: "https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer" },
  niddk: { label: "NIDDK: gas in the digestive tract", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/symptoms-causes" },
};

export const BLOAT_QUESTIONS = [
  { id: "timing", title: "When is your belly at its flattest and biggest?", options: [
    { v: "growsDay", label: "Flatter in the morning, bigger after meals or by evening" },
    { v: "afterMeals", label: "It swells soon after eating, then settles" },
    { v: "allDay", label: "About the same all day, including when I wake up" },
    { v: "random", label: "No clear pattern" } ] },
  { id: "foods", title: "Does it seem worse after any of these?", help: "Select all that apply.", multi: true, options: [
    { v: "dairy", label: "Milk, ice cream or soft cheese" },
    { v: "wheat", label: "Bread, pasta, onion or garlic" },
    { v: "beans", label: "Beans, lentils or cabbage-family vegetables" },
    { v: "sweeteners", label: "Sugar-free gum, candy or drinks" },
    { v: "fizzy", label: "Fizzy drinks, or eating fast" },
    { v: "none", label: "No food I've noticed", exclusive: true } ] },
  { id: "bowels", title: "How does it relate to your bowel movements?", options: [
    { v: "constipated", label: "Worse when I haven't gone, or my stool is hard" },
    { v: "diarrhea", label: "Comes with loose stool or urgency" },
    { v: "relief", label: "Eases after I poop or pass gas" },
    { v: "noLink", label: "No link I can see" } ] },
  { id: "cycle", title: "Does it follow your menstrual cycle?", options: [
    { v: "before", label: "Yes, worse in the days before my period" },
    { v: "no", label: "No" },
    { v: "na", label: "Doesn't apply to me" } ] },
  { id: "early", title: "Do you feel full after only a few bites?", options: [
    { v: "yesNausea", label: "Yes, sometimes with nausea or upper-belly pain" },
    { v: "yes", label: "Yes" },
    { v: "no", label: "No" } ] },
  { id: "howLong", title: "How long has the bloating been going on?", options: [
    { v: "lt2w", label: "Less than 2 weeks" },
    { v: "lt3m", label: "2 weeks to 3 months" },
    { v: "gt3m", label: "More than 3 months" } ] },
  { id: "flags", title: "Have you had any of these?", help: "Select all that apply.", multi: true, options: [
    { v: "weight", label: "Losing weight without trying" },
    { v: "vomit", label: "Vomiting, especially repeated" },
    { v: "blood", label: "Blood in stool, black stool, or vomiting blood" },
    { v: "worsening", label: "New or steadily worsening belly pain" },
    { v: "night", label: "Fever, or symptoms that wake me at night" },
    { v: "family", label: "Family history of GI cancer, celiac disease or IBD" },
    { v: "ovarian", label: "I'm a woman 50+ and the bloating is new and frequent, or comes with urgent or frequent urination" },
    { v: "none", label: "None of these", exclusive: true } ] },
];

export const BLOAT_PATTERNS = {
  meal: {
    title: "Meal-related distension",
    body: "A belly that's flatter in the morning and grows after meals is common. In many people it's a reflex: the diaphragm pushes down and the belly wall relaxes after eating, even without much extra gas. It's real, and it can be treated.",
    next: ["Log meal times and bloating at waking and bedtime for 2 weeks", "Try slower, smaller meals and note the difference", "Ask a clinician about diaphragmatic breathing if it persists"],
    cite: ["aga", "houghton"], learn: "/learn/bloated-at-night",
  },
  carbs: {
    title: "Certain carbohydrates",
    body: "Lactose, fructose, sugar alcohols and fructans (in wheat, onion and garlic) can ferment in the gut and cause gas and bloating. A short, structured elimination of one suspect at a time is usually the first test.",
    next: ["Pick one suspect and cut it for 2 weeks while logging", "Reintroduce it and watch for the bloating to return", "For several suspects, a dietitian can guide a low-FODMAP trial"],
    cite: ["aga", "niddk"], learn: "/learn/dairy-bloating",
  },
  air: {
    title: "Swallowed air and fizz",
    body: "Eating fast, fizzy drinks, chewing gum and smoking all add air to the gut.",
    next: ["Slow down at meals", "Swap fizzy drinks for still ones for a week", "Notice whether the bloating is more burping or more lower-belly pressure"],
    cite: ["niddk"], learn: "/learn/gas-after-eating",
  },
  constipation: {
    title: "Constipation",
    body: "A backlog of stool is a very common driver of bloating. Treating the constipation often helps the bloating too.",
    next: ["Track stool type and days between bowel movements", "Increase fiber gradually with water", "If going is hard work even with soft stool, ask about pelvic-floor testing"],
    cite: ["aga"], learn: "/learn/constipation",
  },
  ibs: {
    title: "A sensitive gut (IBS-type)",
    body: "Bloating is very common with IBS. A sensitive gut can feel normal amounts of gas more intensely, and symptoms often ease after a bowel movement.",
    next: ["Track bloating with stool type, meals, stress and sleep", "If it's been going on for months, ask a doctor about IBS", "Gut-directed therapies and diet changes help many people"],
    cite: ["aga"], learn: "/learn/ibs",
  },
  hormonal: {
    title: "Hormonal (cycle-related)",
    body: "Bloating that rises before your period is common. Tracking across 2–3 cycles shows whether it lines up.",
    next: ["Log your cycle alongside bloating for 2–3 months", "Note whether bowel habits change at the same time"],
    cite: ["aga"], learn: "/learn/ibs-and-period",
  },
  upper: {
    title: "Early fullness: worth a doctor's visit",
    body: "Feeling full after a few bites, especially with nausea or upper-belly pain, can come from the stomach itself, such as slow stomach emptying or functional dyspepsia. It's worth getting checked rather than self-managing.",
    next: ["Book a visit with your doctor", "Log meals, portion size and symptoms to bring with you"],
    cite: ["aga"], learn: "/learn/bloating-after-eating-very-little",
  },
  persistent: {
    title: "Present all day, every day: get it checked",
    body: "Bloating that's there when you wake, doesn't change with meals or bowel movements, or keeps getting worse needs a medical evaluation.",
    next: ["Book an appointment soon", "Bring a 2-week log of bloating, meals and bowel movements"],
    cite: ["aga"], learn: "/learn/when-to-see-doctor-bowel-changes",
  },
};

/* Returns the matching patterns, most specific first, and any red flags. */
export function matchBloat(a) {
  const out = [];
  const foods = (a.foods || []).filter((f) => f !== "none");
  if (a.timing === "allDay") out.push("persistent");
  if (a.early === "yesNausea" || a.early === "yes") out.push("upper");
  if (a.bowels === "constipated") out.push("constipation");
  if (foods.some((f) => ["dairy", "wheat", "beans", "sweeteners"].includes(f))) out.push("carbs");
  if (a.bowels === "relief" || (a.bowels === "diarrhea" && a.howLong === "gt3m")) out.push("ibs");
  if (a.cycle === "before") out.push("hormonal");
  if (foods.includes("fizzy")) out.push("air");
  if (a.timing === "growsDay" || a.timing === "afterMeals") out.push("meal");
  if (!out.length) out.push("meal");
  const flags = (a.flags || []).filter((f) => f !== "none");
  const seeDoctor = flags.length > 0 || out.includes("persistent") || out.includes("upper");
  return { patterns: [...new Set(out)].slice(0, 3), flags, seeDoctor };
}

/* ---------- 7-day experiment (mirrors the app's Experiments / "Try This") ---------- */
// One experiment per pattern; persistent/upper patterns get no experiment: they get a doctor.
export const EXPERIMENTS = {
  meal: { title: "Slower, smaller dinners", how: "Eat dinner over at least 20 minutes, a little smaller than usual, for 7 days.", watch: "bloating at bedtime" },
  carbs: { title: "Pause one suspect food", how: "Pick the food you suspect most (for example dairy) and leave it out for 7 days. Change nothing else.", watch: "bloating after meals" },
  air: { title: "Still, not fizzy", how: "Swap fizzy drinks and gum for still water for 7 days, and slow down at meals.", watch: "bloating and burping" },
  constipation: { title: "Fiber, slowly, with water", how: "Add one extra serving of fiber a day and an extra glass of water, for 7 days.", watch: "bloating and how often you go" },
  hormonal: { title: "Map it to your cycle", how: "Log bloating every day for 7 days and note your cycle day.", watch: "bloating by cycle day" },
  ibs: { title: "Bloating, stress and sleep", how: "Log bloating, stress and sleep for 7 days, without changing your diet yet.", watch: "what lines up with bad days" },
};

export const BLOAT_LEVELS = [["0", "None"], ["1", "Mild"], ["2", "Bad"]];

export function experimentFor(patterns) {
  const k = patterns.find((p) => EXPERIMENTS[p]);
  return k ? { key: k, ...EXPERIMENTS[k] } : null;
}

/* log: { "YYYY-MM-DD": 0|1|2 } for the experiment's days. Compares the first
 * and last three logged days once at least five are in. */
export function experimentProgress(log) {
  const days = Object.keys(log).sort();
  const vals = days.map((d) => Number(log[d]));
  const out = { logged: days.length, done: days.length >= 7, verdict: null };
  if (vals.length >= 5) {
    const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const first = avg(vals.slice(0, 3)), last = avg(vals.slice(-3));
    out.verdict = last < first - 0.3 ? "better" : last > first + 0.3 ? "worse" : "same";
  }
  return out;
}
