import type { DayLog } from "@/lib/hydration/types";

export function incrementLogForDate(logs: DayLog[], date: string, dailyGoal: number): DayLog[] {
  const existing = logs.find((log) => log.date === date);

  if (!existing) {
    return [...logs, { date, glasses: 1, goal: dailyGoal }];
  }

  return logs.map((log) =>
    log.date === date ? { ...log, glasses: log.glasses + 1 } : log
  );
}

export function decrementLogForDate(logs: DayLog[], date: string): DayLog[] {
  const existing = logs.find((log) => log.date === date);

  if (!existing || existing.glasses <= 0) {
    return logs;
  }

  return logs.map((log) =>
    log.date === date ? { ...log, glasses: log.glasses - 1 } : log
  );
}
