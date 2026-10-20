/*
 * Poop color checker: data and triage logic.
 * review_status: draft-needs-medical-review
 * Content mirrors blogs/stool-bristol/poop-color-chart.md (same sources).
 */

export const SOURCES = {
  cc: { label: "Cleveland Clinic: stool color", url: "https://my.clevelandclinic.org/health/articles/stool-poop-color" },
  melena: { label: "Cleveland Clinic: melena", url: "https://my.clevelandclinic.org/health/symptoms/25058-melena" },
  medlineBlack: { label: "MedlinePlus: black or tarry stools", url: "https://medlineplus.gov/ency/article/003130.htm" },
  ccBlood: { label: "Cleveland Clinic: blood in stool", url: "https://my.clevelandclinic.org/health/symptoms/14612-rectal-bleeding" },
  ccPale: { label: "Cleveland Clinic: clay-colored stool", url: "https://my.clevelandclinic.org/health/symptoms/clay-colored-or-pale-stool" },
  medlinePale: { label: "MedlinePlus: pale or clay-colored stools", url: "https://medlineplus.gov/ency/article/003129.htm" },
  green: { label: "Cleveland Clinic: green poop", url: "https://health.clevelandclinic.org/green-poop" },
  nhs: { label: "NHS: bowel cancer symptoms", url: "https://www.nhs.uk/conditions/bowel-cancer/symptoms/" },
};

// level: ok < food < watch < sameday < emergency
export const LEVELS = {
  ok: { css: "ok", text: "Normal" },
  food: { css: "ok", text: "Usually food — watch it" },
  watch: { css: "watch", text: "See a doctor if it lasts" },
  sameday: { css: "warn", text: "Contact a doctor today" },
  emergency: { css: "urgent", text: "Get urgent care now" },
};

export const COLORS = {
  brown: {
    name: "Brown (any shade)", swatch: "#7a5233", base: "ok",
    means: "Brown, from light to dark, is the normal color of adult stool. It comes from bile pigments.",
    foods: [], meds: [], cite: ["cc", "ccPale"],
  },
  green: {
    name: "Green", swatch: "#5f7a3a", base: "food",
    means: "Usually from leafy greens, green or blue food dye, or food passing through quickly (as with diarrhea). Antibiotics can do it too.",
    foods: ["Leafy greens or spinach", "Green, blue or purple dye (drinks, frosting, candy)", "Blueberries or matcha"],
    meds: ["Antibiotics"], cite: ["green", "cc"],
  },
  yellow: {
    name: "Yellow", swatch: "#c9a53a", base: "food",
    means: "Often diet (carrots, sweet potatoes, a fatty meal). Yellow stool that's greasy, foul-smelling and floats can mean fat isn't being absorbed, which needs a doctor if it continues.",
    foods: ["Carrots or sweet potatoes", "A very fatty meal"],
    meds: [], greasyCheck: true, cite: ["cc"],
  },
  orange: {
    name: "Orange", swatch: "#c9792e", base: "food",
    means: "Usually beta-carotene foods such as carrots and sweet potatoes, or orange dye.",
    foods: ["Carrots, sweet potatoes or squash", "Orange dye"],
    meds: [], greasyCheck: true, cite: ["cc"],
  },
  red: {
    name: "Red", swatch: "#a8322d", base: "sameday",
    means: "Red foods (beets, tomato juice, cranberries, red dye) can tint stool. Without a food explanation, red can be blood from lower in the gut, such as hemorrhoids, a fissure, IBD or polyps. Always tell a doctor about blood.",
    foods: ["Beets", "Tomato juice or soup", "Cranberries", "Red dye (drinks, candy, gelatin)"],
    meds: [], cite: ["cc", "ccBlood", "nhs"],
  },
  maroon: {
    name: "Maroon or dark red", swatch: "#5e1f22", base: "sameday",
    means: "Dark red or maroon can mean bleeding higher in the colon or small intestine. Contact a doctor the same day.",
    foods: [], meds: [], cite: ["ccBlood", "nhs"],
  },
  black: {
    name: "Black", swatch: "#1d1a19", base: "sameday",
    means: "Iron, bismuth (Pepto-Bismol), activated charcoal and black licorice can turn stool black. Black, sticky, tarry stool with a strong smell can be digested blood from the upper gut (melena) and needs care the same day.",
    foods: ["Black licorice", "Blueberries in large amounts", "Blood sausage"],
    meds: ["Iron supplements", "Bismuth (Pepto-Bismol)", "Activated charcoal"], tarryCheck: true,
    cite: ["melena", "medlineBlack", "cc"],
  },
  pale: {
    name: "Pale, white, gray or clay", swatch: "#cfc6b5", base: "watch",
    means: "Pale stool can mean not enough bile is reaching the gut, from a bile duct, gallbladder, liver or pancreas problem. One pale stool isn't usually a worry; more than a few days needs a doctor, and with yellow skin or eyes it needs one right away.",
    foods: [], meds: ["Anti-diarrheal medicine", "Barium from an X-ray test"], jaundiceCheck: true,
    cite: ["ccPale", "medlinePale"],
  },
};

export const ORDER = ["brown", "green", "yellow", "orange", "red", "maroon", "black", "pale"];

const RANK = { ok: 0, food: 1, watch: 2, sameday: 3, emergency: 4 };
const max = (a, b) => (RANK[a] >= RANK[b] ? a : b);

/*
 * a = { color, food: bool (ate a listed food in the last 2 days), med: bool,
 *       days: "1" | "2-3" | "4plus", tarry, greasy, jaundice, dizzy, heavyBleeding, feelUnwell }
 * Returns { level, reasons[] }. Order of rules matters: emergencies first.
 */
export function assess(a) {
  const c = COLORS[a.color];
  const reasons = [];
  let level = c.base;

  if (a.dizzy && (a.color === "black" || a.color === "red" || a.color === "maroon")) {
    return { level: "emergency", reasons: ["Possible bleeding with dizziness, weakness or fainting"] };
  }
  if (a.heavyBleeding) return { level: "emergency", reasons: ["Heavy bleeding or large clots"] };

  if (a.color === "black") {
    if (a.tarry) { level = "sameday"; reasons.push("Black, sticky or tarry stool can be digested blood"); }
    else if (a.med || a.food) { level = "food"; reasons.push("Iron, bismuth, charcoal or dark foods commonly cause black stool"); }
  }
  if (a.color === "red") {
    if (a.food && !a.feelUnwell) { level = "food"; reasons.push("Red foods or dye can tint stool for a day or two"); }
    else reasons.push("Red without a food explanation can be blood");
  }
  if (a.color === "maroon") reasons.push("Dark red or maroon can be bleeding higher in the gut");
  if (a.color === "pale") {
    if (a.jaundice) { level = "sameday"; reasons.push("Pale stool with yellow skin or eyes, or dark urine"); }
    else if (a.days === "1" || a.med) { level = "food"; reasons.push("A single pale stool, or one after anti-diarrheal medicine or barium, isn't usually a worry"); }
    else reasons.push("Pale stool for more than a day or two");
  }
  if ((a.color === "yellow" || a.color === "orange") && a.greasy) {
    level = max(level, "watch"); reasons.push("Greasy, foul-smelling or floating stool can mean fat isn't being absorbed");
  }
  if (a.color === "green" && a.food) reasons.push("Green foods or dye are the usual cause");
  if (a.color === "green" && a.med) reasons.push("Antibiotics can turn stool green");

  // Persistence: any off-brown color that lasts without a food explanation.
  if (a.color !== "brown" && a.days === "4plus" && !a.food && !a.med) {
    level = max(level, "watch"); reasons.push("An off-brown color lasting more than a few days with no food or medicine explanation");
  }
  if (a.feelUnwell && a.color !== "brown") {
    level = max(level, "watch"); reasons.push("Feeling unwell (fever, pain or diarrhea) along with the color change");
  }
  if (a.color === "brown") reasons.push("Brown in any shade is normal");
  return { level, reasons };
}
