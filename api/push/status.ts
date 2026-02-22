import { z } from "zod";
import { getDbPool } from "../_lib/db.js";
import { sendInternalError } from "../_lib/error.js";

const querySchema = z.object({
  deviceId: z.string().min(1),
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = querySchema.safeParse(req.query ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `SELECT endpoint, reminders_enabled, reminder_interval, wake_time, sleep_time, updated_at FROM push_subscriptions WHERE device_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [parsed.data.deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ subscribed: false });
    }

    return res.status(200).json({
      subscribed: true,
      subscription: result.rows[0],
    });
  } catch (error) {
    return sendInternalError(res, error, "push.status");
  }
}
