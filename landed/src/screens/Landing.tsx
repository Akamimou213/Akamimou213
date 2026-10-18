import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, dayKey, landingStatus } from "../lib/calc";
import { buildDemo } from "../lib/demo";
import { track, useStore } from "../lib/store";
import { Annunciator, FlightPathChart, ProteinGauge } from "../components/instruments";

export default function Landing() {
  const { data } = useStore();
  const today = dayKey();
  const demo = useMemo(() => buildDemo(today), [today]);
  const r = landingStatus(demo.landing!, demo.weights, today);
  const [g, setG] = useState(0);
  useEffect(() => {
    track("landing_view");
    const t = setTimeout(() => setG(86), 500);
    return () => clearTimeout(t);
  }, []);
  const started = data.profile.onboarded;

  return (
    <div className="landing">
      <nav className="land-nav">
        <span className="wordmark">Landed</span>
        <Link to={started ? "/today" : "/demo"} className="link">
          {started ? "Open app →" : "Try the demo"}
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">For people on GLP-1s · shots and daily pills</p>
          <h1>You lost it on the meds. Now land it.</h1>
          <p className="lede">
            Landed is the GLP-1 companion that protects your muscle while you lose, and helps you keep the weight off when your dose changes or stops.
          </p>
          <div className="row">
            <Link to="/start" className="btn primary" onClick={() => track("cta_flightplan_clicked")}>
              Build my flight plan
            </Link>
            <Link to="/demo" className="btn ghost">
              Try the demo
            </Link>
          </div>
          <p className="muted small">Free to use. No account needed to start.</p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-panel">
            <FlightPathChart
              weights={demo.weights}
              units="lb"
              zone={{ landingKg: demo.landing!.landingKg, lower: r.lower, upper: r.upper }}
              fromDay={addDays(today, -69)}
              toDay={today}
              hideNumbers
              height={190}
            />
          </div>
          <div className="hero-gauge">
            <ProteinGauge value={g} target={100} size={190} />
          </div>
        </div>
      </section>

      <section className="land-section stat">
        <p className="eyebrow">The part nobody plans for</p>
        <p className="huge-mono">≈ 2/3</p>
        <p className="lede">of lost weight was regained within a year of stopping semaglutide in the STEP 1 trial extension.</p>
        <p className="source">Wilding et al., Diabetes, Obesity and Metabolism, 2022</p>
        <p>That doesn't mean you can't keep it off. It means landing needs a plan.</p>
      </section>

      <section className="land-section">
        <h2>Three instruments. Less than a minute a day.</h2>
        <ol className="how">
          <li>
            <span className="how-n mono">01</span>
            <strong>Snap your plate</strong>
            <span>See protein against your daily target, because on these meds every meal protects muscle.</span>
          </li>
          <li>
            <span className="how-n mono">02</span>
            <strong>10-second check-in</strong>
            <span>Food noise, nausea, energy. Your own patterns show up within a few dose cycles.</span>
          </li>
          <li>
            <span className="how-n mono">03</span>
            <strong>Fly your path</strong>
            <span>Your weight trend as a flight path, descending into a landing zone you choose.</span>
          </li>
        </ol>
      </section>

      <section className="land-section split">
        <div>
          <p className="eyebrow">Landing mode</p>
          <h2>When your dose changes or stops, we watch the approach.</h2>
          <p>
            Decided with your prescriber to taper, pause, switch to a pill or stop? Set your landing zone. Landed tracks your 7-day trend and food noise, and gives you a
            course correction before a small drift becomes a regain.
          </p>
          <p className="muted small">Landed never suggests doses or schedules. Those decisions stay with your prescriber.</p>
        </div>
        <div className="ann-demo">
          <Annunciator status="on" caption="Inside your landing zone" />
          <Annunciator status="drifting" caption="Average crept up two weeks in a row" />
          <Annunciator status="correction" caption="Above your zone: 3-step plan ready" />
        </div>
      </section>

      <section className="land-section">
        <h2>Built for how people take GLP-1s now</h2>
        <p>Weekly injections and the new daily pills. Every phase: starting, losing, plateau, tapering, maintaining. Plus a one-page report to bring to your prescriber.</p>
      </section>

      <section className="land-section promise-section">
        <div className="promise">
          <strong>Logging is free forever.</strong> We'll never move a free feature behind the paywall.
        </div>
        <div className="price-row">
          <div className="price">
            <span className="inst-label">Free</span>
            <span className="mono">$0</span>
            <small>Logs, protein gauge, check-ins, flight path, 1 clinician report a month</small>
          </div>
          <div className="price plus">
            <span className="inst-label">Plus</span>
            <span className="mono">$9.99/mo</span>
            <small>or $49.99/year · unlimited photo meals, Close the gap, Landing mode, weekly reports</small>
          </div>
        </div>
      </section>

      <section className="land-section">
        <h2>Private by design</h2>
        <p>Meal photos are analyzed and never stored. No ad trackers. Your health data is never sold or used for ads.</p>
      </section>

      <section className="land-section faq">
        <h2>Questions</h2>
        <details>
          <summary>Is this medical advice?</summary>
          <p>No. Landed is a tracking and coaching companion. It never gives dose advice; medication decisions stay with your prescriber.</p>
        </details>
        <details>
          <summary>Does it work with the pills?</summary>
          <p>Yes. Choose Wegovy pill, Foundayo or “Other → daily pill” and Landed tracks a daily schedule instead of a weekly one.</p>
        </details>
        <details>
          <summary>What about compounded medication?</summary>
          <p>You can log compounded semaglutide or tirzepatide. Landed records what your prescriber set and never converts units or suggests amounts.</p>
        </details>
        <details>
          <summary>I've already stopped. Is it too late?</summary>
          <p>No. Choose “Already stopped or maintaining”, set your landing zone, and Landed will watch your trend from today.</p>
        </details>
        <details>
          <summary>Is my data safe?</summary>
          <p>Your logs stay on your device until you create an account. You can export or erase everything in Settings.</p>
        </details>
      </section>

      <section className="land-section final">
        <h2>Ready for departure?</h2>
        <div className="row center">
          <Link to="/start" className="btn primary">
            Build my flight plan
          </Link>
          <Link to="/demo" className="btn ghost">
            Try the demo
          </Link>
        </div>
      </section>

      <footer className="land-foot">
        <Link to="/safety">Safety</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <span>Made with Bolt</span>
      </footer>
    </div>
  );
}
