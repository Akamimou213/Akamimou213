/*
 * GI appointment prep: builds a one-page visit sheet from the user's choices.
 * review_status: draft-needs-medical-review
 * Question bank mirrors blogs/doctor-prep/questions-to-ask-gastroenterologist.md
 * (AHRQ question-prep advice; ACG IBS guideline 2021; NIDDK celiac diagnosis).
 */

export const PREP_SOURCES = {
  ahrq: { label: "AHRQ: questions before your appointment", url: "https://www.ahrq.gov/patients-consumers/patient-involvement/ask-your-doctor/questions-before-appointment.html" },
  ahrq10: { label: "AHRQ: 10 questions you should know", url: "https://ahrq.gov/health-literacy/patient-education/ask-your-doctor/10questions.html" },
  acg: { label: "ACG IBS guideline 2021", url: "https://pubmed.ncbi.nlm.nih.gov/33315591/" },
  celiac: { label: "NIDDK: diagnosis of celiac disease", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/celiac-disease/diagnosis" },
  recall: { label: "Recall questionnaires vs diaries (PMID 30394943)", url: "https://pubmed.ncbi.nlm.nih.gov/30394943/" },
};

export const VISITS = {
  first: "First visit with a gastroenterologist",
  followup: "Follow-up on a treatment",
  tests: "Test results or a procedure",
  dietitian: "Dietitian visit",
};

export const SYMPTOMS = {
  constipation: "Constipation", diarrhea: "Diarrhea or loose stool", alternating: "Switching between hard and loose",
  bloating: "Bloating", pain: "Belly pain or cramping", reflux: "Heartburn or reflux", nausea: "Nausea", urgency: "Urgency or accidents",
};

export const TRIED = {
  fiber: "Fiber or a fiber supplement", laxatives: "Laxatives", antidiarrheal: "Anti-diarrheal medicine",
  elimination: "Cutting out a food", probiotics: "Probiotics", prescription: "Prescription medicine", therapy: "Stress or therapy support",
};

export const WARNINGS = {
  blood: "Blood in stool, or black stool", weight: "Losing weight without trying", night: "Symptoms that wake me at night",
  vomit: "Vomiting", anemia: "Low iron or anemia", family: "Family history of bowel cancer, IBD or celiac disease",
};

const BANK = {
  core: [
    "What do you think is most likely causing my symptoms?",
    "What else is on your list, and how will we rule those out?",
    "Which symptoms should make me call you before my next appointment?",
  ],
  first: [
    "Which tests do you recommend, and what will each one tell us?",
    "Is there anything I should try now while we wait for results?",
    "Should I change or stop any medicine or supplement I'm taking?",
    "When should I follow up, and what should I track until then?",
  ],
  followup: [
    "Here's how my symptoms changed since I started the treatment. Is that the response you'd expect?",
    "Should we continue, adjust the dose, or try something else?",
    "Is there another specialist I should also see, such as a dietitian, pelvic floor therapist or GI psychologist?",
  ],
  tests: [
    "Why do I need this test, and how do I prepare?",
    "When and how will I get the results?",
    "If it comes back normal, what does that rule out, and what's the next step?",
  ],
  dietitian: [
    "Which diet approach fits my symptoms, and for how long should I try it?",
    "How do we reintroduce foods afterward?",
    "How do I make sure I still get enough fiber and nutrients?",
  ],
  ibs: [
    "Which criteria do I meet, and which subtype am I?",
    "Which tests have ruled out other conditions?",
    "Would a limited low-FODMAP trial with a dietitian make sense for me?",
    "Is gut-directed psychotherapy an option?",
  ],
  diarrhea: ["Should I be tested for celiac disease, and should I keep eating gluten until the test?"],
  constipation: ["Could a pelvic-floor problem be part of this, and how would we check?"],
  bloating: ["Could constipation or a specific carbohydrate be behind the bloating?"],
  reflux: ["Do my reflux symptoms need a different test or treatment from my bowel symptoms?"],
};

const BRING = [
  "A list of every medicine and supplement, with doses (include over-the-counter)",
  "2–4 weeks of symptom and bowel logs (dates, stool type, pain, meals)",
  "Previous test results and the names of other doctors you've seen",
  "Your top 3 questions, written down, most important first",
  "Someone to come with you, or a way to take notes",
];

/*
 * input = { visit, symptoms[], duration: "lt3m"|"3to12m"|"gt1y", tried[], warnings[] }
 * returns { visitLabel, summary[], mentionFirst[], questions[], bring[], theyWillAsk[] }
 */
export function buildSheet(input) {
  const s = new Set(input.symptoms || []);
  const ibsLike = (s.has("pain") && (s.has("constipation") || s.has("diarrhea") || s.has("alternating"))) && input.duration !== "lt3m";
  const q = [...BANK.core, ...(BANK[input.visit] || [])];
  if (ibsLike && (input.visit === "first" || input.visit === "followup")) q.push(...BANK.ibs);
  if (s.has("diarrhea") || s.has("alternating")) q.push(...BANK.diarrhea);
  if (s.has("constipation")) q.push(...BANK.constipation);
  if (s.has("bloating")) q.push(...BANK.bloating);
  if (s.has("reflux")) q.push(...BANK.reflux);

  const dur = { lt3m: "less than 3 months", "3to12m": "3 to 12 months", gt1y: "more than a year" }[input.duration] || "not stated";
  const summary = [
    `Main symptoms: ${[...s].map((k) => SYMPTOMS[k]).join(", ") || "not stated"}`,
    `How long: ${dur}`,
    `Already tried: ${(input.tried || []).map((k) => TRIED[k]).join(", ") || "nothing yet"}`,
  ];
  const mentionFirst = (input.warnings || []).map((k) => WARNINGS[k]);
  const theyWillAsk = [
    "Where is the pain, what does it feel like, and when does it happen?",
    "What makes it better or worse (meals, bowel movements, your period)?",
    "How have your bowel habits changed: how often, and what type of stool?",
    "Any blood, black stool, weight loss or fever?",
    "What have you already tried, and for how long?",
  ];
  return { visitLabel: VISITS[input.visit] || "GI appointment", summary, mentionFirst, questions: [...new Set(q)], bring: BRING, theyWillAsk, ibsLike };
}
