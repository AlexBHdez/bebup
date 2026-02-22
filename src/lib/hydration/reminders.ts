import type { HydrationSettings } from "@/lib/hydration/types";

export function supportsWebNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function hasActivePushSubscription(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

export function canScheduleReminders(settings: HydrationSettings): boolean {
  return settings.remindersEnabled && supportsWebNotifications() && Notification.permission === "granted";
}

export async function requestReminderPermission(): Promise<NotificationPermission> {
  if (!supportsWebNotifications()) {
    return "denied";
  }

  return Notification.requestPermission();
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

function isWithinReminderWindow(now: Date, wakeTime: string, sleepTime: string): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const wakeMinutes = timeToMinutes(wakeTime);
  const sleepMinutes = timeToMinutes(sleepTime);

  if (wakeMinutes <= sleepMinutes) {
    return nowMinutes >= wakeMinutes && nowMinutes <= sleepMinutes;
  }

  return nowMinutes >= wakeMinutes || nowMinutes <= sleepMinutes;
}

export function startReminderLoop(settings: HydrationSettings): () => void {
  if (!canScheduleReminders(settings)) {
    return () => undefined;
  }

  const tick = () => {
    if (!canScheduleReminders(settings)) {
      return;
    }

    if (!isWithinReminderWindow(new Date(), settings.wakeTime, settings.sleepTime)) {
      return;
    }

    new Notification("BebUp", {
      body: "Hora de tomar un vaso de agua 💧",
      tag: "bebup-hydration-reminder",
      renotify: false,
    });
  };

  const intervalMs = Math.max(1, settings.reminderInterval) * 60 * 1000;
  const intervalId = window.setInterval(tick, intervalMs);

  return () => {
    window.clearInterval(intervalId);
  };
}
