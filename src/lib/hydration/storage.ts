import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/hydration/constants";
import { getTodayKey } from "@/lib/hydration/date";
import type { DayLog, HydrationSettings } from "@/lib/hydration/types";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadSettings(): HydrationSettings {
  const parsed = safeParse<Partial<HydrationSettings>>(localStorage.getItem(STORAGE_KEYS.settings));
  return { ...DEFAULT_SETTINGS, ...(parsed ?? {}) };
}

export function saveSettings(settings: HydrationSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function loadLogs(): DayLog[] {
  const parsed = safeParse<DayLog[]>(localStorage.getItem(STORAGE_KEYS.logs));
  return parsed ?? [];
}

export function saveLogs(logs: DayLog[]): void {
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
}

export function buildTodayLog(logs: DayLog[], dailyGoal: number, today = getTodayKey()): DayLog {
  return (
    logs.find((log) => log.date === today) ?? {
      date: today,
      glasses: 0,
      goal: dailyGoal,
    }
  );
}
