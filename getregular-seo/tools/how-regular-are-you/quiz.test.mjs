// Run: node --test quiz.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { score, pattern, result, visibleQuestions, appStoreUrl, QUESTIONS } from "./quiz.js";

const base = { form: 4, freq: "1to3day", strain: "rarely", incomplete: "rarely", urgency: "rarely",
  pain: "none", bloat: "rarely", duration: "gt6m", redflags: ["none"], goal: "regular" };

test("ideal answers score 100 and read as regular", () => {
  assert.equal(score(base), 100);
  assert.equal(pattern(base), "regular");
  assert.equal(result(base).band.key, "regular");
});

test("worst answers floor at 0..40 and never go negative", () => {
  const worst = { ...base, form: 7, freq: "gt3day", strain: "often", incomplete: "often", urgency: "often",
    pain: "linked", painDays: "4plus", bloat: "most" };
  const s = score(worst);
  assert.ok(s >= 0 && s < 40, `score ${s}`);
});

test("constipation needs two Rome-style features", () => {
  assert.equal(pattern({ ...base, form: 2 }), "slow");
  assert.equal(pattern({ ...base, form: 2, freq: "lt3wk" }), "constipation");
  assert.equal(pattern({ ...base, freq: "lt3wk", strain: "often" }), "constipation");
});

test("loose stool alone reads as loose-leaning", () => {
  assert.equal(pattern({ ...base, form: 6 }), "loose");
  assert.equal(pattern({ ...base, freq: "gt3day", urgency: "often" }), "loose");
});

test("hard and loose features together, or 'changes a lot', read as alternating", () => {
  assert.equal(pattern({ ...base, form: "mixed" }), "alternating");
  assert.equal(pattern({ ...base, form: 2, urgency: "often" }), "alternating");
});

test("weekly bowel-linked pain for 3+ months gives an IBS-like subtype", () => {
  const p = { ...base, pain: "linked", painDays: "1to3", duration: "gt6m" };
  assert.equal(pattern({ ...p, form: 1, freq: "lt3wk" }), "ibs-c");
  assert.equal(pattern({ ...p, form: 7 }), "ibs-d");
  assert.equal(pattern({ ...p, form: "mixed" }), "ibs-mixed");
  // same pain but recent onset: not labelled IBS-like
  assert.equal(pattern({ ...p, form: 7, duration: "lt1m" }), "loose");
  // pain unrelated to bowel movements: not IBS-like
  assert.equal(pattern({ ...base, pain: "unlinked", painDays: "4plus", form: 7 }), "loose");
});

test("bloating-only pattern", () => {
  assert.equal(pattern({ ...base, bloat: "most" }), "bloating");
});

test("red flags lead with the doctor card", () => {
  const r = result({ ...base, redflags: ["blood", "night"] });
  assert.equal(r.leadWithDoctor, true);
  assert.deepEqual(r.redFlags, ["blood", "night"]);
  assert.equal(result(base).leadWithDoctor, false);
});

test("pain-days question only shows when there is pain", () => {
  assert.ok(!visibleQuestions({ pain: "none" }).some((q) => q.id === "painDays"));
  assert.ok(visibleQuestions({ pain: "linked" }).some((q) => q.id === "painDays"));
  assert.equal(QUESTIONS.length, 11);
});

test("App Store link carries the CPP and campaign token", () => {
  const u = new URL(appStoreUrl(result({ ...base, form: 1, freq: "lt3wk" }), { constipation: "abc-123" }));
  assert.equal(u.searchParams.get("ppid"), "abc-123");
  assert.equal(u.searchParams.get("ct"), "quiz-constipation");
});

test("every answer combination produces a known pattern and a score in range", () => {
  const forms = [1, 2, 3, 4, 5, 6, 7, "mixed"], freqs = ["lt3wk", "3to6wk", "1to3day", "gt3day"], often = ["rarely", "sometimes", "often"];
  let n = 0;
  for (const form of forms) for (const freq of freqs) for (const strain of often) for (const urgency of often)
    for (const pain of ["none", "linked", "unlinked"]) for (const painDays of ["lt1", "1to3", "4plus"]) {
      const r = result({ ...base, form, freq, strain, urgency, pain, painDays });
      assert.ok(r.label && r.score >= 0 && r.score <= 100); n++;
    }
  assert.ok(n > 2000);
});
