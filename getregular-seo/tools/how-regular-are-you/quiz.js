/*
 * "How regular are you?" — scoring engine for the Get Regular bowel-habits self-check.
 *
 * Pure functions, no DOM, so the same file runs in the browser prototype,
 * the Next.js port and the Node tests (quiz.test.mjs).
 *
 * This is an original, non-validated self-check. It borrows *reference points*
 * from published sources (the stool-form concept of Lewis & Heaton 1997; the
 * NHANES normal frequency range; Rome symptom-frequency thresholds; NIDDK/ACG/
 * NICE alarm features) but it is not a diagnostic instrument and its score has
 * no clinical cut-offs.
 *
 * Licensing: the Rome Foundation lists the Bristol Stool Form Scale as
 * "available by license", and the common chart artwork is Norgine's. So the
 * form question uses our own wording and our own drawings, not the BSFS text
 * or chart. Counsel decides whether a Rome Foundation license is needed for
 * the 7-type structure itself (tools/README.md, "Licensing"). Every
 * threshold below names its source so the clinical reviewer can check it.
 */

export const QUESTIONS = [
  {
    id: "form",
    title: "Which picture looks most like your usual poop over the last 2 weeks?",
    help: "Stool shape is a rough guide to how fast food moves through your gut. Doctors use a similar 7-type scale.",
    kind: "bristol",
    options: [
      { v: 1, label: "Type 1", desc: "Small hard pellets, difficult to pass" },
      { v: 2, label: "Type 2", desc: "A hard, lumpy log" },
      { v: 3, label: "Type 3", desc: "A firm log with a few cracks" },
      { v: 4, label: "Type 4", desc: "A smooth, soft log, easy to pass" },
      { v: 5, label: "Type 5", desc: "Soft pieces that hold their shape" },
      { v: 6, label: "Type 6", desc: "Mushy, with ragged edges" },
      { v: 7, label: "Type 7", desc: "Liquid, no solid pieces" },
      { v: "mixed", label: "It changes a lot", desc: "Hard some days, loose on others" },
    ],
  },
  {
    id: "freq",
    title: "How often do you usually poop?",
    options: [
      { v: "lt3wk", label: "Fewer than 3 times a week" },
      { v: "3to6wk", label: "3 to 6 times a week" },
      { v: "1to3day", label: "1 to 3 times a day" },
      { v: "gt3day", label: "More than 3 times a day" },
    ],
  },
  {
    id: "strain",
    title: "How often do you have to strain?",
    options: freqScale(),
  },
  {
    id: "incomplete",
    title: "How often do you feel you haven't fully emptied your bowels?",
    options: freqScale(),
  },
  {
    id: "urgency",
    title: "How often do you have to rush to the toilet?",
    options: freqScale(),
  },
  {
    id: "pain",
    title: "Do you get belly pain or cramping?",
    options: [
      { v: "none", label: "Rarely or never" },
      { v: "linked", label: "Yes, and it's linked to pooping", desc: "It eases after, or comes with changes in how often or how it looks" },
      { v: "unlinked", label: "Yes, but it doesn't seem linked to pooping" },
    ],
  },
  {
    id: "painDays",
    title: "On how many days a week do you get that pain?",
    showIf: (a) => a.pain === "linked" || a.pain === "unlinked",
    options: [
      { v: "lt1", label: "Less than once a week" },
      { v: "1to3", label: "1 to 3 days a week" },
      { v: "4plus", label: "4 or more days a week" },
    ],
  },
  {
    id: "bloat",
    title: "How often do you feel bloated?",
    options: [
      { v: "rarely", label: "Rarely" },
      { v: "some", label: "Some days" },
      { v: "most", label: "Most days" },
    ],
  },
  {
    id: "duration",
    title: "How long has your gut been like this?",
    options: [
      { v: "lt1m", label: "Less than a month" },
      { v: "1to3m", label: "1 to 3 months" },
      { v: "3to6m", label: "3 to 6 months" },
      { v: "gt6m", label: "More than 6 months" },
    ],
  },
  {
    id: "redflags",
    title: "Have you had any of these?",
    help: "Select all that apply. These are signs doctors want to check in person.",
    multi: true,
    options: [
      // Sources: NIDDK constipation "see a doctor right away" list; ACG IBS
      // guideline 2021 alarm features (PMID 33315591); NICE NG12 1.3 (2026).
      // [CONFIRM reviewer] wording and the age threshold.
      { v: "blood", label: "Blood in your poop, or black, tarry poop" },
      { v: "weight", label: "Losing weight without trying" },
      { v: "pain", label: "Belly pain that's constant or severe" },
      { v: "vomit", label: "Vomiting, fever, or not being able to pass gas" },
      { v: "night", label: "Waking up at night to poop" },
      { v: "anemia", label: "Low iron or anemia found on a blood test" },
      { v: "family", label: "A parent, sibling or child with bowel cancer, IBD or celiac disease" },
      { v: "newOver50", label: "I'm 50 or older and this change is new" },
      { v: "none", label: "None of these", exclusive: true },
    ],
  },
  {
    id: "goal",
    title: "What would help you most right now?",
    options: [
      { v: "regular", label: "Going more regularly" },
      { v: "urgency", label: "Fewer urgent, loose days" },
      { v: "bloat", label: "Less bloating" },
      { v: "triggers", label: "Finding my trigger foods" },
      { v: "doctor", label: "Getting ready for a doctor's visit" },
    ],
  },
];

function freqScale() {
  // Rome IV uses "more than one-fourth (25%) of defecations" for straining,
  // incomplete evacuation and similar items (Rome IV: Mearin 2016, PMID 27144627; Rome V: Corsetti 2026, PMID 41713703 [CONFIRM reviewer: Rome V thresholds]).
  return [
    { v: "rarely", label: "Rarely or never" },
    { v: "sometimes", label: "Sometimes", desc: "Less than 1 in 4 times" },
    { v: "often", label: "Often", desc: "1 in 4 times or more" },
  ];
}

export function visibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

/* ---------- Scoring ---------- */

// Penalties, out of 100. Form and frequency carry the most weight because
// they are what stool-form and population bowel-habit studies anchor
// (Lewis & Heaton 1997, PMID 9299672; Heaton 1992, PMID 1624166; NHANES:
// 95.9% of adults with normal habits go 3-21 times a week, Mitsuhashi 2018,
// PMID 28762379). Type 5 is penalized lightly: Blake 2016 (PMID 27492648)
// groups types 3-5 as normal. Weights are editorial, not validated.
const FORM_PENALTY = { 1: 30, 2: 22, 3: 4, 4: 0, 5: 8, 6: 22, 7: 30, mixed: 24 };
const FREQ_PENALTY = { lt3wk: 22, "3to6wk": 4, "1to3day": 0, gt3day: 18 };
const OFTEN = { rarely: 0, sometimes: 4, often: 10 };
const PAIN_PENALTY = { none: 0, lt1: 3, "1to3": 8, "4plus": 12 };
const BLOAT_PENALTY = { rarely: 0, some: 3, most: 6 };

export const BANDS = [
  { min: 85, key: "regular", label: "Running regular" },
  { min: 65, key: "mostly", label: "Mostly regular" },
  { min: 40, key: "offtrack", label: "Often off track" },
  { min: 0, key: "struggling", label: "Struggling most days" },
];

export function score(a) {
  let s = 100;
  s -= FORM_PENALTY[a.form] ?? 0;
  s -= FREQ_PENALTY[a.freq] ?? 0;
  s -= OFTEN[a.strain] ?? 0;
  s -= OFTEN[a.incomplete] ?? 0;
  s -= OFTEN[a.urgency] ?? 0;
  s -= a.pain === "none" || !a.pain ? 0 : PAIN_PENALTY[a.painDays] ?? 0;
  s -= BLOAT_PENALTY[a.bloat] ?? 0;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function band(s) {
  return BANDS.find((b) => s >= b.min);
}

const hard = (a) => a.form === 1 || a.form === 2;
const loose = (a) => a.form === 6 || a.form === 7;

/*
 * Pattern = which way the answers lean. Uses Rome IV *reference points*
 * (Rome IV: Mearin 2016, PMID 27144627; Rome V: Corsetti 2026, PMID 41713703 [CONFIRM reviewer: Rome V thresholds]): two or more constipation features, or
 * recurrent pain linked to bowel movements on >= 1 day/week.
 * The result copy never says "you have"; it says "your answers look like".
 */
export function pattern(a) {
  const cFeatures = [hard(a), a.freq === "lt3wk", a.strain === "often", a.incomplete === "often"].filter(Boolean).length;
  const dFeatures = [loose(a), a.freq === "gt3day", a.urgency === "often"].filter(Boolean).length;
  const painWeekly = a.pain === "linked" && (a.painDays === "1to3" || a.painDays === "4plus");
  const chronic = a.duration === "3to6m" || a.duration === "gt6m";

  if (painWeekly && chronic) {
    if (a.form === "mixed" || (cFeatures >= 1 && dFeatures >= 1)) return "ibs-mixed";
    if (cFeatures >= dFeatures && cFeatures >= 1) return "ibs-c";
    if (dFeatures >= 1) return "ibs-d";
    return "ibs-mixed";
  }
  if (a.form === "mixed" || (cFeatures >= 1 && dFeatures >= 1)) return "alternating";
  if (cFeatures >= 2) return "constipation";
  if (dFeatures >= 2 || loose(a)) return "loose";
  if (cFeatures === 1) return "slow";
  if (a.bloat === "most") return "bloating";
  return "regular";
}

export function redFlags(a) {
  return (a.redflags || []).filter((f) => f !== "none");
}

/*
 * Each pattern maps to: copy keys for the result page, the Learn hub to
 * read next, the printable to offer, and the App Store Custom Product Page
 * (set in App Store Connect) plus the campaign token for attribution.
 */
export const PATTERNS = {
  regular: { label: "Regular", learn: "/learn/poop", cpp: "default", ct: "quiz-regular" },
  slow: { label: "A little slow", learn: "/learn/constipation", cpp: "constipation", ct: "quiz-slow" },
  constipation: { label: "Constipation-leaning", learn: "/learn/constipation", cpp: "constipation", ct: "quiz-constipation" },
  loose: { label: "Loose-leaning", learn: "/learn/diarrhea", cpp: "default", ct: "quiz-loose" },
  alternating: { label: "Swings between hard and loose", learn: "/learn/ibs", cpp: "ibs", ct: "quiz-alternating" },
  bloating: { label: "Regular, but bloated", learn: "/learn/bloating", cpp: "bloating", ct: "quiz-bloating" },
  "ibs-c": { label: "IBS-like pattern, constipation side", learn: "/learn/ibs", cpp: "ibs", ct: "quiz-ibs-c" },
  "ibs-d": { label: "IBS-like pattern, diarrhea side", learn: "/learn/ibs", cpp: "ibs", ct: "quiz-ibs-d" },
  "ibs-mixed": { label: "IBS-like pattern, mixed", learn: "/learn/ibs", cpp: "ibs", ct: "quiz-ibs-m" },
};

export function result(a) {
  const s = score(a);
  const p = pattern(a);
  const flags = redFlags(a);
  return {
    score: s,
    band: band(s),
    pattern: p,
    ...PATTERNS[p],
    redFlags: flags,
    // Red flags override the upsell: the page leads with "see a doctor".
    leadWithDoctor: flags.length > 0,
    goal: a.goal,
  };
}
