export interface ReminderSchedule {
  reminderInterval: number;
  wakeTime: string;
  sleepTime: string;
  lastSentAt: Date | null;
}

export function nowInTimeZone(now: Date, timeZone: string): Date {
  try {
    const local = now.toLocaleString("en-US", { timeZone });
    return new Date(local);
  } catch {
    return now;
  }
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
}

export function isInsideReminderWindow(now: Date, wakeTime: string, sleepTime: string): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  const sleepMinutes = parseTimeToMinutes(sleepTime);

  if (wakeMinutes <= sleepMinutes) {
    return nowMinutes >= wakeMinutes && nowMinutes <= sleepMinutes;
  }

  return nowMinutes >= wakeMinutes || nowMinutes <= sleepMinutes;
}

export function canSendByInterval(now: Date, reminderInterval: number, lastSentAt: Date | null): boolean {
  if (!lastSentAt) {
    return true;
  }

  const elapsedMs = now.getTime() - lastSentAt.getTime();
  return elapsedMs >= Math.max(1, reminderInterval) * 60 * 1000;
}

export function shouldSendReminder(now: Date, schedule: ReminderSchedule): boolean {
  return (
    isInsideReminderWindow(now, schedule.wakeTime, schedule.sleepTime) &&
    canSendByInterval(now, schedule.reminderInterval, schedule.lastSentAt)
  );
}
