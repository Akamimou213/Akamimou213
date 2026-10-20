/*
 * Stool-type chart data and the 7-day mini log.
 * review_status: draft-needs-medical-review
 *
 * Wording and drawings are Get Regular's own. The 7-type idea comes from
 * Lewis & Heaton 1997 (PMID 9299672); the Rome Foundation lists the Bristol
 * Stool Form Scale as available by license, so counsel decides whether the
 * structure or the name needs one (tools/README.md, "Licensing").
 */

export const SOURCES = {
  lewis: { label: "Lewis & Heaton 1997, Scand J Gastroenterol", url: "https://pubmed.ncbi.nlm.nih.gov/9299672/" },
  blake: { label: "Blake et al. 2016, Aliment Pharmacol Ther", url: "https://pubmed.ncbi.nlm.nih.gov/27492648/" },
  nhanes: { label: "Mitsuhashi et al. 2018 (NHANES), Am J Gastroenterol", url: "https://pubmed.ncbi.nlm.nih.gov/28762379/" },
  heaton: { label: "Heaton et al. 1992, Gut", url: "https://pubmed.ncbi.nlm.nih.gov/1624166/" },
  niddkC: { label: "NIDDK: Constipation", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes" },
  niddkD: { label: "NIDDK: Diarrhea", url: "https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/symptoms-causes" },
};

// group: hard | ideal | soft | loose. level: ok | watch | warn (badge colour).
export const TYPES = {
  1: {
    look: "Small, hard, separate pellets that are difficult to pass",
    group: "hard", level: "watch", headline: "Hard pellets: a sign of slow transit",
    suggests: "Stool this hard has usually spent a long time in the colon, where water is absorbed. Hard, lumpy stool is one of the signs doctors use to describe constipation.",
    reasons: ["Too little fiber or fluid", "Holding it in or a rushed routine", "Less movement than usual, or travel", "Some medicines, such as opioids and iron"],
    tryThis: ["Add fiber slowly over 2–3 weeks, with extra water", "Give yourself an unhurried toilet window after a meal", "Keep a log for a week to see whether it's a pattern or a one-off"],
    cite: ["lewis", "niddkC"],
  },
  2: {
    look: "A hard, lumpy log",
    group: "hard", level: "watch", headline: "Lumpy and hard: slower than ideal",
    suggests: "Firm and lumpy stool usually means transit is on the slow side. It often eases with fiber, fluids and routine.",
    reasons: ["Low fiber or fluid", "Skipped or rushed toilet trips", "Stress, travel or a change in routine"],
    tryThis: ["Increase fiber gradually and drink more water", "Don't ignore the urge to go", "Track type alongside fiber and water for a week"],
    cite: ["lewis", "niddkC"],
  },
  3: {
    look: "A firm log with a few cracks on the surface",
    group: "ideal", level: "ok", headline: "Firm and formed: in the usual range",
    suggests: "Formed stool like this is common in healthy adults, and types 3–4 are often considered ideal.",
    reasons: ["A normal day for many people"],
    tryThis: ["Keep doing what works", "Notice what changes when your routine changes"],
    cite: ["blake", "nhanes"],
  },
  4: {
    look: "A smooth, soft log that's easy to pass",
    group: "ideal", level: "ok", headline: "Smooth and soft: often considered ideal",
    suggests: "This is the shape most often described as ideal: formed, soft and passed without straining.",
    reasons: ["A normal day"],
    tryThis: ["Keep doing what works", "Log a week to know your baseline, so you'll spot a change early"],
    cite: ["blake", "nhanes"],
  },
  5: {
    look: "Soft pieces with clear edges, passed easily",
    group: "soft", level: "ok", headline: "Soft pieces: common, on the soft side",
    suggests: "Soft, easy-to-pass pieces are common. One study grouped types 3–5 as normal; if it happens most days, transit may be a little quick.",
    reasons: ["A high-fiber day", "Coffee or a big meal", "Mild stress"],
    tryThis: ["No action needed for an occasional type 5", "If it's most days, note caffeine, alcohol and sweeteners"],
    cite: ["blake", "heaton"],
  },
  6: {
    look: "Mushy pieces with ragged edges",
    group: "loose", level: "watch", headline: "Mushy: faster than ideal",
    suggests: "Mushy stool usually means food moved through quickly, so less water was absorbed. It's at the mild end of diarrhea.",
    reasons: ["Coffee, alcohol or sugar-free sweeteners", "Fatty or spicy meals", "Stress", "A stomach bug", "Dairy, for people who don't digest lactose well"],
    tryThis: ["Look at what you ate and drank in the 2–12 hours before", "Drink fluids", "Track it: two or three mushy days in a row is worth a closer look"],
    cite: ["lewis", "niddkD"],
  },
  7: {
    look: "Liquid, with no solid pieces",
    group: "loose", level: "warn", headline: "Liquid: this is diarrhea",
    suggests: "Watery stool means fast transit. Most short bouts pass on their own, but fluids matter, and some signs mean you should talk to a doctor right away.",
    reasons: ["Infection or food poisoning", "Medicines such as antibiotics", "Food intolerances", "Digestive conditions such as IBS or IBD"],
    tryThis: ["Drink fluids to replace what you lose", "Talk to a doctor right away if it lasts more than 2 days, or you have a high fever, 6 or more loose stools a day, severe pain, black or bloody stool, or signs of dehydration"],
    cite: ["niddkD"],
    urgentNote: true,
  },
};

export const GROUP_LABEL = { hard: "Hard (types 1–2)", ideal: "Formed (types 3–4)", soft: "Soft (type 5)", loose: "Loose (types 6–7)", none: "No bowel movement" };

/* 7-day mini log: entries is an array of 7 values, each 1..7, "none" or null. */
export function summarizeWeek(entries) {
  const counts = { hard: 0, ideal: 0, soft: 0, loose: 0, none: 0 };
  let logged = 0;
  for (const e of entries) {
    if (e === null || e === undefined) continue;
    logged++;
    counts[e === "none" ? "none" : TYPES[e].group]++;
  }
  const movements = logged - counts.none;
  let headline;
  if (logged < 4) headline = "Log at least 4 days to see a pattern.";
  else if (counts.hard >= 3 && counts.loose >= 2) headline = "Your week swung between hard and loose.";
  else if (counts.hard + counts.none >= 4 && counts.hard >= 2) headline = "Your week leaned hard and slow.";
  else if (counts.loose >= 3) headline = "Your week leaned loose.";
  else if (counts.ideal + counts.soft >= Math.max(1, movements - 1)) headline = "Your week looks mostly in the usual range.";
  else headline = "Your week was mixed.";
  return { counts, logged, movements, headline };
}
