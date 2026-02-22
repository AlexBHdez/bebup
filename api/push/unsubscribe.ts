import { z } from "zod";
import { getDbPool } from "../_lib/db.js";
import { sendInternalError } from "../_lib/error.js";

const unsubscribeSchema = z.object({
  endpoint: z.string().url().optional(),
  deviceId: z.string().min(1).optional(),
}).refine((value) => Boolean(value.endpoint || value.deviceId), {
  message: "Either endpoint or deviceId is required",
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = unsubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const pool = getDbPool();

    if (parsed.data.endpoint) {
      await pool.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [parsed.data.endpoint]);
    } else if (parsed.data.deviceId) {
      await pool.query(`DELETE FROM push_subscriptions WHERE device_id = $1`, [parsed.data.deviceId]);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendInternalError(res, error, "push.unsubscribe");
  }
}
