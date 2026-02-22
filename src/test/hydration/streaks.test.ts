import { describe, expect, it } from "vitest";
import { calculateBestStreak, calculateCurrentStreak } from "@/lib/hydration/streaks";
import type { DayLog } from "@/lib/hydration/types";

const logs: DayLog[] = [
  { date: "2026-02-18", glasses: 10, goal: 10 },
  { date: "2026-02-19", glasses: 9, goal: 10 },
  { date: "2026-02-20", glasses: 10, goal: 10 },
  { date: "2026-02-21", glasses: 10, goal: 10 },
  { date: "2026-02-22", glasses: 10, goal: 10 },
  { date: "2026-01-10", glasses: 8, goal: 8 },
  { date: "2026-01-11", glasses: 8, goal: 8 },
  { date: "2026-01-12", glasses: 8, goal: 8 },
  { date: "2026-01-13", glasses: 8, goal: 8 },
];

describe("streak calculations", () => {
  it("computes current streak from today backwards", () => {
    expect(calculateCurrentStreak(logs, "2026-02-22")).toBe(3);
    expect(calculateCurrentStreak(logs, "2026-02-21")).toBe(2);
    expect(calculateCurrentStreak(logs, "2026-02-19")).toBe(0);
  });

  it("computes best streak across completed days", () => {
    expect(calculateBestStreak(logs)).toBe(4);
    expect(calculateBestStreak([])).toBe(0);
  });
});
