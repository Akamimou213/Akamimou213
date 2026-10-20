// Run: node --test tools/tools.test.mjs   (scoring/triage logic for every tool except the quiz,
// which has its own tests in how-regular-are-you/quiz.test.mjs)
import test from "node:test";
import assert from "node:assert/strict";
import { TYPES, summarizeWeek } from "./bristol-stool-chart/chart.js";
import { COLORS, ORDER, assess } from "./poop-color-chart/colors.js";

test("stool chart: 7 types with own wording and a level", () => {
  for (let t = 1; t <= 7; t++) assert.ok(TYPES[t].look && TYPES[t].level && TYPES[t].cite.length);
  // never the licensed BSFS descriptor text
  const all = Object.values(TYPES).map((t) => t.look).join(" ");
  assert.ok(!/like nuts|sausage|clear-cut edges|fluffy pieces/i.test(all));
});

test("stool chart: week summary", () => {
  assert.equal(summarizeWeek([4, 4, 3, null, null, null, null]).headline, "Log at least 4 days to see a pattern.");
  assert.equal(summarizeWeek([4, 4, 3, 5, 4, 4, 3]).headline, "Your week looks mostly in the usual range.");
  assert.equal(summarizeWeek([1, "none", 2, "none", 1, 4, 2]).headline, "Your week leaned hard and slow.");
  assert.equal(summarizeWeek([6, 7, 6, 4, 4, 3, 4]).headline, "Your week leaned loose.");
  assert.equal(summarizeWeek([1, 2, 1, 7, 6, 4, 4]).headline, "Your week swung between hard and loose.");
  assert.equal(summarizeWeek([1, 2, 1, 7, 6, 4, 4]).counts.loose, 2);
});

test("color: brown is normal", () => assert.equal(assess({ color: "brown" }).level, "ok"));
test("color: black after iron is usually benign, tarry is same-day, dizzy is emergency", () => {
  assert.equal(assess({ color: "black", med: true, tarry: false }).level, "food");
  assert.equal(assess({ color: "black", med: true, tarry: true }).level, "sameday");
  assert.equal(assess({ color: "black", tarry: false, dizzy: true }).level, "emergency");
});
test("color: red without food is same-day; after beets is food", () => {
  assert.equal(assess({ color: "red", food: false }).level, "sameday");
  assert.equal(assess({ color: "red", food: true }).level, "food");
  assert.equal(assess({ color: "red", food: true, feelUnwell: true }).level, "sameday");
});
test("color: maroon is always at least same-day", () => assert.equal(assess({ color: "maroon" }).level, "sameday"));
test("color: pale with jaundice is same-day; one pale stool is food-level", () => {
  assert.equal(assess({ color: "pale", jaundice: true }).level, "sameday");
  assert.equal(assess({ color: "pale", days: "1" }).level, "food");
  assert.equal(assess({ color: "pale", days: "4plus" }).level, "watch");
});
test("color: off-brown lasting 4+ days without explanation needs watching", () => {
  assert.equal(assess({ color: "green", days: "4plus", food: false, med: false }).level, "watch");
  assert.equal(assess({ color: "green", days: "1", food: true }).level, "food");
  assert.equal(assess({ color: "yellow", greasy: true }).level, "watch");
});
test("color: heavy bleeding is always an emergency", () => {
  for (const c of ORDER) assert.equal(assess({ color: c, heavyBleeding: true }).level, "emergency");
});

import { matchBloat, BLOAT_PATTERNS, BLOAT_QUESTIONS } from "./why-am-i-bloated/bloat.js";
import { buildSheet } from "./gi-appointment-prep/prep.js";

test("bloat: evening growth reads as meal-related", () => {
  const r = matchBloat({ timing: "growsDay", foods: ["none"], bowels: "noLink", cycle: "na", early: "no", howLong: "lt3m", flags: ["none"] });
  assert.deepEqual(r.patterns, ["meal"]); assert.equal(r.seeDoctor, false);
});
test("bloat: food + constipation + cycle rank together, max 3", () => {
  const r = matchBloat({ timing: "growsDay", foods: ["dairy", "fizzy"], bowels: "constipated", cycle: "before", early: "no", flags: ["none"] });
  assert.equal(r.patterns.length, 3);
  assert.deepEqual(r.patterns, ["constipation", "carbs", "hormonal"]);
});
test("bloat: all-day or early fullness or any flag sends to a doctor", () => {
  assert.equal(matchBloat({ timing: "allDay", flags: ["none"] }).seeDoctor, true);
  assert.equal(matchBloat({ timing: "random", early: "yesNausea", flags: ["none"] }).patterns[0], "upper");
  assert.equal(matchBloat({ timing: "random", flags: ["ovarian"] }).seeDoctor, true);
});
test("bloat: every pattern has copy, steps and a source", () => {
  for (const p of Object.values(BLOAT_PATTERNS)) assert.ok(p.title && p.body && p.next.length && p.cite.length && p.learn);
  assert.equal(BLOAT_QUESTIONS.length, 7);
});
test("prep: first visit with IBS-like symptoms adds IBS and celiac questions", () => {
  const s = buildSheet({ visit: "first", symptoms: ["pain", "diarrhea"], duration: "gt1y", tried: ["fiber"], warnings: [] });
  assert.ok(s.ibsLike);
  assert.ok(s.questions.some((q) => /subtype/.test(q)));
  assert.ok(s.questions.some((q) => /celiac/.test(q)));
  assert.equal(s.questions.slice(0, 3).length, 3);
  assert.match(s.summary[2], /Fiber/);
});
test("prep: warnings go first, no duplicate questions, recent symptoms are not IBS-like", () => {
  const s = buildSheet({ visit: "followup", symptoms: ["pain", "constipation"], duration: "lt3m", tried: [], warnings: ["blood", "weight"] });
  assert.deepEqual(s.mentionFirst, ["Blood in stool, or black stool", "Losing weight without trying"]);
  assert.equal(s.ibsLike, false);
  assert.equal(new Set(s.questions).size, s.questions.length);
});
