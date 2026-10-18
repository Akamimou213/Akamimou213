import type { CheckIn, Data, Dose, LandingPlan, LandingStatus, Meal, Units, Weight, Workout } from "./types";

// ---------- Dates (always local time, never UTC) ----------

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as local midnight. */
export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** Whole calendar days from a to b (b − a). Safe across DST because both are local midnights rounded. */
export function diffDays(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);
}

export function formatDay(key: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }): string {
  return parseDay(key).toLocaleDateString(undefined, opts);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---------- Units ----------

export const KG_PER_LB = 0.45359237;
export const toDisplay = (kg: number, u: Units) => (u === "lb" ? kg / KG_PER_LB : kg);
export const fromDisplay = (v: number, u: Units) => (u === "lb" ? v * KG_PER_LB : v);
export const fmtWeight = (kg: number, u: Units, digits = 1) => `${toDisplay(kg, u).toFixed(digits)} ${u}`;

// ---------- Doses ----------

/**
 * Days since the most recent dose taken on or before `today`.
 * Examples: dose today → 0; dose yesterday → 1; no doses → null.
 */
export function daysSinceLastDose(doses: Dose[], today: string = dayKey()): number | null {
  let best: string | null = null;
  for (const d of doses) {
    const k = dayKey(new Date(d.at));
    if (k <= today && (best === null || k > best)) best = k;
  }
  return best === null ? null : diffDays(best, today);
}

/** Day key of the most recent dose on or before `day`. */
export function lastDoseDayOnOrBefore(doses: Dose[], day: string): string | null {
  let best: string | null = null;
  for (const d of doses) {
    const k = dayKey(new Date(d.at));
    if (k <= day && (best === null || k > best)) best = k;
  }
  return best;
}

export function doseLoggedOn(doses: Dose[], day: string): boolean {
  return doses.some((d) => dayKey(new Date(d.at)) === day);
}

/** Next calendar day (including today) that falls on `weekday`. */
export function nextWeekday(weekday: number, today: string = dayKey()): string {
  const d = parseDay(today);
  const delta = (weekday - d.getDay() + 7) % 7;
  return addDays(today, delta);
}

// ---------- Protein ----------

export function proteinOn(meals: Meal[], day: string): number {
  return meals.filter((m) => dayKey(new Date(m.at)) === day).reduce((s, m) => s + m.protein, 0);
}

// ---------- Weight trend ----------

export interface TrendPoint {
  day: string;
  kg: number; // raw
  avg: number; // trailing 7-day average of weigh-ins in [day-6, day]
}

/**
 * Trailing 7-day moving average evaluated at each weigh-in day.
 * Example: weigh-ins 100 (d1), 98 (d4), 96 (d10) → avg at d10 uses d4..d10 → (98+96)/2 = 97.
 */
export function trend(weights: Weight[]): TrendPoint[] {
  const sorted = [...weights].sort((a, b) => (a.day < b.day ? -1 : 1));
  return sorted.map((w) => {
    const from = addDays(w.day, -6);
    const win = sorted.filter((x) => x.day >= from && x.day <= w.day);
    const avg = win.reduce((s, x) => s + x.kg, 0) / win.length;
    return { day: w.day, kg: w.kg, avg };
  });
}

export function latestAvg(weights: Weight[]): number | null {
  const t = trend(weights);
  return t.length ? t[t.length - 1].avg : null;
}

/** Average at (or nearest before) a given day. */
export function avgAt(points: TrendPoint[], day: string): number | null {
  let v: number | null = null;
  for (const p of points) if (p.day <= day) v = p.avg;
  return v;
}

// ---------- Landing mode ----------

export interface LandingReadout {
  status: LandingStatus;
  avg: number | null;
  lower: number;
  upper: number;
  weeklyChangePct: number | null;
  reason: string;
}

/**
 * ON COURSE: 7-day average inside the zone (or below it).
 * DRIFTING: average in the top 25% of the zone, or rising > 0.5%/week for two consecutive weeks.
 * COURSE CORRECTION: average above the zone.
 */
export function landingStatus(plan: LandingPlan, weights: Weight[], today: string = dayKey()): LandingReadout {
  const half = plan.landingKg * (plan.zonePct / 100);
  const lower = plan.landingKg - half;
  const upper = plan.landingKg + half;
  const pts = trend(weights);
  const avg = avgAt(pts, today);
  const a1 = avgAt(pts, addDays(today, -7));
  const a2 = avgAt(pts, addDays(today, -14));
  const w1 = avg !== null && a1 ? ((avg - a1) / a1) * 100 : null;
  const w2 = a1 !== null && a2 ? ((a1 - a2) / a2) * 100 : null;

  if (avg === null) return { status: "on", avg, lower, upper, weeklyChangePct: null, reason: "Log a few weigh-ins to start tracking your landing." };
  if (avg > upper) return { status: "correction", avg, lower, upper, weeklyChangePct: w1, reason: "Your 7-day average is above your landing zone." };
  const rising = w1 !== null && w2 !== null && w1 > 0.5 && w2 > 0.5;
  if (avg > plan.landingKg + 0.5 * half || rising) {
    return {
      status: "drifting",
      avg,
      lower,
      upper,
      weeklyChangePct: w1,
      reason: rising ? "Your average has crept up for two weeks in a row." : "You're in the upper edge of your landing zone.",
    };
  }
  return { status: "on", avg, lower, upper, weeklyChangePct: w1, reason: avg < lower ? "You're below your zone. Still on course." : "You're inside your landing zone." };
}

// ---------- Weekly stats & patterns ----------

export interface WeekStats {
  proteinDaysHit: number;
  daysLogged: number;
  strength: number;
  avgNoise: number | null;
  avgNausea: number | null;
}

export function weekStats(data: Data, endDay: string = dayKey()): WeekStats {
  const start = addDays(endDay, -6);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(addDays(start, i));
  const target = data.profile.proteinTarget;
  let hit = 0;
  let logged = 0;
  for (const d of days) {
    const p = proteinOn(data.meals, d);
    if (p > 0) logged++;
    if (p >= target) hit++;
  }
  const strength = data.workouts.filter((w: Workout) => w.kind === "strength" && w.day >= start && w.day <= endDay).length;
  const cis = data.checkins.filter((c: CheckIn) => c.day >= start && c.day <= endDay);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  return {
    proteinDaysHit: hit,
    daysLogged: logged,
    strength,
    avgNoise: avg(cis.map((c) => c.foodNoise)),
    avgNausea: avg(cis.map((c) => c.nausea)),
  };
}

export interface PatternNote {
  title: string;
  detail: string;
}

/** Patterns computed only from the user's own logs. Never causal. */
export function patterns(data: Data, today: string = dayKey()): PatternNote[] {
  const out: PatternNote[] = [];
  const since = addDays(today, -28);
  const doses = data.doses;
  const dosesInWindow = doses.filter((d) => dayKey(new Date(d.at)) >= since);

  if (data.profile.medForm === "injection" && dosesInWindow.length >= 3) {
    const early: number[] = [];
    const other: number[] = [];
    for (const c of data.checkins.filter((c) => c.day >= since)) {
      const last = lastDoseDayOnOrBefore(doses, c.day);
      if (!last) continue;
      const ds = diffDays(last, c.day);
      (ds >= 1 && ds <= 2 ? early : other).push(c.nausea);
    }
    if (early.length >= 3 && other.length >= 3) {
      const e = early.reduce((s, x) => s + x, 0) / early.length;
      const o = other.reduce((s, x) => s + x, 0) / other.length;
      if (Math.abs(e - o) >= 0.5) {
        out.push({
          title: "Nausea and your dose cycle",
          detail: `Nausea averaged ${e.toFixed(1)} on days 1–2 after your dose vs ${o.toFixed(1)} on other days (last 4 weeks).`,
        });
      }
    }

    const doseDays = new Set(dosesInWindow.map((d) => dayKey(new Date(d.at))));
    const dp: number[] = [];
    const op: number[] = [];
    for (let i = 0; i < 28; i++) {
      const d = addDays(since, i + 1);
      const p = proteinOn(data.meals, d);
      if (p === 0) continue;
      (doseDays.has(d) ? dp : op).push(p);
    }
    if (dp.length >= 3 && op.length >= 6) {
      const a = dp.reduce((s, x) => s + x, 0) / dp.length;
      const b = op.reduce((s, x) => s + x, 0) / op.length;
      if (Math.abs(a - b) >= 8) {
        out.push({
          title: "Protein on dose day",
          detail: `You averaged ${Math.round(a)}g of protein on dose days vs ${Math.round(b)}g on other days (last 4 weeks).`,
        });
      }
    }
  }

  if (data.landing?.active) {
    const before = data.checkins.filter((c) => c.day < data.landing!.changeDate && c.day >= addDays(data.landing!.changeDate, -14));
    const after = data.checkins.filter((c) => c.day >= data.landing!.changeDate);
    if (before.length >= 4 && after.length >= 4) {
      const b = before.reduce((s, c) => s + c.foodNoise, 0) / before.length;
      const a = after.reduce((s, c) => s + c.foodNoise, 0) / after.length;
      out.push({
        title: "Food noise since your change",
        detail: `Food noise averaged ${a.toFixed(1)} since ${formatDay(data.landing.changeDate)} vs ${b.toFixed(1)} in the two weeks before.`,
      });
    }
  }
  return out;
}

/** Low-intake rule: under 40% of target on 5 of the last 7 days (only days with any meal logged count as data). */
export function lowIntake(data: Data, today: string = dayKey()): boolean {
  let low = 0;
  let loggedDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, -i);
    const p = proteinOn(data.meals, d);
    if (p > 0) {
      loggedDays++;
      if (p < data.profile.proteinTarget * 0.4) low++;
    }
  }
  return loggedDays >= 5 && low >= 5;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
