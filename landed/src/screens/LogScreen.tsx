import { useState } from "react";
import { dayKey, fmtWeight, formatDay, formatTime } from "../lib/calc";
import { useStore } from "../lib/store";
import { FlightStrip, type StripKind } from "../components/instruments";
import { Chips } from "../components/ui";

type Filter = "all" | StripKind;

export default function LogScreen() {
  const { data, remove } = useStore();
  const [filter, setFilter] = useState<Filter[]>(["all"]);
  const f = filter[0];
  const p = data.profile;

  type Row = { id: string; day: string; sort: string; kind: StripKind; fields: string[]; time?: string; del: () => void };
  const rows: Row[] = [
    ...data.doses.map((d) => ({ id: d.id, day: dayKey(new Date(d.at)), sort: d.at, kind: "dose" as const, fields: ["DOSE", d.medication, d.dose, d.site ?? ""].filter(Boolean), time: formatTime(d.at), del: () => remove("doses", d.id) })),
    ...data.meals.map((m) => ({ id: m.id, day: dayKey(new Date(m.at)), sort: m.at, kind: "meal" as const, fields: ["MEAL", m.title, `${m.protein} G`], time: formatTime(m.at), del: () => remove("meals", m.id) })),
    ...data.checkins.map((c) => ({ id: c.id, day: c.day, sort: `${c.day}T21`, kind: "checkin" as const, fields: ["CHECK-IN", `NOISE ${c.foodNoise}`, `NAUSEA ${c.nausea}`, `ENERGY ${c.energy}`], del: () => remove("checkins", c.id) })),
    ...data.weights.map((w) => ({ id: w.id, day: w.day, sort: `${w.day}T06`, kind: "weight" as const, fields: ["WEIGH-IN", p.hideWeight ? "logged" : fmtWeight(w.kg, p.units)], del: () => remove("weights", w.id) })),
    ...data.workouts.map((w) => ({ id: w.id, day: w.day, sort: `${w.day}T20`, kind: "workout" as const, fields: ["WORKOUT", w.kind.toUpperCase(), `${w.minutes} MIN`], del: () => remove("workouts", w.id) })),
  ]
    .filter((r) => f === "all" || r.kind === f)
    .sort((a, b) => (a.sort < b.sort ? 1 : -1));

  const [limit, setLimit] = useState(60);
  const shown = rows.slice(0, limit);
  const days: string[] = [];
  shown.forEach((r) => !days.includes(r.day) && days.push(r.day));

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Flight log</p>
          <h1>Everything you've logged</h1>
        </div>
      </header>
      <Chips
        label="Filter"
        options={[
          { id: "all", label: "All" },
          { id: "dose", label: "Doses" },
          { id: "meal", label: "Meals" },
          { id: "checkin", label: "Check-ins" },
          { id: "weight", label: "Weights" },
          { id: "workout", label: "Workouts" },
        ]}
        value={filter}
        onChange={(v) => v.length && setFilter(v)}
      />
      {days.length === 0 && <p className="muted">Nothing here yet. Tap + to log your first entry.</p>}
      {days.map((d) => (
        <section key={d} className="log-day">
          <h2 className="log-day-title">{d === dayKey() ? "Today" : formatDay(d, { weekday: "short", month: "short", day: "numeric" })}</h2>
          <div className="strips">
            {shown
              .filter((r) => r.day === d)
              .map((r) => (
                <FlightStrip key={r.kind + r.id} kind={r.kind} fields={r.fields} time={r.time} onDelete={r.del} />
              ))}
          </div>
        </section>
      ))}
      {rows.length > limit && (
        <button type="button" className="btn ghost" onClick={() => setLimit((l) => l + 60)}>
          Show more
        </button>
      )}
    </div>
  );
}
