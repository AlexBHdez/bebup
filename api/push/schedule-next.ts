import { z } from "zod";
import { getDbPool } from "../_lib/db.js";
import { sendInternalError } from "../_lib/error.js";
import { scheduleNextReminder } from "../_lib/schedule.js";

const scheduleNextSchema = z.object({
  deviceId: z.string().min(1),
  eventAt: z.string().datetime().optional(),
  delayMinutes: z.number().int().positive().max(24 * 60).optional(),
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = scheduleNextSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
        SELECT id, timezone, wake_time, sleep_time, reminders_enabled
        FROM push_subscriptions
        WHERE device_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `,
      [parsed.data.deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No push subscription found for this device." });
    }

    const subscription = result.rows[0];
    if (!subscription.reminders_enabled) {
      return res.status(409).json({ error: "Reminders are disabled for this subscription." });
    }

    const eventAt = parsed.data.eventAt ? new Date(parsed.data.eventAt) : new Date();
    const delayMinutes = parsed.data.delayMinutes ?? 60;
    const nextDueAt = scheduleNextReminder(
      eventAt,
      {
        wakeTime: subscription.wake_time,
        sleepTime: subscription.sleep_time,
        timezone: subscription.timezone || "UTC",
      },
      delayMinutes
    );

    await pool.query(
      `UPDATE push_subscriptions SET next_due_at = $2, updated_at = NOW() WHERE id = $1`,
      [subscription.id, nextDueAt.toISOString()]
    );

    return res.status(200).json({ ok: true, scheduledFor: nextDueAt.toISOString() });
  } catch (error) {
    return sendInternalError(res, error, "push.schedule-next");
  }
}

