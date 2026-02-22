import webpush from "web-push";
import { getRequiredEnv } from "./env.js";

let configured = false;

function ensureWebPushConfigured(): void {
  if (configured) {
    return;
  }

  const vapidPublicKey = getRequiredEnv("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = getRequiredEnv("VAPID_PRIVATE_KEY");

  webpush.setVapidDetails(
    "mailto:admin@alexbhdez.dev",
    vapidPublicKey,
    vapidPrivateKey
  );

  configured = true;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: StoredSubscription,
  payload: PushPayload
): Promise<void> {
  ensureWebPushConfigured();

  const target = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  await webpush.sendNotification(target, JSON.stringify(payload));
}
