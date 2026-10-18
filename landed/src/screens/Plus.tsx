import { useEffect, useState } from "react";
import { track, useStore } from "../lib/store";
import { Chips } from "../components/ui";

const MONTHLY = 9.99;
const YEARLY = 49.99;
const CHECKOUT = {
  monthly: import.meta.env.VITE_CHECKOUT_URL_MONTHLY as string | undefined,
  yearly: import.meta.env.VITE_CHECKOUT_URL_YEARLY as string | undefined,
};

export default function Plus() {
  const { data, demo } = useStore();
  const [plan, setPlan] = useState<("yearly" | "monthly")[]>(["yearly"]);
  const [note, setNote] = useState<string | null>(null);
  const saving = Math.round((1 - YEARLY / (MONTHLY * 12)) * 100);
  useEffect(() => track("paywall_viewed", { trigger: "plus_page" }), []);
  const isPlus = data.profile.plan === "plus" || demo;

  return (
    <div className="screen">
      <header className="screen-head">
        <div>
          <p className="eyebrow">Landed Plus</p>
          <h1>Land it, and keep it.</h1>
        </div>
      </header>

      <p className="lede">Built with people on GLP-1s. Join the first members and help shape what comes next.</p>

      <ul className="feature-list">
        <li>
          <strong>Snap any meal, as often as you eat.</strong>
          <span>Unlimited photo protein estimates, so protecting muscle takes seconds.</span>
        </li>
        <li>
          <strong>Never wonder what to eat when you're not hungry.</strong>
          <span>“Close the gap” picks gentle, high-protein options for today's appetite.</span>
        </li>
        <li>
          <strong>Keep it off when your dose changes.</strong>
          <span>Landing mode spots a drift early and gives you a course correction.</span>
        </li>
        <li>
          <strong>Walk into appointments prepared.</strong>
          <span>Unlimited clinician reports and private share links.</span>
        </li>
      </ul>

      <Chips
        label="Billing period"
        options={[
          { id: "yearly", label: `Yearly · $${YEARLY} (save ${saving}%)` },
          { id: "monthly", label: `Monthly · $${MONTHLY}` },
        ]}
        value={plan}
        onChange={(v) => v.length && setPlan(v)}
      />
      <p className="muted small">
        {plan[0] === "yearly"
          ? `$${YEARLY} billed once a year (about $${(YEARLY / 12).toFixed(2)}/month). Renews yearly until you cancel.`
          : `$${MONTHLY} billed every month. Renews monthly until you cancel.`}
      </p>

      <div className="promise">
        <strong>Free features stay free.</strong> Logging doses, check-ins, weigh-ins, workouts and your flight path will never move behind the paywall.
      </div>

      {isPlus ? (
        <p className="notice">{demo ? "Every Plus feature is unlocked in the demo." : "You're on Landed Plus. Thank you."}</p>
      ) : (
        <button
          type="button"
          className="btn primary wide"
          onClick={() => {
            track("checkout_started", { plan: plan[0] });
            const url = CHECKOUT[plan[0]];
            if (url) window.location.href = url;
            else setNote("Checkout isn't connected yet. Connect Stripe in Bolt (test mode) to enable it.");
          }}
        >
          Start Landed Plus
        </button>
      )}
      {note && <p className="notice">{note}</p>}
      <p className="muted small center">Cancel anytime. Demo checkout uses Stripe test mode: card 4242 4242 4242 4242.</p>
    </div>
  );
}
