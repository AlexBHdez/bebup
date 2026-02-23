import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";
import type { HydrationSettings } from "@/lib/hydration/types";

const settings: HydrationSettings = {
  weight: 70,
  glassSize: 250,
  dailyGoal: 10,
  wakeTime: "07:00",
  sleepTime: "23:00",
  remindersEnabled: true,
  onboarded: true,
};

describe("settings reminders UI", () => {
  it("removes manual frequency options and shows +1h model text", async () => {
    localStorage.setItem("bebup-settings", JSON.stringify(settings));
    localStorage.setItem("bebup-logs", JSON.stringify([]));
    window.history.pushState({}, "", "/settings");

    render(<App />);

    expect(await screen.findAllByText(/recordatorios/i)).toHaveLength(2);
    expect(screen.queryByText("30 min")).not.toBeInTheDocument();
    expect(screen.queryByText("45 min")).not.toBeInTheDocument();
    expect(screen.queryByText("1.5 horas")).not.toBeInTheDocument();
    expect(
      screen.getByText(/una hora después del último vaso dentro de tu horario despierto/i)
    ).toBeInTheDocument();
  });
});
