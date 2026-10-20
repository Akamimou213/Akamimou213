/*
 * Result-page copy for "How regular are you?". Reviewed copy lives here, not
 * in the UI, so the clinical reviewer edits one file.
 * review_status: draft-needs-medical-review
 *
 * Rules (blogs/_EDITORIAL_STANDARD.md): "your answers look like", never "you have";
 * no outcome promises; every factual line maps to a source in SOURCES.
 */

export const SOURCES = {
  bristol: { label: "Lewis & Heaton 1997, Scand J Gastroenterol", url: "https://pubmed.ncbi.nlm.nih.gov/9299672/" },
  freq: { label: "Heaton et al. 1992, Gut", url: "https://pubmed.ncbi.nlm.nih.gov/1624166/" },
  rome: { label: "Mearin et al. 2016 (Rome IV), Gastroenterology", url: "https://pubmed.ncbi.nlm.nih.gov/27144627/" },
  cic: { label: "AGA–ACG chronic constipation guideline 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37204227/" },
  ibs: { label: "ACG IBS guideline 2021", url: "https://pubmed.ncbi.nlm.nih.gov/33315591/" },
  bloat: { label: "AGA bloating clinical practice update 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37452811/" },
};

export const RESULT_COPY = {
  regular: {
    headline: "Your answers look regular",
    body: "Soft, formed stool (Bristol types 3–4) passed without much straining, between three times a day and three times a week, is the range most adults fall in.",
    cite: ["bristol", "freq"],
    tryThis: [
      "Keep doing what works: regular meals, fiber from plants, enough fluids, and movement.",
      "Notice what changes when you travel, sleep badly or are stressed. That's when most people go off track.",
      "Log for a week to see your baseline, so you'll spot a change early.",
    ],
    track: "your baseline: stool type, timing and what you ate",
  },
  slow: {
    headline: "Your answers lean a little slow",
    body: "One sign of slower transit showed up, such as harder stool or going less often. On its own that's common and often responds to everyday changes.",
    cite: ["bristol", "cic"],
    tryThis: [
      "Add fiber slowly, over 2–3 weeks, with extra water. Sudden jumps can cause gas.",
      "Give yourself an unhurried toilet window after a meal, when the urge often comes, and don't ignore it.",
      "Track stool type alongside fiber and fluids for a week to see what moves the needle.",
    ],
    track: "stool type, fiber, water and timing",
  },
  constipation: {
    headline: "Your answers lean toward constipation",
    body: "Two or more of the signs doctors use to describe constipation showed up: hard or lumpy stool, fewer than three a week, frequent straining or feeling you haven't finished.",
    cite: ["rome", "cic"],
    tryThis: [
      "Increase fiber gradually; the 2023 AGA–ACG guideline supports fiber as a first step for chronic constipation.",
      "Keep a regular toilet routine and don't ignore the urge.",
      "If it's lasted months or over-the-counter options haven't helped, a clinician can look for causes and options.",
    ],
    track: "stool type, days between bowel movements, fiber and fluids",
  },
  loose: {
    headline: "Your answers lean loose",
    body: "Loose or urgent bowel movements showed up more than occasionally. Common everyday contributors include coffee, alcohol, fatty meals, sweeteners, dairy for some people, and stress.",
    cite: ["bristol"],
    tryThis: [
      "Write down what you ate and drank in the 2–12 hours before loose days.",
      "Look at caffeine, alcohol and sugar-free sweeteners first. They're easy to test.",
      "Loose stool that lasts more than a few weeks is worth raising with a clinician.",
    ],
    track: "loose days next to meals, drinks and stress",
  },
  alternating: {
    headline: "Your answers swing between hard and loose",
    body: "Switching between harder and looser stool is common and has many causes. Tracking it is the fastest way to see whether food, routine, stress or your cycle lines up with the swings.",
    cite: ["bristol", "rome"],
    tryThis: [
      "Log every bowel movement for 2 weeks, including the 'normal' ones, so the pattern is clear.",
      "Note sleep, stress and, if it applies, your cycle. They often explain swings food doesn't.",
      "If it continues for months, bring your log to a clinician.",
    ],
    track: "every bowel movement, meals, stress and cycle",
  },
  bloating: {
    headline: "Your bowel habits look regular, but bloating is frequent",
    body: "Bloating most days with otherwise regular bowel habits is common. It's often linked to specific foods, eating speed, or how the gut senses normal amounts of gas.",
    cite: ["bloat"],
    tryThis: [
      "Note when bloating starts: soon after eating points one way, late in the day another.",
      "Test one suspect at a time, such as carbonated drinks, beans or onions, rather than cutting many foods at once.",
      "Bloating with weight loss, vomiting or bleeding needs a clinician, not an app.",
    ],
    track: "bloating times next to meals",
  },
  "ibs-c": ibs("with the constipation side more common"),
  "ibs-d": ibs("with the diarrhea side more common"),
  "ibs-mixed": ibs("with both hard and loose stool"),
};

function ibs(side) {
  return {
    headline: "Your answers look like an IBS-type pattern",
    body: `Belly pain linked to bowel movements at least once a week for months, ${side}, is the pattern doctors look at when they consider irritable bowel syndrome (IBS). Only a clinician can diagnose IBS, often after ruling out other causes.`,
    cite: ["rome", "ibs"],
    tryThis: [
      "Book a visit with a doctor if you haven't been assessed. Bring 2 weeks of logs: it makes the conversation faster.",
      "Diet changes such as low-FODMAP work best with a dietitian, as the ACG guideline recommends, not alone.",
      "Track symptoms against meals, stress and sleep so you and your clinician can test one change at a time.",
    ],
    track: "pain days, stool type, meals and stress, ready to share as a Doctor Report",
  };
}

export const DOCTOR_CARD = {
  headline: "Talk to a doctor about what you selected",
  body: "Some of what you selected is on the list of signs clinicians want to check in person. It doesn't mean something serious is wrong, but please don't wait on an app or a quiz. Contact your doctor soon. For heavy bleeding, severe pain or feeling faint, seek urgent care.",
  // [CONFIRM with reviewer] alarm-feature list and age threshold.
};

export const DISCLAIMER =
  "This self-check summarizes your answers. It isn't a medical test, it can't diagnose any condition, and its score has no clinical cut-offs. If you're worried about your symptoms, talk to a clinician.";

export const METHOD = [
  "Questions use reference points doctors use: the Bristol Stool Form Scale, the usual range of bowel frequency, and Rome IV thresholds for how often symptoms happen.",
  "The score starts at 100 and drops for stool form outside types 3–4, frequency outside the usual range, frequent straining, unfinished feelings or urgency, weekly pain and frequent bloating.",
  "The weights are our editorial choice and haven't been validated in a study. Use the score to compare yourself with yourself over time, not with other people.",
];
