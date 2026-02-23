# BebUp Hydration

Hydration app built with Vite + React + TypeScript.

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

## Tests

```sh
npm test
```

## Local PWA validation

- The app includes `manifest.webmanifest` and a service worker (`/public/sw.js`) for static asset offline caching.
- The service worker is registered only in `production`.
- To validate PWA locally:
  1. Run `npm run build`.
  2. Serve `dist/` with a static server (for example `npm run preview`).
  3. Open DevTools > Application and verify `Manifest` and `Service Workers`.

## Reminders and notifications

- Reminder settings (enabled + wake/sleep window) are persisted in app settings.
- The reminder loop uses Web Notifications only when:
  - `Notification` API is supported,
  - permission is `granted`,
  - and current time is inside the configured wake/sleep window.
- This repository does not include a push backend; notification behavior is local-only on client side.

## Push limitations

- Real Web Push (server-triggered delivery) requires backend infrastructure and push subscriptions.
- This repository includes the backend endpoints, but delivery still depends on correct Vercel env vars, database setup, and browser support.

## Push backend setup (Vercel)

This repository includes serverless endpoints in `/api/push/*` and a scheduler (`vercel.json` cron) for Web Push delivery.

### 1) Create VAPID keys

Run once:

```sh
npx web-push generate-vapid-keys
```

Copy values into Vercel project environment variables:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VITE_VAPID_PUBLIC_KEY` (same value as `VAPID_PUBLIC_KEY`, exposed to client)
- `PUSH_DISPATCH_SECRET` (random long secret for manual send/dispatch endpoints)
- `DATABASE_URL` (Postgres connection string)

### 2) Create database table

Run SQL from:

- `database/schema.sql`

### 3) API endpoints

- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `POST /api/push/schedule-next`
- `GET /api/push/status?deviceId=...`
- `POST /api/push/send` (manual test, requires `Authorization: Bearer <PUSH_DISPATCH_SECRET>`)
- `POST /api/push/dispatch` (cron dispatch every 15 minutes)

### 4) Deploy and verify

1. Deploy to Vercel.
2. Open Settings in the app and enable push.
3. Confirm subscription row exists in `push_subscriptions`.
4. Test manual send with `/api/push/send`.

## iOS (Add to Home Screen)

- On iOS Safari, use **Share > Add to Home Screen** to install the web app.
- Notification capabilities depend on iOS version and device conditions.
