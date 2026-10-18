import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { analyzeMeal, AnalysisError, aiConnected, compressImage } from "../lib/ai";
import { dayKey, fromDisplay, proteinOn, toDisplay } from "../lib/calc";
import { DEMO_MEALS } from "../lib/demo";
import { track, useStore } from "../lib/store";
import type { MealAnalysis } from "../lib/types";
import { CheckInDial, MealArt, ProteinGauge } from "../components/instruments";
import { Chips, Field, Sheet, Stepper, useToast } from "../components/ui";

export type SheetKind = "actions" | "meal" | "dose" | "checkin" | "weight" | "workout";
const SheetCtx = createContext<(k: SheetKind | null) => void>(() => {});
export const useSheets = () => useContext(SheetCtx);

export function SheetsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<SheetKind | null>(null);
  const close = () => setOpen(null);
  return (
    <SheetCtx.Provider value={setOpen}>
      {children}
      {open === "actions" && <ActionSheet onPick={setOpen} onClose={close} />}
      {open === "meal" && <MealSheet onClose={close} />}
      {open === "dose" && <DoseSheet onClose={close} />}
      {open === "checkin" && <CheckinSheet onClose={close} />}
      {open === "weight" && <WeightSheet onClose={close} />}
      {open === "workout" && <WorkoutSheet onClose={close} />}
    </SheetCtx.Provider>
  );
}

function ActionSheet({ onPick, onClose }: { onPick: (k: SheetKind) => void; onClose: () => void }) {
  const items: { k: SheetKind; label: string; sub: string }[] = [
    { k: "meal", label: "Snap a meal", sub: "Protein from a photo or a few words" },
    { k: "dose", label: "Log dose", sub: "Shot or pill, one tap" },
    { k: "checkin", label: "Check in", sub: "Food noise, nausea, energy · 10 sec" },
    { k: "weight", label: "Weigh-in", sub: "Feeds your flight path" },
    { k: "workout", label: "Workout", sub: "Strength protects muscle" },
  ];
  return (
    <Sheet title="Log" onClose={onClose}>
      <ul className="action-list">
        {items.map((i) => (
          <li key={i.k}>
            <button type="button" className={`action action-${i.k}`} onClick={() => onPick(i.k)}>
              <span className="action-band" aria-hidden="true" />
              <span>
                <strong>{i.label}</strong>
                <small>{i.sub}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

// ---------- Meal ----------
const STEPS = ["Spotting what's on the plate…", "Estimating portions…", "Counting protein…"];

function MealSheet({ onClose }: { onClose: () => void }) {
  const { data, addMeal, remove, demo } = useStore();
  const toast = useToast();
  const today = dayKey();
  const eaten = proteinOn(data.meals, today);
  const left = Math.max(0, data.profile.proteinTarget - eaten);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"pick" | "describe" | "working" | "result">("pick");
  const [text, setText] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [grams, setGrams] = useState(0);
  const [source, setSource] = useState<"photo" | "text" | "demo">("text");
  const [demoTag, setDemoTag] = useState(false);

  async function run(input: { imageDataUrl?: string; description?: string }, fallback?: MealAnalysis) {
    setMode("working");
    setError(null);
    setStep(0);
    const iv = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 900);
    const started = performance.now();
    track("meal_capture_started", { method: input.imageDataUrl ? "photo" : fallback ? "demo" : "text" });
    try {
      if (fallback && !aiConnected) throw new Error("demo-offline");
      const r = await analyzeMeal({ ...input, proteinLeftG: left });
      setResult(r);
      setGrams(r.proteinEstimateG);
      setDemoTag(false);
      setMode("result");
      track("meal_analyzed", { ms: Math.round(performance.now() - started) });
    } catch (e) {
      if (fallback) {
        setResult(fallback);
        setGrams(fallback.proteinEstimateG);
        setDemoTag(true);
        setMode("result");
      } else {
        setError(e instanceof AnalysisError ? e.message : "Something went wrong. Describe it instead?");
        setMode(input.imageDataUrl ? "pick" : "describe");
        track("meal_analysis_failed", { reason: e instanceof AnalysisError ? e.kind : "unknown" });
      }
    } finally {
      clearInterval(iv);
    }
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setSource("photo");
    try {
      const url = await compressImage(f);
      if (url.length > 2_800_000) {
        setError("That photo is too large. Try again a little further away.");
        return;
      }
      await run({ imageDataUrl: url });
    } catch {
      setError("We couldn't read that image. Try another photo or describe it.");
    }
  }

  function log() {
    if (!result) return;
    const id = addMeal({ at: new Date().toISOString(), title: result.title, protein: grams, low: result.proteinLowG, high: result.proteinHighG, source });
    track("meal_logged", { source });
    onClose();
    toast(`Logged ${grams}g of protein`, () => remove("meals", id));
  }

  return (
    <Sheet title="Snap a meal" onClose={onClose}>
      {mode === "pick" && (
        <div className="stack">
          {error && <p className="notice">{error}</p>}
          <div className="capture-grid">
            <button type="button" className="capture" onClick={() => fileRef.current?.click()}>
              <CameraGlyph />
              <strong>Take a photo</strong>
              <small>{aiConnected ? "We'll estimate the protein" : "Needs the AI connection"}</small>
            </button>
            <button type="button" className="capture" onClick={() => { setMode("describe"); setError(null); }}>
              <PenGlyph />
              <strong>Describe it</strong>
              <small>“2 eggs, toast, latte”</small>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <div>
            <p className="eyebrow">{demo ? "Demo meals" : "Or try a sample plate"}</p>
            <div className="demo-meals">
              {DEMO_MEALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="demo-meal"
                  onClick={() => {
                    setSource("demo");
                    run({ description: m.description }, m.analysis);
                  }}
                >
                  <MealArt kind={m.art} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "describe" && (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().length < 3) return;
            setSource("text");
            run({ description: text.trim() });
          }}
        >
          {error && <p className="notice">{error}</p>}
          <Field label="What did you eat?" hint="Amounts help: “4 oz chicken, 1 cup rice, broccoli”">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} autoFocus placeholder="2 eggs, toast, coffee with milk" />
          </Field>
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => setMode("pick")}>
              Back
            </button>
            <button type="submit" className="btn primary" disabled={text.trim().length < 3}>
              Estimate protein
            </button>
          </div>
        </form>
      )}

      {mode === "working" && (
        <ol className="progress-steps" aria-live="polite">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? "done" : i === step ? "now" : ""}>
              {s}
            </li>
          ))}
        </ol>
      )}

      {mode === "result" && result && (
        <div className="stack">
          <div className="result-head">
            <h3>{result.title}</h3>
            {demoTag && <span className="tag">Demo estimate</span>}
          </div>
          <p className="big-mono">
            ≈ {result.proteinEstimateG}g <small>({result.proteinLowG}–{result.proteinHighG}g)</small>
          </p>
          <ul className="items">
            {result.items.map((i) => (
              <li key={i.name + i.portion}>
                <span>
                  {i.name} <small>· {i.portion}</small>
                </span>
                <span className="mono">{i.proteinG}g</span>
                <span className={`conf conf-${i.confidence}`} title={`${i.confidence} confidence`} aria-label={`${i.confidence} confidence`} />
              </li>
            ))}
          </ul>
          <ProteinGauge value={eaten} preview={grams} target={data.profile.proteinTarget} size={200} />
          {result.boost.filter((b) => b.extraProteinG > 0).length > 0 && (
            <div>
              <p className="eyebrow">Boost it</p>
              <div className="chips">
                {result.boost
                  .filter((b) => b.extraProteinG > 0)
                  .map((b) => (
                    <button key={b.idea} type="button" className="chip" onClick={() => setGrams((g) => Math.min(250, g + b.extraProteinG))}>
                      {b.idea} <span className="mono">+{b.extraProteinG}g</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {result.note && <p className="muted">{result.note}</p>}
          <Field label="Protein to log">
            <Stepper value={grams} onChange={setGrams} min={0} max={250} label="protein grams" unit="g" />
          </Field>
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => setMode("pick")}>
              Retake
            </button>
            <button type="button" className="btn primary" onClick={log}>
              Log it
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ---------- Dose ----------
const SITES = ["Abdomen L", "Abdomen R", "Thigh L", "Thigh R", "Arm L", "Arm R"];
function DoseSheet({ onClose }: { onClose: () => void }) {
  const { data, addDose, remove } = useStore();
  const toast = useToast();
  const p = data.profile;
  const last = [...data.doses].sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  const [med, setMed] = useState(p.medication || last?.medication || "");
  const [dose, setDose] = useState(last?.dose || p.currentDose || "");
  const [site, setSite] = useState<string[]>([]);
  const [note, setNote] = useState("");
  return (
    <Sheet title="Log dose" onClose={onClose}>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          const id = addDose({ at: new Date().toISOString(), medication: med, dose, site: p.medForm === "injection" ? site[0] : undefined, note: note || undefined });
          track("dose_logged", { form: p.medForm });
          onClose();
          toast("Dose logged. Cleared for the week.", () => remove("doses", id));
        }}
      >
        <Field label="Medication">
          <input value={med} onChange={(e) => setMed(e.target.value)} placeholder="e.g. Zepbound" required />
        </Field>
        <Field label="Dose" hint="Record what your prescriber set. Landed never suggests doses.">
          <input className="mono" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 5 mg" />
        </Field>
        {p.medForm === "injection" && (
          <div>
            <p className="field-label">
              Injection site {last?.site && <small className="muted">· Last: {last.site}</small>}
            </p>
            <Chips label="Injection site" options={SITES.map((s) => ({ id: s, label: s }))} value={site} onChange={setSite} />
          </div>
        )}
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} />
        </Field>
        <button type="submit" className="btn primary">
          Log {p.medForm === "pill" ? "pill" : "shot"}
        </button>
      </form>
    </Sheet>
  );
}

// ---------- Check-in ----------
export function CheckinForm({ onDone }: { onDone?: () => void }) {
  const { data, saveCheckin } = useStore();
  const today = dayKey();
  const existing = data.checkins.find((c) => c.day === today);
  const [noise, setNoise] = useState<number | null>(existing?.foodNoise ?? null);
  const [nausea, setNausea] = useState<number | null>(existing?.nausea ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy ?? null);
  const ready = noise !== null && nausea !== null && energy !== null;
  return (
    <div className="stack">
      <CheckInDial label="Food noise" low="quiet" high="loud" value={noise} onChange={setNoise} />
      <CheckInDial label="Nausea" low="none" high="severe" value={nausea} onChange={setNausea} />
      <CheckInDial label="Energy" low="drained" high="great" value={energy} onChange={setEnergy} />
      <button
        type="button"
        className="btn primary"
        disabled={!ready}
        onClick={() => {
          saveCheckin({ day: today, foodNoise: noise!, nausea: nausea!, energy: energy! });
          track("checkin_logged");
          onDone?.();
        }}
      >
        {existing ? "Update check-in" : "Save check-in"}
      </button>
    </div>
  );
}

function CheckinSheet({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  return (
    <Sheet title="Check in" onClose={onClose}>
      <CheckinForm
        onDone={() => {
          onClose();
          toast("Check-in saved");
        }}
      />
    </Sheet>
  );
}

// ---------- Weight ----------
function WeightSheet({ onClose }: { onClose: () => void }) {
  const { data, saveWeight } = useStore();
  const toast = useToast();
  const u = data.profile.units;
  const last = [...data.weights].sort((a, b) => (a.day < b.day ? 1 : -1))[0];
  const [val, setVal] = useState(last ? Number(toDisplay(last.kg, u).toFixed(1)) : u === "lb" ? 180 : 80);
  const [day, setDay] = useState(dayKey());
  return (
    <Sheet title="Weigh-in" onClose={onClose}>
      <div className="stack">
        <Field label={`Weight (${u})`}>
          <Stepper value={val} onChange={setVal} min={u === "lb" ? 70 : 30} max={u === "lb" ? 700 : 320} step={0.1} unit={u} label="weight" />
        </Field>
        <Field label="Date">
          <input type="date" value={day} max={dayKey()} onChange={(e) => setDay(e.target.value)} />
        </Field>
        <p className="muted small">Daily weight jumps around. Your flight path uses a 7-day average, so one high morning won't throw it off.</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            saveWeight({ day, kg: fromDisplay(val, u) });
            track("weight_logged");
            onClose();
            toast("Weigh-in saved");
          }}
        >
          Save
        </button>
      </div>
    </Sheet>
  );
}

// ---------- Workout ----------
function WorkoutSheet({ onClose }: { onClose: () => void }) {
  const { addWorkout, remove } = useStore();
  const toast = useToast();
  const [kind, setKind] = useState<("strength" | "cardio" | "walk")[]>(["strength"]);
  const [mins, setMins] = useState(30);
  return (
    <Sheet title="Workout" onClose={onClose}>
      <div className="stack">
        <Chips
          label="Workout type"
          options={[
            { id: "strength", label: "Strength" },
            { id: "cardio", label: "Cardio" },
            { id: "walk", label: "Walk" },
          ]}
          value={kind}
          onChange={(v) => v.length && setKind(v)}
        />
        <Field label="Minutes">
          <Stepper value={mins} onChange={setMins} min={5} max={240} step={5} unit="min" label="minutes" />
        </Field>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            const id = addWorkout({ day: dayKey(), kind: kind[0], minutes: mins });
            track("workout_logged", { kind: kind[0] });
            onClose();
            toast(kind[0] === "strength" ? "Strength logged. That's muscle protected." : "Workout logged", () => remove("workouts", id));
          }}
        >
          Save
        </button>
      </div>
    </Sheet>
  );
}

function CameraGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="glyph" aria-hidden="true">
      <rect x="6" y="14" width="36" height="26" rx="4" />
      <path d="M17 14 l3 -5 h8 l3 5" />
      <circle cx="24" cy="27" r="7" />
    </svg>
  );
}
function PenGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="glyph" aria-hidden="true">
      <path d="M10 38 l4 -12 l18 -18 l8 8 l-18 18 z" />
      <path d="M28 12 l8 8" />
    </svg>
  );
}
