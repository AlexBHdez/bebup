CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_interval INTEGER NOT NULL DEFAULT 60,
  wake_time TEXT NOT NULL DEFAULT '07:00',
  sleep_time TEXT NOT NULL DEFAULT '23:00',
  next_due_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS next_due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON push_subscriptions (device_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_enabled ON push_subscriptions (reminders_enabled);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_next_due_at ON push_subscriptions (next_due_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_sent_at ON push_subscriptions (last_sent_at);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Lock down direct API roles; this table should be managed by trusted backend code.
REVOKE ALL ON TABLE push_subscriptions FROM anon;
REVOKE ALL ON TABLE push_subscriptions FROM authenticated;
