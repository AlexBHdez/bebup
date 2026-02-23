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
