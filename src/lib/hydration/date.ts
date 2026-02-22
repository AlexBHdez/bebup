export function toUtcDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getTodayKey(now = new Date()): string {
  return toUtcDateKey(now);
}

export function getOffsetDateKey(baseDateKey: string, offsetDays: number): string {
  const baseDate = new Date(baseDateKey);
  baseDate.setDate(baseDate.getDate() + offsetDays);
  return toUtcDateKey(baseDate);
}
