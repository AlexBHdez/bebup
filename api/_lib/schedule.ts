export interface ReminderSchedule {
  wakeTime: string;
  sleepTime: string;
  timezone: string;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return (hours * 60 + minutes + 1440) % 1440;
}

function getTimeZoneMinutes(now: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);

    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return now.getHours() * 60 + now.getMinutes();
    }

    return hour * 60 + minute;
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

function isInsideReminderWindowForMinute(nowMinutes: number, wakeTime: string, sleepTime: string): boolean {
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  const sleepMinutes = parseTimeToMinutes(sleepTime);

  if (wakeMinutes === sleepMinutes) {
    return true;
  }

  if (wakeMinutes < sleepMinutes) {
    return nowMinutes >= wakeMinutes && nowMinutes <= sleepMinutes;
  }

  return nowMinutes >= wakeMinutes || nowMinutes <= sleepMinutes;
}

function minutesUntilNextWake(nowMinutes: number, wakeTime: string): number {
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  if (wakeMinutes >= nowMinutes) {
    return wakeMinutes - nowMinutes;
  }

  return 1440 - nowMinutes + wakeMinutes;
}

export function scheduleNextReminder(
  nowUtc: Date,
  schedule: ReminderSchedule,
  delayMinutes = 60
): Date {
  const safeDelay = Math.max(1, delayMinutes);
  const candidateUtc = new Date(nowUtc.getTime() + safeDelay * 60 * 1000);
  const candidateMinutes = getTimeZoneMinutes(candidateUtc, schedule.timezone || "UTC");

  if (isInsideReminderWindowForMinute(candidateMinutes, schedule.wakeTime, schedule.sleepTime)) {
    return candidateUtc;
  }

  const moveMinutes = minutesUntilNextWake(candidateMinutes, schedule.wakeTime);
  return new Date(candidateUtc.getTime() + moveMinutes * 60 * 1000);
}

export function shouldSendByDueAt(nowUtc: Date, nextDueAt: Date | null): boolean {
  if (!nextDueAt) {
    return false;
  }

  return nextDueAt.getTime() <= nowUtc.getTime();
}

export function isInsideReminderWindow(nowUtc: Date, schedule: ReminderSchedule): boolean {
  const nowMinutes = getTimeZoneMinutes(nowUtc, schedule.timezone || "UTC");
  return isInsideReminderWindowForMinute(nowMinutes, schedule.wakeTime, schedule.sleepTime);
}
