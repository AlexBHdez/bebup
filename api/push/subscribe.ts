import { z } from "zod";
import { getDbPool } from "../_lib/db.js";
import { sendInternalError } from "../_lib/error.js";

const subscribeSchema = z.object({
  deviceId: z.string().min(1),
  timezone: z.string().min(1),
  settings: z.object({
    remindersEnabled: z.boolean(),
    wakeTime: z.string().regex(/^\d{2}:\d{2}$/),
    sleepTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const {
      deviceId,
      timezone,
      settings,
      subscription: {
        endpoint,
        keys: { p256dh, auth },
      },
    } = parsed.data;

    const pool = getDbPool();

    await pool.query(
      `
        INSERT INTO push_subscriptions
        (device_id, endpoint, p256dh, auth, timezone, reminders_enabled, wake_time, sleep_time, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (endpoint)
        DO UPDATE SET
          device_id = EXCLUDED.device_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          timezone = EXCLUDED.timezone,
          reminders_enabled = EXCLUDED.reminders_enabled,
          wake_time = EXCLUDED.wake_time,
          sleep_time = EXCLUDED.sleep_time,
          next_due_at = NULL,
          updated_at = NOW()
      `,
      [
        deviceId,
        endpoint,
        p256dh,
        auth,
        timezone,
        settings.remindersEnabled,
        settings.wakeTime,
        settings.sleepTime,
      ]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendInternalError(res, error, "push.subscribe");
  }
}
