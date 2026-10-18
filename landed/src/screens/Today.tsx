import { Link } from "react-router-dom";
import { daysSinceLastDose, dayKey, doseLoggedOn, formatDay, formatTime, lowIntake, nextWeekday, proteinOn, WEEKDAYS, fmtWeight } from "../lib/calc";
import { suggestProtein } from "../lib/protein";
import { useStore } from "../lib/store";
import { FlightStrip, PhaseIndicator, ProteinGauge } from "../components/instruments";
import { Panel } from "../components/ui";
import { CheckinForm, useSheets } from "./LogSheets";

export default function Today() {
  const { data, demo } = useStore();
  const open = useSheets();
  const p = data.profile;
  const today = dayKey();
  const protein = proteinOn(data.meals, today);
  const gap = Math.max(0, p.proteinTarget - protein);
  const checkin = data.checkins.find((c) => c.day === today);
  const since = daysSinceLastDose(data.doses, today);
  const doseToday = doseLoggedOn(data.doses, today);
  const isDoseDay = p.medForm === "injection" && new Date().getDay() === p.doseWeekday;
  const afternoon = new Date().getHours() >= 14;
  const showGap = gap > 0 && (afternoon || demo);
  const suggestions = showGap ? suggestProtein(gap, checkin?.nausea ?? 0, p.dietary) : [];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const strips = [
    ...data.doses.filter((d) => dayKey(new Date(d.at)) === today).map((d) => ({ at: d.at, kind: "dose" as const, fields: ["DOSE", d.medication, d.dose, d.site ?? ""].filter(Boolean) })),
    ...data.meals.filter((m) => dayKey(new Date(m.at)) === today).map((m) => ({ at: m.at, kind: "meal" as const, fields: ["MEAL", m.title, `${m.protein} G`] })),
    ...data.workouts.filter((w) => w.day === today).map((w) => ({ at: `${today}T23:00:00`, kind: "workout" as const, fields: ["WORKOUT", w.kind.toUpperCase(), `${w.minutes} MIN`] })),
    ...data.weights.filter((w) => w.day === today).map((w) => ({ at: `${today}T06:00:00`, kind: "weight" as const, fields: ["WEIGH-IN", p.hideWeight ? "logged" : fmtWeight(w.kg, p.units)] })),
  ].sort((a, b) => (a.at < b.at ? -1 : 1));

  let doseLine: string;
  if (p.medForm === "pill") doseLine = doseToday ? "Pill taken today." : `Daily pill · usually ${p.doseTime}`;
  else if (doseToday) doseLine = "Dose logged today. Cleared for the week.";
  else if (isDoseDay) doseLine = "Dose day. Log it when you're done.";
  else if (since !== null) doseLine = `Day ${since} since your dose · next ${formatDay(nextWeekday(p.doseWeekday, today), { weekday: "short" })}`;
  else doseLine = `Dose day: ${WEEKDAYS[p.doseWeekday]}`;

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">{formatDay(today, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1>
            {greet}
            {p.name ? `, ${p.name}` : ""}
          </h1>
        </div>
        <Link to="/settings" className="avatar" aria-label="Settings">
          {(p.name || "L").slice(0, 1).toUpperCase()}
        </Link>
      </header>

      <PhaseIndicator phase={p.phase} compact />

      <Panel className="dose-card">
        <div className="dose-row">
          <div>
            <p className="eyebrow">{p.medication || "Medication"} {p.currentDose && <span className="mono">· {p.currentDose}</span>}</p>
            <p className="dose-line">{doseLine}</p>
          </div>
          {!doseToday && (isDoseDay || p.medForm === "pill") && (
            <button type="button" className="btn primary sm" onClick={() => open("dose")}>
              Log {p.medForm === "pill" ? "pill" : "dose"}
            </button>
          )}
        </div>
      </Panel>

      <Panel className="gauge-panel">
        <ProteinGauge value={protein} target={p.proteinTarget} />
        <div className="row">
          <button type="button" className="btn primary" onClick={() => open("meal")}>
            Snap a meal
          </button>
        </div>
      </Panel>

      {showGap && suggestions.length > 0 && (
        <Panel title={`Close the gap · ${gap}g to go`}>
          <ul className="suggestions">
            {suggestions.map((s) => (
              <li key={s.name}>
                <span>
                  <strong>{s.name}</strong>
                  <small>{s.why}</small>
                </span>
                <span className="mono">+{s.proteinG}g</span>
              </li>
            ))}
          </ul>
          {(checkin?.nausea ?? 0) >= 3 && <p className="muted small">Gentler options, since your nausea is high today.</p>}
        </Panel>
      )}

      <Panel title="Check-in" action={checkin ? <span className="tag on">Done ✓</span> : <span className="tag">10 sec</span>}>
        <CheckinForm />
      </Panel>

      {checkin && checkin.nausea >= 4 && (
        <p className="safety-line" role="alert">
          If you can't keep fluids down or have severe stomach pain that won't go away, contact your prescriber or seek urgent care. <Link to="/safety">Safety info</Link>
        </p>
      )}
      {lowIntake(data, today) && (
        <p className="notice">It looks like eating enough has been hard this week. That's common on GLP-1s, and worth mentioning to your prescriber or a dietitian.</p>
      )}

      <Panel title="Today's log" action={<Link to="/log" className="link">Full log</Link>}>
        {strips.length ? (
          <div className="strips">
            {strips.map((s, i) => (
              <FlightStrip key={i} kind={s.kind} fields={s.fields} time={s.kind === "dose" || s.kind === "meal" ? formatTime(s.at) : undefined} />
            ))}
          </div>
        ) : (
          <p className="muted">Nothing logged yet today. Tap the + below.</p>
        )}
      </Panel>

      {data.landing?.active && (
        <Link to="/landing-mode" className="landing-teaser">
          <span className="eyebrow">Landing mode</span>
          <span>Check your approach →</span>
        </Link>
      )}
    </div>
  );
}
