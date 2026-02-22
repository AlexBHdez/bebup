import { calculateGoal } from "@/lib/hydration/calculations";
import type { HydrationSettings } from "@/lib/hydration/types";

export const HYDRATION_FACTOR_ML_PER_KG = 35;

export const STORAGE_KEYS = {
  settings: "bebup-settings",
  logs: "bebup-logs",
} as const;

const DEFAULT_WEIGHT = 70;
const DEFAULT_GLASS_SIZE = 250;

export const DEFAULT_SETTINGS: HydrationSettings = {
  weight: DEFAULT_WEIGHT,
  glassSize: DEFAULT_GLASS_SIZE,
  dailyGoal: calculateGoal(DEFAULT_WEIGHT, DEFAULT_GLASS_SIZE),
  wakeTime: "07:00",
  sleepTime: "23:00",
  remindersEnabled: true,
  reminderInterval: 60,
  onboarded: false,
};
