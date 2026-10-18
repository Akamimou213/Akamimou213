import { useState } from "react";
import { Link } from "react-router-dom";
import { addDays, dayKey, formatDay, fromDisplay, latestAvg, landingStatus, toDisplay, weekStats, WEEKDAYS } from "../lib/calc";
import { downloadIcs } from "../lib/ics";
import { track, useStore } from "../lib/store";
import type { ChangeKind, LandingPlan } from "../lib/types";
import { Annunciator, FlightPathChart, RunwayGlyph } from "../components/instruments";
import { Chips, Field, Panel, Stepper, useToast } from "../components/ui";
import { doseTicks } from "./Path";

const CHANGES: { id: ChangeKind; label: string }[] = [
  { id: "taper", label: "Lowering my dose" },
  { id: "pause", label: "Pausing" },
  { id: "pill", label: "Switching to a pill" },
  { id: "stop", label: "Stopping" },
];

export default function LandingMode() {
  const { data, setLanding } = useStore();
  const [editing, setEditing] = useState(false);
  const plan = data.landing;
  if (!plan || !plan.active || editing) {
    return (
      <Setup
        initial={plan}
        onSave={(p) => {
          setLanding(p);
          setEditing(false);
          track("landing_mode_started", { change_kind: p.changeKind });
        }}
        onCancel={plan?.active ? () => setEditing(false) : undefined}
      />
    );
  }
  return <Status plan={plan} onEdit={() => setEditing(true)} onEnd={() => setLanding({ ...plan, active: false })} />;
}

function Setup({ initial, onSave, onCancel }: { initial: LandingPlan | null; onSave: (p: LandingPlan) => void; onCancel?: () => void }) {
  const { data } = useStore();
  const u = data.profile.units;
  const avg = latestAvg(data.weights);
  const [kind, setKind] = useState<ChangeKind[]>([initial?.changeKind ?? "taper"]);
  const [date, setDate] = useState(initial?.changeDate ?? dayKey());
  const [landing, setLandingW] = useState(Number(toDisplay(initial?.landingKg ?? avg ?? fromDisplay(180, "lb"), u).toFixed(1)));
  const [zone, setZone] = useState<("2" | "3" | "5")[]>([String(initial?.zonePct ?? 3) as "2" | "3" | "5"]);
  const [protein, setProtein] = useState(initial?.habitProtein ?? 5);
  const [strength, setStrength] = useState(initial?.habitStrength ?? 2);
  const [weighins, setWeighins] = useState(initial?.habitWeighins ?? 3);

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Landing mode</p>
          <h1>Let's land it</h1>
        </div>
      </header>
      <Panel>
        <RunwayGlyph />
        <p>
          You and your prescriber have decided to change your medication. Landed doesn't suggest doses or schedules. It watches your trend and food noise so a small
          drift gets a course correction before it becomes a regain.
        </p>
      </Panel>
      <Panel title="What's changing?">
        <Chips label="What's changing" options={CHANGES} value={kind} onChange={(v) => v.length && setKind(v)} />
        <Field label="From which date?">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </Panel>
      <Panel title="Your landing zone">
        <Field label={`Landing weight (${u})`} hint={avg ? "Starts at your current 7-day average." : "Log a few weigh-ins and this fills in."}>
          <Stepper value={landing} onChange={setLandingW} min={u === "lb" ? 70 : 30} max={u === "lb" ? 700 : 320} step={0.5} unit={u} label="landing weight" />
        </Field>
        <p className="field-label">Zone width</p>
        <Chips
          label="Zone width"
          options={[
            { id: "2", label: "±2%" },
            { id: "3", label: "±3%" },
            { id: "5", label: "±5%" },
          ]}
          value={zone}
          onChange={(v) => v.length && setZone(v)}
        />
        <p className="muted small mono">
          Zone: {(landing * (1 - Number(zone[0]) / 100)).toFixed(1)} – {(landing * (1 + Number(zone[0]) / 100)).toFixed(1)} {u}
        </p>
      </Panel>
      <Panel title="Keep-it-off habits (per week)">
        <Field label="Days hitting protein">
          <Stepper value={protein} onChange={setProtein} min={1} max={7} label="protein days" unit="days" />
        </Field>
        <Field label="Strength sessions">
          <Stepper value={strength} onChange={setStrength} min={0} max={6} label="strength sessions" />
        </Field>
        <Field label="Weigh-ins">
          <Stepper value={weighins} onChange={setWeighins} min={1} max={7} label="weigh-ins" />
        </Field>
      </Panel>
      <div className="row">
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn primary"
          onClick={() =>
            onSave({
              changeKind: kind[0],
              changeDate: date,
              landingKg: fromDisplay(landing, u),
              zonePct: Number(zone[0]),
              habitProtein: protein,
              habitStrength: strength,
              habitWeighins: weighins,
              active: true,
            })
          }
        >
          Start Landing mode
        </button>
      </div>
    </div>
  );
}

function Status({ plan, onEdit, onEnd }: { plan: LandingPlan; onEdit: () => void; onEnd: () => void }) {
  const { data } = useStore();
  const toast = useToast();
  const p = data.profile;
  const today = dayKey();
  const r = landingStatus(plan, data.weights, today);
  const week = weekStats(data, today);
  const weighins = data.weights.filter((w) => w.day > addDays(today, -7)).length;
  const sinceChange = data.checkins.filter((c) => c.day >= plan.changeDate);
  const before = data.checkins.filter((c) => c.day < plan.changeDate && c.day >= addDays(plan.changeDate, -14));
  const avgNoise = (xs: typeof sinceChange) => (xs.length ? xs.reduce((s, c) => s + c.foodNoise, 0) / xs.length : null);
  const nAfter = avgNoise(sinceChange);
  const nBefore = avgNoise(before);
  const u = p.units;
  const show = (kg: number | null) => (kg === null ? "–" : p.hideWeight ? "hidden" : `${toDisplay(kg, u).toFixed(1)} ${u}`);

  // Loudest food-noise window isn't captured by time of day in the MVP; use weekdays instead.
  const loudDay = (() => {
    const by: number[][] = Array.from({ length: 7 }, () => []);
    sinceChange.forEach((c) => by[new Date(c.day + "T12:00:00").getDay()].push(c.foodNoise));
    let best = -1;
    let bestAvg = -1;
    by.forEach((xs, i) => {
      if (xs.length >= 2) {
        const a = xs.reduce((s, x) => s + x, 0) / xs.length;
        if (a > bestAvg) {
          bestAvg = a;
          best = i;
        }
      }
    });
    return best >= 0 ? WEEKDAYS[best] : null;
  })();

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Landing mode · since {formatDay(plan.changeDate)}</p>
          <h1>Your approach</h1>
        </div>
      </header>

      <Annunciator status={r.status} caption={r.reason} />

      <Panel className={r.status === "on" ? "runway-on" : ""}>
        <FlightPathChart
          weights={data.weights}
          units={u}
          hideNumbers={p.hideWeight}
          zone={{ landingKg: plan.landingKg, lower: r.lower, upper: r.upper }}
          ticks={doseTicks(data.doses)}
          fromDay={addDays(today, -56)}
          toDay={today}
        />
        <div className="readouts">
          <div>
            <span className="inst-label">7-day avg</span>
            <span className="mono">{show(r.avg)}</span>
          </div>
          <div>
            <span className="inst-label">Zone</span>
            <span className="mono">{p.hideWeight ? "set" : `${toDisplay(r.lower, u).toFixed(0)}–${toDisplay(r.upper, u).toFixed(0)} ${u}`}</span>
          </div>
          <div>
            <span className="inst-label">This week</span>
            <span className="mono">{r.weeklyChangePct === null ? "–" : `${r.weeklyChangePct > 0 ? "+" : ""}${r.weeklyChangePct.toFixed(1)}%`}</span>
          </div>
        </div>
      </Panel>

      {r.status !== "on" && (
        <Panel title="Course correction" className="correction">
          <ol className="plan-steps">
            <li>
              <strong>Protein first at every meal this week.</strong>
              <span>You hit your target on {week.proteinDaysHit} of 7 days. Aim for {plan.habitProtein}.</span>
            </li>
            <li>
              <strong>Add one strength session.</strong>
              <span>
                {week.strength} logged this week. Muscle is what keeps your landing stable.
              </span>
            </li>
            <li>
              <strong>Plan for the loudest food-noise moments.</strong>
              <span>{loudDay ? `Food noise has been loudest on ${loudDay}s since your change. Have a protein snack ready.` : "Keep checking in so we can see when it's loudest."}</span>
            </li>
          </ol>
          <p className="notice">
            Talk to your prescriber about what you're seeing. <Link to="/report">Open your clinician report →</Link>
          </p>
        </Panel>
      )}

      <Panel title="Food noise since your change">
        <p className="big-mono">
          {nAfter === null ? "–" : nAfter.toFixed(1)}
          <small> / 4 {nBefore !== null && nAfter !== null ? `· was ${nBefore.toFixed(1)} before` : ""}</small>
        </p>
        <p className="muted small">Food noise often matters more than the scale early on. Keep the 10-second check-in going.</p>
      </Panel>

      <Panel title="Keep-it-off habits · this week">
        <div className="scoreboard">
          <Score label="Protein days" got={week.proteinDaysHit} goal={plan.habitProtein} />
          <Score label="Strength" got={week.strength} goal={plan.habitStrength} />
          <Score label="Weigh-ins" got={weighins} goal={plan.habitWeighins} />
        </div>
      </Panel>

      <div className="stack">
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            const days = ["MO", "WE", "FR"].slice(0, Math.min(3, plan.habitWeighins));
            downloadIcs("landed-weigh-ins.ics", [{ title: "Landed: weigh-in", day: today, description: "Quick weigh-in for your flight path.", rrule: `FREQ=WEEKLY;BYDAY=${days.join(",")}` }]);
            toast("Calendar file downloaded");
          }}
        >
          Add weigh-in reminders to my calendar
        </button>
        <div className="row">
          <button type="button" className="btn ghost" onClick={onEdit}>
            Edit plan
          </button>
          <button type="button" className="btn ghost" onClick={onEnd}>
            End Landing mode
          </button>
        </div>
      </div>
    </div>
  );
}

function Score({ label, got, goal }: { label: string; got: number; goal: number }) {
  const ok = got >= goal;
  return (
    <div className={ok ? "score ok" : "score"}>
      <span className="inst-label">{label}</span>
      <span className="mono">
        {got}/{goal}
      </span>
      <span className="score-bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (got / Math.max(1, goal)) * 100)}%` }} />
      </span>
    </div>
  );
}
