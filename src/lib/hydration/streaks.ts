import { getOffsetDateKey, getTodayKey } from "@/lib/hydration/date";
import type { DayLog } from "@/lib/hydration/types";

export function sortLogsDesc(logs: DayLog[]): DayLog[] {
  return [...logs].sort((a, b) => b.date.localeCompare(a.date));
}

export function isGoalMet(log: DayLog): boolean {
  return log.glasses >= log.goal;
}

export function calculateCurrentStreak(logs: DayLog[], today = getTodayKey()): number {
  const byDate = new Map(logs.map((log) => [log.date, log]));

  let streak = 0;
  // Keep parity with current app: stop only when expected day exists and is not completed.
  while (true) {
    const expectedDate = getOffsetDateKey(today, -streak);
    const expectedLog = byDate.get(expectedDate);

    if (!expectedLog) {
      break;
    }

    if (!isGoalMet(expectedLog)) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function calculateBestStreak(logs: DayLog[]): number {
  const completed = sortLogsDesc(logs)
    .filter(isGoalMet)
    .map((log) => log.date)
    .sort((a, b) => a.localeCompare(b));

  if (completed.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let i = 1; i < completed.length; i += 1) {
    const prev = completed[i - 1];
    const expected = getOffsetDateKey(prev, 1);

    if (completed[i] === expected) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}
