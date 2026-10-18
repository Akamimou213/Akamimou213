import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dayKey, uid } from "./calc";
import { buildDemo } from "./demo";
import type { CheckIn, Data, Dose, LandingPlan, Meal, Profile, Weight, Workout } from "./types";

const OWN_KEY = "landed:v1";
const DEMO_KEY = "landed:demo:v1";
const EVENTS_KEY = "landed:events";

export const defaultProfile: Profile = {
  name: "",
  adult: false,
  medication: "",
  medForm: "injection",
  doseWeekday: 0,
  doseTime: "08:00",
  currentDose: "",
  phase: "cruise",
  startKg: null,
  goalKg: null,
  heightCm: null,
  units: "lb",
  proteinTarget: 100,
  dietary: [],
  strength: "",
  worries: [],
  hideWeight: false,
  theme: "system",
  plan: "free",
  onboarded: false,
};

const emptyData = (): Data => ({ profile: { ...defaultProfile }, doses: [], meals: [], checkins: [], weights: [], workouts: [], landing: null });

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app still works in memory */
  }
}

/** Privacy-safe analytics: event names and coarse props only, never health values. Swap for a Bolt server function later. */
export function track(name: string, props: Record<string, string | number | boolean> = {}) {
  const q = load<{ n: string; p: typeof props; t: number }[]>(EVENTS_KEY) ?? [];
  q.push({ n: name, p: props, t: Date.now() });
  save(EVENTS_KEY, q.slice(-500));
}

interface Store {
  data: Data;
  demo: boolean;
  setProfile: (patch: Partial<Profile>) => void;
  addDose: (d: Omit<Dose, "id">) => string;
  addMeal: (m: Omit<Meal, "id">) => string;
  saveCheckin: (c: Omit<CheckIn, "id">) => void;
  saveWeight: (w: Omit<Weight, "id">) => void;
  addWorkout: (w: Omit<Workout, "id">) => string;
  remove: (kind: "doses" | "meals" | "checkins" | "weights" | "workouts", id: string) => void;
  setLanding: (p: LandingPlan | null) => void;
  startDemo: () => void;
  exitDemo: () => void;
  replaceOwn: (d: Data) => void;
  resetOwn: () => void;
  ownData: Data;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [own, setOwn] = useState<Data>(() => {
    const d = load<Data>(OWN_KEY);
    return d ? { ...emptyData(), ...d, profile: { ...defaultProfile, ...d.profile } } : emptyData();
  });
  const [demoData, setDemoData] = useState<Data | null>(() => load<Data>(DEMO_KEY));

  useEffect(() => save(OWN_KEY, own), [own]);
  useEffect(() => save(DEMO_KEY, demoData), [demoData]);

  const demo = demoData !== null;
  const data = demoData ?? own;
  const update = useCallback(
    (fn: (d: Data) => Data) => {
      if (demoData) setDemoData((d) => (d ? fn(d) : d));
      else setOwn(fn);
    },
    [demoData],
  );

  const store = useMemo<Store>(
    () => ({
      data,
      demo,
      ownData: own,
      setProfile: (patch) => update((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
      addDose: (x) => {
        const id = uid();
        update((d) => ({ ...d, doses: [...d.doses, { ...x, id }], profile: { ...d.profile, currentDose: x.dose || d.profile.currentDose } }));
        return id;
      },
      addMeal: (x) => {
        const id = uid();
        update((d) => ({ ...d, meals: [...d.meals, { ...x, id }] }));
        return id;
      },
      saveCheckin: (x) =>
        update((d) => ({ ...d, checkins: [...d.checkins.filter((c) => c.day !== x.day), { ...x, id: uid() }] })),
      saveWeight: (x) => update((d) => ({ ...d, weights: [...d.weights.filter((w) => w.day !== x.day), { ...x, id: uid() }] })),
      addWorkout: (x) => {
        const id = uid();
        update((d) => ({ ...d, workouts: [...d.workouts, { ...x, id }] }));
        return id;
      },
      remove: (kind, id) =>
        update((d) => ({ ...d, [kind]: (d[kind] as { id: string }[]).filter((x) => x.id !== id) }) as Data),
      setLanding: (p) => update((d) => ({ ...d, landing: p })),
      startDemo: () => {
        setDemoData(buildDemo(dayKey()));
        track("demo_started");
      },
      exitDemo: () => setDemoData(null),
      replaceOwn: (d) => setOwn(d),
      resetOwn: () => setOwn(emptyData()),
    }),
    [data, demo, own, update],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
