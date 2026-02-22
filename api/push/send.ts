import { z } from "zod";
import { getDbPool } from "../_lib/db.js";
import { isAuthorized } from "../_lib/env.js";
import { sendPushNotification } from "../_lib/push.js";
import { sendInternalError } from "../_lib/error.js";

const sendSchema = z.object({
  endpoint: z.string().url().optional(),
  deviceId: z.string().min(1).optional(),
  title: z.string().min(1).default("BebUp"),
  body: z.string().min(1).default("Hora de tomar un vaso de agua 💧"),
  tag: z.string().optional(),
  url: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isAuthorized(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = sendSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

  const { endpoint, deviceId, title, body, tag, url } = parsed.data;
  const pool = getDbPool();

  let queryText = `SELECT endpoint, p256dh, auth FROM push_subscriptions`;
  const params: unknown[] = [];

  if (endpoint) {
    queryText += ` WHERE endpoint = $1`;
    params.push(endpoint);
  } else if (deviceId) {
    queryText += ` WHERE device_id = $1`;
    params.push(deviceId);
  }

    const result = await pool.query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No subscription found" });
    }

    let sent = 0;
    for (const row of result.rows) {
      await sendPushNotification(row, { title, body, tag, url });
      sent += 1;
    }

    return res.status(200).json({ ok: true, sent });
  } catch (error) {
    return sendInternalError(res, error, "push.send");
  }
}
