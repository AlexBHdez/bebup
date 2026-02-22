import { useCallback, useMemo, useState } from "react";
import { calculateGoal } from "@/lib/hydration/calculations";
import { getTodayKey } from "@/lib/hydration/date";
import { decrementLogForDate, incrementLogForDate } from "@/lib/hydration/logs";
import { calculateCurrentStreak } from "@/lib/hydration/streaks";
import {
  buildTodayLog,
  loadLogs,
  loadSettings,
  saveLogs as saveLogsToStorage,
  saveSettings as saveSettingsToStorage,
} from "@/lib/hydration/storage";
import type { DayLog, HydrationSettings } from "@/lib/hydration/types";

export type { DayLog, HydrationSettings } from "@/lib/hydration/types";

export function useHydration() {
  const [settings, setSettingsState] = useState<HydrationSettings>(loadSettings);
  const [logs, setLogsState] = useState<DayLog[]>(loadLogs);

  const saveSettings = useCallback((s: HydrationSettings) => {
    setSettingsState(s);
    saveSettingsToStorage(s);
  }, []);

  const saveLogs = useCallback((l: DayLog[]) => {
    setLogsState(l);
    saveLogsToStorage(l);
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

  const todayLog = useMemo(
    () => buildTodayLog(logs, settings.dailyGoal, getTodayKey()),
    [logs, settings.dailyGoal]
  );

  const addGlass = useCallback(() => {
    const today = getTodayKey();
    saveLogs(incrementLogForDate(logs, today, settings.dailyGoal));
  }, [logs, settings.dailyGoal, saveLogs]);

  const undoGlass = useCallback(() => {
    const today = getTodayKey();
    saveLogs(decrementLogForDate(logs, today));
  }, [logs, saveLogs]);

  const getStreak = useCallback(() => {
    return calculateCurrentStreak(logs, getTodayKey());
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
