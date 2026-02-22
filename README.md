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

- Reminder settings (schedule/interval) are persisted in app settings.
- The reminder loop uses Web Notifications only when:
  - `Notification` API is supported,
  - permission is `granted`,
  - and current time is inside the configured wake/sleep window.
- This repository does not include a push backend; notification behavior is local-only on client side.

## Push limitations

- Real Web Push (server-triggered delivery) requires backend infrastructure and push subscriptions (not included here).
- Without backend, there is no remote delivery while the app is closed.

## iOS (Add to Home Screen)

- On iOS Safari, use **Share > Add to Home Screen** to install the web app.
- Notification capabilities depend on iOS version and device conditions.
