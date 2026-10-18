export type MedForm = "injection" | "pill";
export type Phase = "takeoff" | "cruise" | "holding" | "descent" | "landed";
export type Units = "lb" | "kg";

export interface Profile {
  name: string;
  adult: boolean;
  medication: string;
  medForm: MedForm;
  /** 0 = Sunday … 6 = Saturday, for weekly injections */
  doseWeekday: number;
  /** "08:00", for daily pills */
  doseTime: string;
  currentDose: string;
  phase: Phase;
  startKg: number | null;
  goalKg: number | null;
  heightCm: number | null;
  units: Units;
  proteinTarget: number;
  dietary: string[];
  strength: string;
  worries: string[];
  hideWeight: boolean;
  theme: "system" | "light" | "dark";
  plan: "free" | "plus";
  onboarded: boolean;
}

export interface Dose {
  id: string;
  at: string; // ISO timestamp
  medication: string;
  dose: string;
  site?: string;
  note?: string;
}

export interface Meal {
  id: string;
  at: string;
  title: string;
  protein: number;
  low?: number;
  high?: number;
  source: "photo" | "text" | "manual" | "demo";
}

export interface CheckIn {
  id: string;
  day: string; // YYYY-MM-DD, local
  foodNoise: number;
  nausea: number;
  energy: number;
  note?: string;
}

export interface Weight {
  id: string;
  day: string;
  kg: number;
}

export interface Workout {
  id: string;
  day: string;
  kind: "strength" | "cardio" | "walk";
  minutes: number;
}

export type ChangeKind = "taper" | "pause" | "pill" | "stop";

export interface LandingPlan {
  changeKind: ChangeKind;
  changeDate: string;
  landingKg: number;
  zonePct: number;
  habitProtein: number;
  habitStrength: number;
  habitWeighins: number;
  active: boolean;
}

export interface Data {
  profile: Profile;
  doses: Dose[];
  meals: Meal[];
  checkins: CheckIn[];
  weights: Weight[];
  workouts: Workout[];
  landing: LandingPlan | null;
}

export interface MealItem {
  name: string;
  portion: string;
  proteinG: number;
  confidence: "low" | "medium" | "high";
}

export interface MealAnalysis {
  title: string;
  items: MealItem[];
  proteinLowG: number;
  proteinHighG: number;
  proteinEstimateG: number;
  isLikelyFood: boolean;
  boost: { idea: string; extraProteinG: number }[];
  note: string | null;
}

export type LandingStatus = "on" | "drifting" | "correction";
