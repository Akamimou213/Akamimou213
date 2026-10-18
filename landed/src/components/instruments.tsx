import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { diffDays, formatDay, toDisplay, trend, type TrendPoint } from "../lib/calc";
import type { LandingStatus, Phase, Units, Weight } from "../lib/types";

// ---------- geometry helpers ----------
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => ({ x: cx + r * Math.sin(rad(deg)), y: cy - r * Math.cos(rad(deg)) });
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const s = pt(cx, cy, r, a0);
  const e = pt(cx, cy, r, a1);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
}

// ---------- ProteinGauge ----------
export function ProteinGauge({ value, target, size = 260, preview }: { value: number; target: number; size?: number; preview?: number }) {
  const max = Math.max(50, Math.ceil((Math.max(target * 1.25, value + (preview ?? 0)) + 1) / 10) * 10);
  const A0 = -125;
  const A1 = 125;
  const ang = (v: number) => A0 + ((A1 - A0) * Math.min(v, max)) / max;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(t);
  }, [value]);

  const cx = 130;
  const cy = 130;
  const ticks: ReactNode[] = [];
  for (let v = 0; v <= max; v += 10) {
    const major = v % 50 === 0;
    const a = pt(cx, cy, 112, ang(v));
    const b = pt(cx, cy, major ? 98 : 104, ang(v));
    ticks.push(<line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={major ? "tick tick-major" : "tick"} />);
    if (major) {
      const l = pt(cx, cy, 86, ang(v));
      ticks.push(
        <text key={`l${v}`} x={l.x} y={l.y + 4} className="tick-label" textAnchor="middle">
          {v}
        </text>,
      );
    }
  }
  const t0 = pt(cx, cy, 118, ang(target));
  const t1 = pt(cx, cy, 94, ang(target));
  const left = Math.max(0, target - value);
  const reached = value >= target;

  return (
    <figure className="gauge" style={{ maxWidth: size }} aria-label={`Protein today: ${value} of ${target} grams`}>
      <svg viewBox="0 0 260 258" role="img">
        <circle cx={cx} cy={cy} r={124} className="gauge-bezel" />
        <path d={arc(cx, cy, 112, A0, A1)} className="gauge-track" />
        {value > 0 && <path d={arc(cx, cy, 112, A0, Math.max(A0 + 0.5, ang(value)))} className={reached ? "gauge-fill on" : "gauge-fill"} />}
        {preview ? <path d={arc(cx, cy, 112, ang(value), Math.max(ang(value) + 0.5, ang(value + preview)))} className="gauge-preview" /> : null}
        {ticks}
        <line x1={t0.x} y1={t0.y} x2={t1.x} y2={t1.y} className="gauge-target" />
        <g className="needle" style={{ transform: `rotate(${ang(shown)}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <line x1={cx} y1={cy + 14} x2={cx} y2={cy - 100} />
        </g>
        <circle cx={cx} cy={cy} r={7} className="gauge-hub" />
        <text x={cx} y={cy + 52} textAnchor="middle" className="gauge-readout">
          {value}
          <tspan className="gauge-of"> / {target} g</tspan>
        </text>
        <text x={cx} y={cy + 76} textAnchor="middle" className="gauge-sub">
          {preview ? `AFTER THIS MEAL: ${value + preview}G` : reached ? "TARGET REACHED" : `${left}G TO GO`}
        </text>
        <text x={cx} y={cy - 34} textAnchor="middle" className="gauge-name">
          PROTEIN
        </text>
      </svg>
    </figure>
  );
}

// ---------- FlightPathChart ----------
function smooth(points: { x: number; y: number }[]): string {
  if (points.length < 2) return points.length ? `M ${points[0].x} ${points[0].y}` : "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export interface Zone {
  landingKg: number;
  lower: number;
  upper: number;
}

export function FlightPathChart({
  weights,
  units,
  hideNumbers,
  zone,
  ticks = [],
  fromDay,
  toDay,
  height = 210,
  animate = true,
}: {
  weights: Weight[];
  units: Units;
  hideNumbers?: boolean;
  zone?: Zone | null;
  ticks?: { day: string; label: string }[];
  fromDay: string;
  toDay: string;
  height?: number;
  animate?: boolean;
}) {
  const clipId = useId();
  const W = 340;
  const H = height;
  const padL = hideNumbers ? 10 : 38;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const pts: TrendPoint[] = useMemo(() => trend(weights).filter((p) => p.day >= fromDay && p.day <= toDay), [weights, fromDay, toDay]);

  if (pts.length < 2) {
    return (
      <div className="chart-empty">
        <RunwayGlyph />
        <p>Log two or more weigh-ins to see your flight path.</p>
      </div>
    );
  }

  const span = Math.max(1, diffDays(fromDay, toDay));
  const x = (day: string) => padL + ((W - padL - padR) * diffDays(fromDay, day)) / span;
  const vals = pts.flatMap((p) => [p.kg, p.avg]).map((v) => toDisplay(v, units));
  if (zone) vals.push(toDisplay(zone.lower, units), toDisplay(zone.upper, units));
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = Math.max(1, (hi - lo) * 0.12);
  lo -= pad;
  hi += pad;
  const y = (kg: number) => padT + ((H - padT - padB) * (hi - toDisplay(kg, units))) / (hi - lo);

  const line = smooth(pts.map((p) => ({ x: x(p.day), y: y(p.avg) })));
  const last = pts[pts.length - 1];
  const gridVals = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * (i + 0.5)) / 4);

  let runway: ReactNode = null;
  if (zone) {
    const yU = y(zone.upper);
    const yL = y(zone.lower);
    const yC = y(zone.landingKg);
    const lights: ReactNode[] = [];
    for (let lx = padL + 6; lx < W - padR; lx += 16) {
      lights.push(<circle key={`u${lx}`} cx={lx} cy={yU} r={1.8} className="runway-light" style={{ animationDelay: `${(lx - padL) * 6}ms` }} />);
      lights.push(<circle key={`l${lx}`} cx={lx} cy={yL} r={1.8} className="runway-light" style={{ animationDelay: `${(lx - padL) * 6}ms` }} />);
    }
    runway = (
      <g>
        <rect x={padL} y={yU} width={W - padL - padR} height={Math.max(2, yL - yU)} className="runway" />
        <line x1={padL} x2={W - padR} y1={yC} y2={yC} className="runway-center" />
        {lights}
        <text x={W - padR - 2} y={yU - 4} textAnchor="end" className="chart-label amber">
          LANDING ZONE
        </text>
      </g>
    );
  }

  return (
    <svg className={animate ? "flightpath animate" : "flightpath"} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weight trend drawn as a flight path">
      <defs>
        <clipPath id={clipId}>
          <rect x={padL} y={0} width={W - padL - padR} height={H} />
        </clipPath>
      </defs>
      {gridVals.map((v) => {
        const yy = padT + ((H - padT - padB) * (hi - v)) / (hi - lo);
        return (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} className="grid" />
            {!hideNumbers && (
              <text x={padL - 6} y={yy + 3} textAnchor="end" className="chart-label">
                {Math.round(v)}
              </text>
            )}
          </g>
        );
      })}
      {runway}
      <g clipPath={`url(#${clipId})`}>
        {pts.map((p) => (
          <circle key={p.day} cx={x(p.day)} cy={y(p.kg)} r={2.2} className="raw-dot" />
        ))}
        <path d={line} className="path-line" />
      </g>
      {ticks
        .filter((t) => t.day >= fromDay && t.day <= toDay)
        .map((t) => (
          <g key={t.day + t.label}>
            <line x1={x(t.day)} x2={x(t.day)} y1={H - padB} y2={H - padB + 6} className="dose-tick" />
            <text x={x(t.day)} y={H - 6} textAnchor="middle" className="chart-label">
              {t.label}
            </text>
          </g>
        ))}
      <circle cx={x(last.day)} cy={y(last.avg)} r={8} className="you-ring" />
      <circle cx={x(last.day)} cy={y(last.avg)} r={3.5} className="you-dot" />
      <text x={padL} y={H - 6} className="chart-label">
        {formatDay(fromDay)}
      </text>
    </svg>
  );
}

export function RunwayGlyph() {
  return (
    <svg viewBox="0 0 120 60" className="runway-glyph" aria-hidden="true">
      <path d="M8 10 C 40 14, 64 34, 108 40" className="glyph-path" />
      <rect x="14" y="44" width="96" height="8" rx="1.5" className="glyph-runway" />
      {[20, 34, 48, 62, 76, 90, 104].map((x) => (
        <circle key={x} cx={x} cy="48" r="1.6" className="runway-light static" />
      ))}
    </svg>
  );
}

// ---------- PhaseIndicator ----------
export const PHASES: { id: Phase; label: string; blurb: string }[] = [
  { id: "takeoff", label: "Takeoff", blurb: "Starting out and adjusting to the medication." },
  { id: "cruise", label: "Cruise", blurb: "Losing steadily. Protect your muscle while you go." },
  { id: "holding", label: "Holding", blurb: "A plateau. Normal, and a good time to check protein and strength." },
  { id: "descent", label: "Descent", blurb: "Tapering, pausing or switching with your prescriber. Watch the trend closely." },
  { id: "landed", label: "Landed", blurb: "Maintaining. Your habits do the work now." },
];

export function PhaseIndicator({ phase, compact }: { phase: Phase; compact?: boolean }) {
  const idx = PHASES.findIndex((p) => p.id === phase);
  return (
    <ol className={compact ? "phases compact" : "phases"} aria-label={`Phase: ${PHASES[idx]?.label}`}>
      {PHASES.map((p, i) => (
        <li key={p.id} className={i < idx ? "past" : i === idx ? "current" : "future"}>
          <span className="wp" aria-hidden="true" />
          {!compact || i === idx ? <span className="wp-label">{p.label}</span> : null}
        </li>
      ))}
    </ol>
  );
}

// ---------- CheckInDial ----------
export function CheckInDial({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <fieldset className="dial">
      <legend>{label}</legend>
      <div className="dial-seg" role="radiogroup" aria-label={label}>
        {[0, 1, 2, 3, 4].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            className={value === v ? "seg on" : "seg"}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="dial-ends">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </fieldset>
  );
}

// ---------- FlightStrip ----------
export type StripKind = "dose" | "meal" | "checkin" | "weight" | "workout";
export function FlightStrip({ kind, fields, time, onDelete }: { kind: StripKind; fields: string[]; time?: string; onDelete?: () => void }) {
  return (
    <div className={`strip strip-${kind}`}>
      <span className="strip-band" aria-hidden="true" />
      <div className="strip-fields">
        {fields.map((f, i) => (
          <span key={i} className={i === 0 ? "strip-kind" : ""}>
            {f}
          </span>
        ))}
      </div>
      {time && <span className="strip-time">{time}</span>}
      {onDelete && (
        <button type="button" className="strip-del" onClick={onDelete} aria-label={`Delete ${fields.join(" ")}`}>
          ×
        </button>
      )}
    </div>
  );
}

// ---------- Annunciator ----------
const ANN: Record<LandingStatus, { label: string; cls: string }> = {
  on: { label: "ON COURSE", cls: "ann-on" },
  drifting: { label: "DRIFTING", cls: "ann-drift" },
  correction: { label: "COURSE CORRECTION", cls: "ann-alert" },
};
export function Annunciator({ status, caption }: { status: LandingStatus; caption?: string }) {
  const a = ANN[status];
  return (
    <div className={`annunciator ${a.cls}`} role="status">
      <span className="ann-lamp" aria-hidden="true" />
      <span className="ann-text">{a.label}</span>
      {caption && <span className="ann-caption">{caption}</span>}
    </div>
  );
}

// ---------- Meal art (demo meals, no external photos) ----------
export function MealArt({ kind }: { kind: "yogurt" | "wrap" | "eggs" | "soup" }) {
  return (
    <svg viewBox="0 0 96 96" className="meal-art" aria-hidden="true">
      <circle cx="48" cy="48" r="44" className="plate" />
      <circle cx="48" cy="48" r="34" className="plate-inner" />
      {kind === "yogurt" && (
        <g>
          <circle cx="48" cy="48" r="26" fill="#F7F4EC" />
          {[
            [40, 40, "#7B3F8C"],
            [52, 38, "#C0392B"],
            [56, 52, "#7B3F8C"],
            [42, 55, "#C0392B"],
            [48, 46, "#3D5A99"],
          ].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r="4.5" fill={c as string} />
          ))}
          <ellipse cx="60" cy="42" rx="3" ry="1.8" fill="#C8A27A" />
          <ellipse cx="36" cy="48" rx="3" ry="1.8" fill="#C8A27A" />
        </g>
      )}
      {kind === "wrap" && (
        <g>
          <rect x="22" y="38" width="52" height="20" rx="10" fill="#E9D3A8" transform="rotate(-18 48 48)" />
          <rect x="26" y="40" width="10" height="16" rx="5" fill="#7DA453" transform="rotate(-18 48 48)" />
          <rect x="30" y="42" width="6" height="12" rx="3" fill="#F2E3C4" transform="rotate(-18 48 48)" />
        </g>
      )}
      {kind === "eggs" && (
        <g>
          <rect x="24" y="30" width="48" height="36" rx="6" fill="#D9A55B" />
          <ellipse cx="40" cy="48" rx="12" ry="10" fill="#FFFFFF" />
          <ellipse cx="58" cy="46" rx="11" ry="10" fill="#FFFFFF" />
          <circle cx="40" cy="48" r="5" fill="#F2B70F" />
          <circle cx="58" cy="46" r="5" fill="#F2B70F" />
        </g>
      )}
      {kind === "soup" && (
        <g>
          <circle cx="48" cy="48" r="26" fill="#B4793A" />
          {[
            [40, 42],
            [54, 44],
            [46, 54],
            [58, 56],
            [36, 54],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" fill="#7E4E1E" />
          ))}
          <path d="M40 30 q 3 -6 0 -12 M52 30 q 3 -6 0 -12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity=".35" />
        </g>
      )}
    </svg>
  );
}
