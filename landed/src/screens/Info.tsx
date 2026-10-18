import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function Page({ title, children }: { title: string; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="screen prose">
      <button type="button" className="link" onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}>
        ← Back
      </button>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function Safety() {
  return (
    <Page title="Safety">
      <p>
        Landed is a tracking and coaching companion, not medical care. It doesn't diagnose, and it never tells you what dose to take, how to change it, or when to stop.
        Always talk to your prescriber about your medication.
      </p>
      <h2>Contact your prescriber or seek urgent care if you have</h2>
      <ul>
        <li>Severe stomach pain that doesn't go away</li>
        <li>Vomiting so you can't keep fluids down</li>
        <li>Signs of dehydration, such as dizziness or very little urine</li>
        <li>Yellowing of your skin or eyes</li>
        <li>Signs of an allergic reaction, such as swelling or trouble breathing</li>
        <li>Thoughts of harming yourself</li>
      </ul>
      <p>
        If you're in the US and thinking about suicide, call or text <strong>988</strong>. In an emergency, call your local emergency number.
      </p>
      <h2>How Landed keeps eating healthy</h2>
      <p>No calorie counting, no “good” or “bad” foods, no streaks that reset. If eating enough is hard, we'll say so gently and suggest talking to your prescriber or a dietitian.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy">
      <ul>
        <li>Meal photos are compressed on your phone, sent once for a protein estimate, and never stored.</li>
        <li>Until you create an account, your logs stay on this device.</li>
        <li>No ad trackers or pixels. Your health data is never sold or used for advertising.</li>
        <li>Meal estimates are processed by an AI provider (via OpenRouter) that has its own data policies.</li>
        <li>You can export or erase your data at any time in Settings.</li>
      </ul>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms">
      <p>
        Landed provides general wellness tracking and education. It is not a medical device and doesn't provide medical advice, diagnosis or treatment. Protein estimates are
        approximations. Decisions about your medication belong to you and your prescriber. You must be 18 or older to use Landed.
      </p>
      <p>Landed Plus renews automatically at the price shown until you cancel. You can cancel anytime.</p>
    </Page>
  );
}
