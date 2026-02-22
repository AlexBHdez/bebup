const SW_PATH = "/sw.js";

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_PATH).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
