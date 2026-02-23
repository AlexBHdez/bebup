import { getDbPool } from "../_lib/db.js";
import { isAuthorized, isCronRequest } from "../_lib/env.js";
import { sendPushNotification } from "../_lib/push.js";
import { shouldSendByDueAt } from "../_lib/schedule.js";
import { sendInternalError } from "../_lib/error.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const cron = isCronRequest(req);
    if (!cron && !isAuthorized(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
        SELECT id, endpoint, p256dh, auth, next_due_at
        FROM push_subscriptions
        WHERE reminders_enabled = true
          AND next_due_at IS NOT NULL
          AND next_due_at <= NOW()
      `
    );

    const now = new Date();
    let sent = 0;
    let skipped = 0;
    let removed = 0;
    let failed = 0;

    for (const row of result.rows) {
      const shouldSend = shouldSendByDueAt(now, row.next_due_at ? new Date(row.next_due_at) : null);

      if (!shouldSend) {
        skipped += 1;
        continue;
      }

      try {
        await sendPushNotification(
          {
            endpoint: row.endpoint,
            p256dh: row.p256dh,
            auth: row.auth,
          },
          {
            title: "Bebup 💧",
            body: "Es la hora de tomarte un vaso de agua",
            tag: "bebup-hydration-reminder",
            url: "/",
          }
        );

        await pool.query(
          `UPDATE push_subscriptions SET last_sent_at = NOW(), next_due_at = NULL, updated_at = NOW() WHERE id = $1`,
          [row.id]
        );
        sent += 1;
      } catch (error: any) {
        const statusCode = error?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await pool.query(`DELETE FROM push_subscriptions WHERE id = $1`, [row.id]);
          removed += 1;
        } else {
          failed += 1;
        }
      }
    }

    return res.status(200).json({ ok: true, cron, sent, skipped, removed, failed });
  } catch (error) {
    return sendInternalError(res, error, "push.dispatch");
  }
}
