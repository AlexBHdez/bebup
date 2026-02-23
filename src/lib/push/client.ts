import type { HydrationSettings } from "@/lib/hydration/types";

const DEVICE_ID_KEY = "bebup-device-id";
const DEFAULT_REMINDER_DELAY_MINUTES = 60;

interface PushSupport {
  supported: boolean;
  reason?: string;
}

export class PushApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PushApiError";
    this.status = status;
  }
}

function toUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `bebup-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = createDeviceId();
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return { supported: false, reason: "no-window" };
  }

  if (!("Notification" in window)) {
    return { supported: false, reason: "notification-unsupported" };
  }

  if (!("serviceWorker" in navigator)) {
    return { supported: false, reason: "service-worker-unsupported" };
  }

  if (!("PushManager" in window)) {
    return { supported: false, reason: "push-manager-unsupported" };
  }

  return { supported: true };
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  const support = getPushSupport();
  if (!support.supported) {
    return "unsupported";
  }

  return Notification.permission;
}

async function postJson(url: string, payload: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body;

    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed?.error) {
        message = parsed.error;
      }
    } catch {
      // Ignore parse errors and keep raw response text.
    }

    throw new PushApiError(response.status, message || `Request failed: ${response.status}`);
  }
}

function settingsPayload(settings: HydrationSettings) {
  return {
    remindersEnabled: settings.remindersEnabled,
    wakeTime: settings.wakeTime,
    sleepTime: settings.sleepTime,
  };
}

export async function requestPushPermission(): Promise<NotificationPermission | "unsupported"> {
  const support = getPushSupport();
  if (!support.supported) {
    return "unsupported";
  }

  return Notification.requestPermission();
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const support = getPushSupport();
  if (!support.supported) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(settings: HydrationSettings): Promise<void> {
  const support = getPushSupport();
  if (!support.supported) {
    throw new Error("Push notifications are not supported on this browser.");
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is missing.");
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8Array(vapidPublicKey),
    }));

  await postJson("/api/push/subscribe", {
    deviceId: getOrCreateDeviceId(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    settings: settingsPayload(settings),
    subscription: subscription.toJSON(),
  });
}

export async function syncPushSubscription(settings: HydrationSettings): Promise<void> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) {
    return;
  }

  await postJson("/api/push/subscribe", {
    deviceId: getOrCreateDeviceId(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    settings: settingsPayload(settings),
    subscription: subscription.toJSON(),
  });
}

export async function scheduleNextHydrationReminder(
  eventAt: Date = new Date(),
  delayMinutes = DEFAULT_REMINDER_DELAY_MINUTES
): Promise<{ scheduledFor: string }> {
  const response = await fetch("/api/push/schedule-next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      eventAt: eventAt.toISOString(),
      delayMinutes,
    }),
  });

  const body = await response.text();
  let parsed: { scheduledFor?: string; error?: string } = {};

  if (body) {
    try {
      parsed = JSON.parse(body) as { scheduledFor?: string; error?: string };
    } catch {
      // Ignore parse errors and fallback to raw body message.
    }
  }

  if (!response.ok) {
    throw new PushApiError(response.status, parsed.error || body || `Request failed: ${response.status}`);
  }

  return {
    scheduledFor: parsed.scheduledFor ?? "",
  };
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) {
    return;
  }

  await postJson("/api/push/unsubscribe", {
    deviceId: getOrCreateDeviceId(),
    endpoint: subscription.endpoint,
  });

  await subscription.unsubscribe();
}
