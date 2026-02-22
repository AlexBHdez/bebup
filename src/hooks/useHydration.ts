import { useState, useCallback, useEffect } from "react";

export interface DayLog {
  date: string;
  glasses: number;
  goal: number;
}

export interface HydrationSettings {
  weight: number;
  glassSize: number;
  dailyGoal: number;
  wakeTime: string;
  sleepTime: string;
  remindersEnabled: boolean;
  reminderInterval: number; // minutes
  onboarded: boolean;
}

const DEFAULT_SETTINGS: HydrationSettings = {
  weight: 70,
  glassSize: 250,
  dailyGoal: 8,
  wakeTime: "07:00",
  sleepTime: "23:00",
  remindersEnabled: true,
  reminderInterval: 60,
  onboarded: false,
};

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateGoal(weight: number, glassSize: number): number {
  // ~35ml per kg of body weight
  const totalMl = weight * 35;
  return Math.round(totalMl / glassSize);
}

function loadSettings(): HydrationSettings {
  try {
    const raw = localStorage.getItem("bebup-settings");
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadLogs(): DayLog[] {
  try {
    const raw = localStorage.getItem("bebup-logs");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function useHydration() {
  const [settings, setSettingsState] = useState<HydrationSettings>(loadSettings);
  const [logs, setLogsState] = useState<DayLog[]>(loadLogs);

  const saveSettings = useCallback((s: HydrationSettings) => {
    setSettingsState(s);
    localStorage.setItem("bebup-settings", JSON.stringify(s));
  }, []);

  const saveLogs = useCallback((l: DayLog[]) => {
    setLogsState(l);
    localStorage.setItem("bebup-logs", JSON.stringify(l));
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<HydrationSettings>) => {
      const updated = { ...settings, ...partial };
      if (partial.weight !== undefined || partial.glassSize !== undefined) {
        updated.dailyGoal = calculateGoal(updated.weight, updated.glassSize);
      }
      saveSettings(updated);
    },
    [settings, saveSettings]
  );

  const todayLog = logs.find((l) => l.date === getToday()) || {
    date: getToday(),
    glasses: 0,
    goal: settings.dailyGoal,
  };

  const addGlass = useCallback(() => {
    const today = getToday();
    const existing = logs.find((l) => l.date === today);
    if (existing) {
      saveLogs(
        logs.map((l) =>
          l.date === today ? { ...l, glasses: l.glasses + 1 } : l
        )
      );
    } else {
      saveLogs([...logs, { date: today, glasses: 1, goal: settings.dailyGoal }]);
    }
  }, [logs, settings.dailyGoal, saveLogs]);

  const undoGlass = useCallback(() => {
    const today = getToday();
    const existing = logs.find((l) => l.date === today);
    if (existing && existing.glasses > 0) {
      saveLogs(
        logs.map((l) =>
          l.date === today ? { ...l, glasses: l.glasses - 1 } : l
        )
      );
    }
  }, [logs, saveLogs]);

  const getStreak = useCallback(() => {
    let streak = 0;
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const today = getToday();

    for (const log of sorted) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - streak);
      const expectedStr = expected.toISOString().split("T")[0];

      if (log.date === expectedStr && log.glasses >= log.goal) {
        streak++;
      } else if (log.date === expectedStr) {
        break;
      }
    }
    return streak;
  }, [logs]);

  return {
    settings,
    updateSettings,
    todayLog,
    logs,
    addGlass,
    undoGlass,
    getStreak,
    calculateGoal,
  };
}
