import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dayKey, fromDisplay, WEEKDAYS } from "../lib/calc";
import { track, useStore } from "../lib/store";
import type { MedForm, Phase, Units } from "../lib/types";
import { PHASES, PhaseIndicator, RunwayGlyph } from "../components/instruments";
import { Chips, Field, Stepper } from "../components/ui";

const MEDS: { id: string; form: MedForm | null }[] = [
  { id: "Zepbound", form: "injection" },
  { id: "Mounjaro", form: "injection" },
  { id: "Wegovy (injection)", form: "injection" },
  { id: "Wegovy pill", form: "pill" },
  { id: "Ozempic", form: "injection" },
  { id: "Foundayo", form: "pill" },
  { id: "Compounded semaglutide", form: "injection" },
  { id: "Compounded tirzepatide", form: "injection" },
  { id: "Other", form: null },
];

const WORRIES = [
  { id: "muscle", label: "Losing muscle" },
  { id: "side-effects", label: "Side effects" },
  { id: "plateau", label: "Plateaus" },
  { id: "regain", label: "Regaining after I stop" },
  { id: "cost", label: "Cost" },
];

const TOTAL = 12;

export default function Onboarding() {
  const { setProfile, saveWeight, data, demo, exitDemo } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [adult, setAdult] = useState<boolean | null>(null);
  const [med, setMed] = useState<string[]>([]);
  const [form, setForm] = useState<MedForm>("injection");
  const [weekday, setWeekday] = useState(new Date().getDay());
  const [time, setTime] = useState("08:00");
  const [dose, setDose] = useState("");
  const [phase, setPhase] = useState<Phase[]>([]);
  const [units, setUnits] = useState<Units[]>(["lb"]);
  const [start, setStart] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [strength, setStrength] = useState<string[]>([]);
  const [worries, setWorries] = useState<string[]>([]);
  const [target, setTarget] = useState(100);

  useEffect(() => {
    if (demo) exitDemo();
    track("onboarding_step", { step: 0 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = MEDS.find((x) => x.id === med[0]);
    if (m?.form) setForm(m.form);
  }, [med]);

  useEffect(() => {
    if (goal) {
      const kg = fromDisplay(goal, units[0]);
      setTarget(Math.min(200, Math.max(60, Math.round((kg * 1.2) / 5) * 5)));
    }
  }, [goal, units]);

  const go = (n: number) => {
    setStep(n);
    track("onboarding_step", { step: n });
    window.scrollTo(0, 0);
  };
  const next = () => go(Math.min(TOTAL - 1, step + 1));
  const skip = () => {
    track("onboarding_skipped", { step });
    next();
  };

  function finish(toDemo: boolean) {
    const u = units[0];
    setProfile({
      adult: true,
      medication: med[0] === "Other" || !med[0] ? data.profile.medication : med[0],
      medForm: form,
      doseWeekday: weekday,
      doseTime: time,
      currentDose: dose,
      phase: phase[0] ?? "cruise",
      units: u,
      startKg: start ? fromDisplay(start, u) : null,
      goalKg: goal ? fromDisplay(goal, u) : null,
      strength: strength[0] ?? "",
      worries,
      proteinTarget: target,
      onboarded: true,
    });
    if (current) saveWeight({ day: dayKey(), kg: fromDisplay(current, u) });
    track("onboarding_completed", { phase: phase[0] ?? "none", med_form: form });
    nav(toDemo ? "/demo" : "/today?snap=1");
  }

  const u = units[0];
  const wMin = u === "lb" ? 80 : 35;
  const wMax = u === "lb" ? 700 : 320;
  const reflection = worries.includes("regain")
    ? {
        big: "≈ 2/3",
        text: "In the STEP 1 trial extension, people regained about two-thirds of the weight they'd lost within a year of stopping semaglutide. That's why landing needs a plan before you need it.",
        src: "Wilding et al., Diabetes, Obesity and Metabolism, 2022",
      }
    : worries.includes("muscle")
      ? {
          big: "1.2–1.6 g/kg",
          text: "The protein RDA is 0.8 g per kg of body weight. Higher intakes of 1.2–1.6 g/kg have been proposed for people losing weight on these medications. Ask your clinician what's right for you.",
          src: "Joint nutrition advisory, American Journal of Clinical Nutrition, 2025",
        }
      : {
          big: "1 in 8",
          text: "About 12% of US adults say they currently take a GLP-1. You're far from alone, and the people who do best plan for every phase, including the landing.",
          src: "KFF poll, November 2025",
        };

  let body: JSX.Element;
  switch (step) {
    case 0:
      body = (
        <>
          <RunwayGlyph />
          <h1>Let's file your flight plan.</h1>
          <p className="lede">Two minutes. Every question is skippable. Landed never asks for a medical record.</p>
          <button type="button" className="btn primary wide" onClick={next}>
            Start
          </button>
          <button type="button" className="btn ghost wide" onClick={() => nav("/demo")}>
            Just show me the demo
          </button>
        </>
      );
      break;
    case 1:
      body = (
        <>
          <h1>Are you 18 or older?</h1>
          <div className="choices">
            <button type="button" className={adult === true ? "choice on" : "choice"} onClick={() => { setAdult(true); next(); }}>
              Yes
            </button>
            <button type="button" className={adult === false ? "choice on" : "choice"} onClick={() => setAdult(false)}>
              No
            </button>
          </div>
          {adult === false && (
            <p className="notice">
              Landed is built for adults. If you're taking a GLP-1, your care team is the best place for support. <Link to="/safety">Safety info</Link>
            </p>
          )}
        </>
      );
      break;
    case 2:
      body = (
        <>
          <h1>What are you taking?</h1>
          <div className="choices scroll">
            {MEDS.map((m) => (
              <button key={m.id} type="button" className={med[0] === m.id ? "choice on" : "choice"} onClick={() => { setMed([m.id]); if (m.form) setTimeout(next, 120); }}>
                {m.id}
              </button>
            ))}
          </div>
          {med[0] === "Other" && (
            <>
              <p className="field-label">How do you take it?</p>
              <Chips
                label="How do you take it"
                options={[
                  { id: "injection", label: "Weekly injection" },
                  { id: "pill", label: "Daily pill" },
                ]}
                value={[form]}
                onChange={(v) => v.length && setForm(v[0])}
              />
              <button type="button" className="btn primary wide" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
      break;
    case 3:
      body =
        form === "injection" ? (
          <>
            <h1>Which day is your dose day?</h1>
            <div className="choices grid7">
              {WEEKDAYS.map((d, i) => (
                <button key={d} type="button" className={weekday === i ? "choice on" : "choice"} onClick={() => { setWeekday(i); setTimeout(next, 120); }}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1>When do you usually take your pill?</h1>
            <Field label="Usual time">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <button type="button" className="btn primary wide" onClick={next}>
              Continue
            </button>
          </>
        );
      break;
    case 4:
      body = (
        <>
          <h1>What's your current dose?</h1>
          <Field label="Dose" hint="We only record what your prescriber set. Landed never suggests doses.">
            <input className="mono big-input" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 5 mg" maxLength={20} />
          </Field>
          <button type="button" className="btn primary wide" onClick={next}>
            Continue
          </button>
        </>
      );
      break;
    case 5:
      body = (
        <>
          <h1>Where are you in your journey?</h1>
          <div className="choices">
            {(
              [
                ["takeoff", "Just started"],
                ["cruise", "Losing steadily"],
                ["holding", "Stuck on a plateau"],
                ["descent", "Tapering, pausing or stopping with my prescriber"],
                ["landed", "Already stopped or maintaining"],
              ] as [Phase, string][]
            ).map(([id, label]) => (
              <button key={id} type="button" className={phase[0] === id ? "choice on" : "choice"} onClick={() => { setPhase([id]); setTimeout(next, 120); }}>
                <span>{label}</span>
                <small className="mono">{PHASES.find((p) => p.id === id)!.label.toUpperCase()}</small>
              </button>
            ))}
          </div>
        </>
      );
      break;
    case 6:
      body = (
        <>
          <h1>Your numbers</h1>
          <p className="muted">All optional. Without them, weight features stay hidden.</p>
          <Chips label="Units" options={[{ id: "lb", label: "lb" }, { id: "kg", label: "kg" }]} value={units} onChange={(v) => v.length && setUnits(v as Units[])} />
          {(
            [
              ["Starting weight", start, setStart, u === "lb" ? 220 : 100],
              ["Current weight", current, setCurrent, u === "lb" ? 200 : 90],
              ["Goal weight", goal, setGoal, u === "lb" ? 180 : 82],
            ] as [string, number | null, (v: number | null) => void, number][]
          ).map(([label, val, set, def]) => (
            <Field key={label} label={label}>
              {val === null ? (
                <button type="button" className="btn ghost" onClick={() => set(def)}>
                  Add {label.toLowerCase()}
                </button>
              ) : (
                <div className="row">
                  <Stepper value={val} onChange={set} min={wMin} max={wMax} step={1} unit={u} label={label} />
                  <button type="button" className="link" onClick={() => set(null)}>
                    Prefer not to say
                  </button>
                </div>
              )}
            </Field>
          ))}
          <button type="button" className="btn primary wide" onClick={next}>
            Continue
          </button>
        </>
      );
      break;
    case 7:
      body = (
        <>
          <h1>How often do you do strength training?</h1>
          <div className="choices">
            {["Never", "1× a week", "2× a week", "3+ a week"].map((s) => (
              <button key={s} type="button" className={strength[0] === s ? "choice on" : "choice"} onClick={() => { setStrength([s]); setTimeout(next, 120); }}>
                {s}
              </button>
            ))}
          </div>
          <p className="muted small">Strength work is one of the best ways to keep muscle while you lose.</p>
        </>
      );
      break;
    case 8:
      body = (
        <>
          <h1>What worries you most?</h1>
          <p className="muted">Pick any.</p>
          <Chips label="Worries" multi options={WORRIES} value={worries} onChange={setWorries} />
          <button type="button" className="btn primary wide" onClick={next}>
            Continue
          </button>
        </>
      );
      break;
    case 9:
      body = (
        <>
          <p className="eyebrow">{worries.length ? "You're right to think about this" : "Good to know"}</p>
          <p className="huge-mono">{reflection.big}</p>
          <p className="lede">{reflection.text}</p>
          <p className="source">Source: {reflection.src}</p>
          <button type="button" className="btn primary wide" onClick={next}>
            Build my plan
          </button>
        </>
      );
      break;
    case 10:
      body = (
        <>
          <h1>Your daily protein target</h1>
          <Stepper value={target} onChange={setTarget} min={60} max={200} step={5} unit="g" label="protein target" />
          <p className="muted">
            {goal ? `1.2 g per kg of your goal weight, rounded.` : "A common starting point."} A starting point based on published guidance. Ask your clinician what's right for you.
          </p>
          <button type="button" className="btn primary wide" onClick={next}>
            Continue
          </button>
        </>
      );
      break;
    default:
      body = (
        <>
          <p className="eyebrow">Flight plan filed</p>
          <h1>Ready for departure.</h1>
          <div className="plan-card">
            <div>
              <span className="inst-label">Medication</span>
              <span>{med[0] && med[0] !== "Other" ? med[0] : "Your GLP-1"} · {form === "pill" ? `daily, ${time}` : `${WEEKDAYS[weekday]}s`}</span>
            </div>
            <div>
              <span className="inst-label">Protein target</span>
              <span className="mono">{target} g / day</span>
            </div>
            <div>
              <span className="inst-label">Focus</span>
              <span>{worries.includes("regain") ? "A plan for landing" : worries.includes("muscle") ? "Protecting muscle" : worries.includes("side-effects") ? "Spotting side-effect patterns" : "Steady progress"}</span>
            </div>
            <PhaseIndicator phase={phase[0] ?? "cruise"} />
          </div>
          <button type="button" className="btn primary wide" onClick={() => finish(false)}>
            Snap my first meal
          </button>
          <button type="button" className="btn ghost wide" onClick={() => finish(true)}>
            Explore with demo data first
          </button>
        </>
      );
  }

  return (
    <div className="onboarding">
      {step > 0 && (
        <div className="ob-top">
          <button type="button" className="link" onClick={() => go(step - 1)} aria-label="Back">
            ← Back
          </button>
          <div className="ob-progress" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL - 1} aria-valuenow={step}>
            <span style={{ width: `${(step / (TOTAL - 1)) * 100}%` }} />
          </div>
          {step < TOTAL - 1 && step !== 1 ? (
            <button type="button" className="link" onClick={skip}>
              Skip
            </button>
          ) : (
            <span className="ob-spacer" />
          )}
        </div>
      )}
      <div className="ob-body" key={step}>
        {body}
      </div>
    </div>
  );
}
