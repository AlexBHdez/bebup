import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "@/App";
import type { DayLog, HydrationSettings } from "@/lib/hydration/types";
import { calculateGoal } from "@/lib/hydration/calculations";
import { getOffsetDateKey, getTodayKey } from "@/lib/hydration/date";

const defaultSettings: HydrationSettings = {
  weight: 70,
  glassSize: 250,
  dailyGoal: 10,
  wakeTime: "07:00",
  sleepTime: "23:00",
  remindersEnabled: true,
  onboarded: true,
};

function setHydrationStorage(settings: HydrationSettings, logs: DayLog[] = []) {
  localStorage.setItem("bebup-settings", JSON.stringify(settings));
  localStorage.setItem("bebup-logs", JSON.stringify(logs));
}

describe("hydration critical flows", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves onboarding settings and computes daily target", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    const weightSlider = screen.getByRole("slider");
    fireEvent.change(weightSlider, { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: "300 ml" }));
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByText(/9 vasos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    await waitFor(() => {
      const raw = localStorage.getItem("bebup-settings");
      expect(raw).not.toBeNull();
      const settings = JSON.parse(raw as string) as HydrationSettings;
      expect(settings.weight).toBe(80);
      expect(settings.glassSize).toBe(300);
      expect(settings.dailyGoal).toBe(calculateGoal(80, 300));
      expect(settings.onboarded).toBe(true);
    });
  });

  it("logging + undo updates dashboard state and local storage", async () => {
    setHydrationStorage(defaultSettings, []);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ error: "No push subscription found for this device." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }));

    window.history.pushState({}, "", "/");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Agregar vaso de agua" }));

    await waitFor(() => {
      expect(screen.getByText(/deshacer último vaso/i)).toBeInTheDocument();
      const rawLogs = localStorage.getItem("bebup-logs");
      const logs = JSON.parse(rawLogs as string) as DayLog[];
      expect(logs).toHaveLength(1);
      expect(logs[0].glasses).toBe(1);
      expect(logs[0].date).toBe(getTodayKey());
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/push/schedule-next",
      expect.objectContaining({ method: "POST" })
    );
    expect(await screen.findByText(/activa push para recibir recordatorios automáticos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /deshacer último vaso/i }));

    await waitFor(() => {
      const rawLogs = localStorage.getItem("bebup-logs");
      const logs = JSON.parse(rawLogs as string) as DayLog[];
      expect(logs[0].glasses).toBe(0);
    });
  });

  it("history shows 30 days max and keeps streak value", async () => {
    const today = getTodayKey();
    const logs: DayLog[] = Array.from({ length: 35 }, (_, i) => {
      const date = getOffsetDateKey(today, -i);
      let glasses = 8;

      if (i === 2) {
        glasses = 7;
      }

      return { date, glasses, goal: 8 };
    });

    setHydrationStorage(defaultSettings, logs);

    window.history.pushState({}, "", "/history");
    render(<App />);

    const rows = await screen.findAllByTestId("history-row");
    expect(rows).toHaveLength(30);

    const streakLabel = screen.getByText("Racha actual");
    const streakCard = streakLabel.closest("div")?.parentElement;
    expect(streakCard).not.toBeNull();
    expect(within(streakCard as HTMLElement).getByText("2")).toBeInTheDocument();
  });
});
