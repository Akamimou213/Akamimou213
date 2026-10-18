import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, dayKey, landingStatus, patterns, toDisplay, weekStats, type WeekStats } from "../lib/calc";
import { useStore } from "../lib/store";
import type { Data, Dose } from "../lib/types";
import { FlightPathChart, PHASES, PhaseIndicator } from "../components/instruments";
import { Chips, Panel } from "../components/ui";

export function doseTicks(doses: Dose[]) {
  const sorted = [...doses].sort((a, b) => (a.at < b.at ? -1 : 1));
  const out: { day: string; label: string }[] = [];
  let prev = "";
  for (const d of sorted) {
    if (d.dose && d.dose !== prev) out.push({ day: dayKey(new Date(d.at)), label: d.dose.replace(/\s/g, "") });
    prev = d.dose;
  }
  return out;
}

function fmt(n: number | null, digits = 1) {
  return n === null ? "–" : n.toFixed(digits);
}

/** A deterministic weekly report built only from the numbers on screen. */
export function flightReport(data: Data, now: WeekStats, prev: WeekStats) {
  const wins: string[] = [];
  if (now.proteinDaysHit >= 4) wins.push(`Protein target hit on ${now.proteinDaysHit} of 7 days.`);
  if (now.strength >= 2) wins.push(`${now.strength} strength sessions. That's muscle protected.`);
  if (now.avgNausea !== null && prev.avgNausea !== null && now.avgNausea < prev.avgNausea) wins.push(`Nausea averaged ${fmt(now.avgNausea)}, down from ${fmt(prev.avgNausea)}.`);
  if (!wins.length) wins.push("You kept logging. That's what makes the patterns visible.");

  let focus: { title: string; why: string; how: string[] };
  if (now.proteinDaysHit < 4) {
    focus = {
      title: "Protein first",
      why: `You hit your ${data.profile.proteinTarget}g target on ${now.proteinDaysHit} of 7 days.`,
      how: ["Start each meal with the protein part.", "Keep two no-cook options at home (yogurt, shakes, eggs).", "Use “Close the gap” after 2pm."],
    };
  } else if (now.strength < 2) {
    focus = {
      title: "Two strength sessions",
      why: `You logged ${now.strength} strength session${now.strength === 1 ? "" : "s"} this week.`,
      how: ["Put two 30-minute sessions in your calendar now.", "Bodyweight counts: squats, push-ups, rows.", "Log it so the habit shows on your path."],
    };
  } else if (now.avgNoise !== null && prev.avgNoise !== null && now.avgNoise > prev.avgNoise + 0.4) {
    focus = {
      title: "Plan for loud food noise",
      why: `Food noise averaged ${fmt(now.avgNoise)} vs ${fmt(prev.avgNoise)} last week.`,
      how: ["Notice which time of day it's loudest.", "Have a protein snack ready for that window.", "Mention the change to your prescriber."],
    };
  } else {
    focus = { title: "Hold this course", why: "Your habits are on target this week.", how: ["Keep the same meal anchors.", "Keep both strength sessions.", "Weigh in 3 times so the trend stays reliable."] };
  }
  const headline = now.proteinDaysHit >= 5 && now.strength >= 2 ? "Smooth air this week." : "A few adjustments for next week.";
  return { headline, wins, focus };
}

export default function Path() {
  const { data } = useStore();
  const p = data.profile;
  const today = dayKey();
  const [range, setRange] = useState<("28" | "90" | "all")[]>(["90"]);
  const [showReport, setShowReport] = useState(false);
  const first = useMemo(() => [...data.weights].sort((a, b) => (a.day < b.day ? -1 : 1))[0]?.day ?? addDays(today, -28), [data.weights, today]);
  const from = range[0] === "all" ? first : addDays(today, -Number(range[0]));
  const ticks = useMemo(() => doseTicks(data.doses), [data.doses]);
  const readout = data.landing?.active ? landingStatus(data.landing, data.weights, today) : null;
  const now = weekStats(data, today);
  const prev = weekStats(data, addDays(today, -7));
  const notes = patterns(data, today);
  const report = flightReport(data, now, prev);
  const phase = PHASES.find((x) => x.id === p.phase)!;
  const arrow = (a: number | null, b: number | null) => (a === null || b === null ? "" : a > b + 0.2 ? "↑" : a < b - 0.2 ? "↓" : "→");

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Flight path</p>
          <h1>Your approach</h1>
        </div>
      </header>

      <Panel>
        <Chips
          label="Range"
          options={[
            { id: "28", label: "4 weeks" },
            { id: "90", label: "3 months" },
            { id: "all", label: "All" },
          ]}
          value={range}
          onChange={(v) => v.length && setRange(v)}
        />
        <FlightPathChart
          weights={data.weights}
          units={p.units}
          hideNumbers={p.hideWeight}
          zone={readout && data.landing ? { landingKg: data.landing.landingKg, lower: readout.lower, upper: readout.upper } : null}
          ticks={ticks}
          fromDay={from}
          toDay={today}
        />
        <p className="muted small">Line: 7-day average · dots: weigh-ins · ticks: dose changes{readout ? " · band: your landing zone" : ""}</p>
      </Panel>

      <Panel title="Phase" action={<Link to="/settings" className="link">Change</Link>}>
        <PhaseIndicator phase={p.phase} />
        <p className="muted">{phase.blurb}</p>
      </Panel>

      <Panel title="This week">
        <div className="instruments">
          <div className="inst">
            <span className="inst-val">
              {now.proteinDaysHit}
              <small>/7</small>
            </span>
            <span className="inst-label">Protein days</span>
          </div>
          <div className="inst">
            <span className="inst-val">{now.strength}</span>
            <span className="inst-label">Strength</span>
          </div>
          <div className="inst">
            <span className="inst-val">
              {fmt(now.avgNoise)}
              <small>{arrow(now.avgNoise, prev.avgNoise)}</small>
            </span>
            <span className="inst-label">Food noise</span>
          </div>
          <div className="inst">
            <span className="inst-val">
              {fmt(now.avgNausea)}
              <small>{arrow(now.avgNausea, prev.avgNausea)}</small>
            </span>
            <span className="inst-label">Nausea</span>
          </div>
        </div>
      </Panel>

      <Panel title="Your patterns">
        {notes.length ? (
          <ul className="patterns">
            {notes.map((n) => (
              <li key={n.title}>
                <strong>{n.title}</strong>
                <span>{n.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Patterns appear after about three dose cycles of check-ins and meals. They come only from your own logs.</p>
        )}
      </Panel>

      <Panel title="Weekly flight report">
        {showReport ? (
          <div className="report-card">
            <h3>{report.headline}</h3>
            <p className="eyebrow">Wins</p>
            <ul>
              {report.wins.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="eyebrow">Focus: {report.focus.title}</p>
            <p className="muted">{report.focus.why}</p>
            <ol>
              {report.focus.how.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
          </div>
        ) : (
          <button type="button" className="btn primary" onClick={() => setShowReport(true)}>
            Generate this week's report
          </button>
        )}
      </Panel>

      {readout && data.landing && (
        <Link to="/landing-mode" className="landing-teaser">
          <span className="eyebrow">Landing mode</span>
          <span>
            7-day avg {p.hideWeight || readout.avg === null ? "" : `${toDisplay(readout.avg, p.units).toFixed(1)} ${p.units} · `}open →
          </span>
        </Link>
      )}
    </div>
  );
}
