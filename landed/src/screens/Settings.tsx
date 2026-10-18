import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fromDisplay, toDisplay, WEEKDAYS } from "../lib/calc";
import { useStore } from "../lib/store";
import type { Phase, Units } from "../lib/types";
import { PHASES } from "../components/instruments";
import { Chips, Field, Panel, Stepper, useToast } from "../components/ui";

const DIETS = ["vegetarian", "vegan", "dairy-free", "halal", "kosher", "no pork"];

export default function Settings() {
  const { data, setProfile, demo, exitDemo, resetOwn, ownData } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const p = data.profile;
  const [confirm, setConfirm] = useState("");

  function exportData() {
    const blob = new Blob([JSON.stringify(ownData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landed-data.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Your flight plan</h1>
        </div>
      </header>

      {demo && (
        <Panel>
          <p>You're flying the demo. Changes here affect demo data only.</p>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              exitDemo();
              nav(ownData.profile.onboarded ? "/today" : "/start");
            }}
          >
            Exit demo
          </button>
        </Panel>
      )}

      <Panel title="Profile">
        <Field label="Name (optional)">
          <input value={p.name} onChange={(e) => setProfile({ name: e.target.value })} maxLength={40} />
        </Field>
        <Field label="Medication">
          <input value={p.medication} onChange={(e) => setProfile({ medication: e.target.value })} />
        </Field>
        <Chips
          label="Form"
          options={[
            { id: "injection", label: "Weekly injection" },
            { id: "pill", label: "Daily pill" },
          ]}
          value={[p.medForm]}
          onChange={(v) => v.length && setProfile({ medForm: v[0] })}
        />
        {p.medForm === "injection" ? (
          <Field label="Dose day">
            <select value={p.doseWeekday} onChange={(e) => setProfile({ doseWeekday: Number(e.target.value) })}>
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Usual time">
            <input type="time" value={p.doseTime} onChange={(e) => setProfile({ doseTime: e.target.value })} />
          </Field>
        )}
        <Field label="Phase">
          <select value={p.phase} onChange={(e) => setProfile({ phase: e.target.value as Phase })}>
            {PHASES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Field>
      </Panel>

      <Panel title="Protein">
        <Field label="Daily target" hint="A starting point based on published guidance. Ask your clinician what's right for you.">
          <Stepper value={p.proteinTarget} onChange={(v) => setProfile({ proteinTarget: v })} min={60} max={200} step={5} unit="g" label="protein target" />
        </Field>
        <p className="field-label">Dietary preferences</p>
        <Chips label="Dietary preferences" multi options={DIETS.map((d) => ({ id: d, label: d }))} value={p.dietary} onChange={(v) => setProfile({ dietary: v })} />
      </Panel>

      <Panel title="Weight & display">
        <Chips
          label="Units"
          options={[
            { id: "lb", label: "lb" },
            { id: "kg", label: "kg" },
          ]}
          value={[p.units]}
          onChange={(v) => v.length && setProfile({ units: v[0] as Units })}
        />
        {p.goalKg !== null && (
          <Field label={`Goal weight (${p.units})`}>
            <Stepper value={Number(toDisplay(p.goalKg, p.units).toFixed(0))} onChange={(v) => setProfile({ goalKg: fromDisplay(v, p.units) })} min={60} max={600} label="goal weight" unit={p.units} />
          </Field>
        )}
        <label className="toggle">
          <input type="checkbox" checked={p.hideWeight} onChange={(e) => setProfile({ hideWeight: e.target.checked })} />
          <span>Hide weight numbers (show shapes only)</span>
        </label>
        <Chips
          label="Theme"
          options={[
            { id: "system", label: "System" },
            { id: "light", label: "Clear day" },
            { id: "dark", label: "Night cockpit" },
          ]}
          value={[p.theme]}
          onChange={(v) => v.length && setProfile({ theme: v[0] })}
        />
      </Panel>

      <Panel title="Your data">
        <p className="muted small">Your logs live on this device until you create an account. Meal photos are never stored.</p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={exportData}>
            Export my data
          </button>
          <Link to="/plus" className="btn ghost">
            Landed Plus
          </Link>
        </div>
        <Field label="Type DELETE to erase all your data">
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <button
          type="button"
          className="btn danger"
          disabled={confirm !== "DELETE"}
          onClick={() => {
            resetOwn();
            setConfirm("");
            toast("All your data was erased from this device");
            if (!demo) nav("/");
          }}
        >
          Erase all my data
        </button>
      </Panel>

      <nav className="footer-links">
        <Link to="/safety">Safety</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </nav>
    </div>
  );
}
