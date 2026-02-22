import type { DayLog } from "@/lib/hydration/types";
import { sortLogsDesc } from "@/lib/hydration/streaks";
import { getTodayKey, getOffsetDateKey } from "@/lib/hydration/date";

export const HISTORY_MAX_DAYS = 30;

export function getRecentLogs(logs: DayLog[], maxDays = HISTORY_MAX_DAYS): DayLog[] {
  return sortLogsDesc(logs).slice(0, maxDays);
}

export function getCompletedDays(logs: DayLog[]): number {
  return logs.filter((log) => log.glasses >= log.goal).length;
}

export function formatHistoryDate(dateStr: string, today = getTodayKey()): string {
  const date = new Date(`${dateStr}T12:00:00`);
  const yesterday = getOffsetDateKey(today, -1);

  if (dateStr === today) return "Hoy";
  if (dateStr === yesterday) return "Ayer";

  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
