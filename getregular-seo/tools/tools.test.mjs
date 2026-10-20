// Run: node --test tools/tools.test.mjs   (logic for both tools: the stool chart and the bloat quiz)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TYPES, SPEED, SIDE } from "./bristol-stool-chart/chart.js";
import { chartRows, printSheet } from "./bristol-stool-chart/render.js";
import { matchBloat, planFor, quizFlow, experimentFor, BLOAT_PATTERNS, BLOAT_QUESTIONS, BLOAT_GOALS, BLOAT_SOURCES, EXPERIMENTS } from "./why-am-i-bloated/bloat.js";

const BSFS = /like nuts|sausage|clear-cut edges|fluffy pieces|entirely liquid/i;

test("stool chart: 7 types with own wording, a level, speed, side and a source", () => {
  for (let t = 1; t <= 7; t++) {
    const d = TYPES[t];
    assert.ok(d.look && d.headline && d.suggests && d.level && d.reasons.length && d.tryThis.length && d.cite.length, `type ${t}`);
    assert.ok(SPEED[t] && SIDE[t], `type ${t} speed/side`);
  }
  assert.equal(TYPES[7].urgentNote, true);
});

test("stool chart: never the licensed BSFS descriptor text, in data or page", () => {
  const all = Object.values(TYPES).map((t) => `${t.look} ${t.headline} ${t.suggests}`).join(" ");
  assert.ok(!BSFS.test(all));
  const page = readFileSync(new URL("./bristol-stool-chart/index.html", import.meta.url), "utf8");
  assert.ok(!BSFS.test(page) && !BSFS.test(chartRows()) && !BSFS.test(printSheet()));
});

test("stool chart: the 7 rows are server-rendered HTML with deep-link anchors", () => {
  const html = chartRows();
  assert.equal((html.match(/<details class="row/g) || []).length, 7);
  for (let t = 1; t <= 7; t++) assert.ok(html.includes(`id="type-${t}"`));
  assert.equal((html.match(/class="alert urgent"/g) || []).length, 1); // type 7 only
  assert.equal((printSheet().match(/<tr/g) || []).length, 7);
});

test("bloat: evening growth reads as meal-related", () => {
  const r = matchBloat({ goal: "meals", often: "daily", timing: "growsDay", foods: ["none"], bowels: "noLink", cycle: "na", early: "no", howLong: "lt3m", flags: ["none"] });
  assert.deepEqual(r.patterns, ["meal"]); assert.equal(r.seeDoctor, false);
});

test("bloat: food + constipation + cycle rank together, max 3", () => {
  const r = matchBloat({ timing: "growsDay", foods: ["dairy", "fizzy"], bowels: "constipated", cycle: "before", early: "no", flags: ["none"] });
  assert.deepEqual(r.patterns, ["constipation", "carbs", "hormonal"]);
});

test("bloat: all-day, early fullness or any flag sends to a doctor", () => {
  assert.equal(matchBloat({ timing: "allDay", flags: ["none"] }).seeDoctor, true);
  assert.equal(matchBloat({ timing: "random", early: "yesNausea", flags: ["none"] }).patterns[0], "upper");
  assert.equal(matchBloat({ timing: "random", flags: ["ovarian"] }).seeDoctor, true);
});

test("bloat: plan is an experiment, or a doctor-visit plan whenever a doctor is advised", () => {
  const ok = matchBloat({ timing: "growsDay", foods: ["dairy"], flags: ["none"] });
  const p = planFor(ok);
  assert.equal(p.kind, "experiment"); assert.equal(p.key, "carbs"); assert.equal(p.steps.length, 3);
  // a red flag overrides an otherwise testable pattern
  const flagged = matchBloat({ timing: "growsDay", foods: ["dairy"], flags: ["weight"] });
  assert.equal(planFor(flagged).kind, "doctor");
  assert.equal(planFor(matchBloat({ timing: "allDay", flags: ["none"] })).kind, "doctor");
  // persistent/upper never get an experiment of their own
  assert.equal(EXPERIMENTS.persistent, undefined); assert.equal(EXPERIMENTS.upper, undefined);
  assert.equal(experimentFor(["upper", "carbs"]).key, "carbs");
});

test("bloat: quiz flow is 9 questions with 2 fact screens, never fact-first or fact-last", () => {
  const flow = quizFlow();
  assert.equal(flow.filter((q) => !q.fact).length, 9);
  assert.equal(BLOAT_QUESTIONS.length, 9);
  const facts = flow.filter((q) => q.fact);
  assert.equal(facts.length, 2);
  assert.ok(!flow[0].fact && !flow.at(-1).fact);
  for (const f of facts) assert.ok(f.big && f.text && f.cite.every((c) => BLOAT_SOURCES[c]));
  assert.equal(flow.at(-1).id, "flags");
  assert.deepEqual(BLOAT_QUESTIONS[0].options.map((o) => o.v), Object.keys(BLOAT_GOALS));
});

test("bloat: every pattern has copy, steps and a known source", () => {
  for (const p of Object.values(BLOAT_PATTERNS)) {
    assert.ok(p.title && p.body && p.next.length && p.cite.length && p.learn);
    assert.ok(p.cite.every((c) => BLOAT_SOURCES[c]));
  }
});
