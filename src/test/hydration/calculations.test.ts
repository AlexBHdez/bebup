import { describe, expect, it } from "vitest";
import { calculateDailyMl, calculateGoal } from "@/lib/hydration/calculations";

describe("hydration calculations", () => {
  it("computes daily ml from weight and factor", () => {
    expect(calculateDailyMl(70)).toBe(2450);
    expect(calculateDailyMl(60, 30)).toBe(1800);
  });

  it("computes target glasses from weight and glass size", () => {
    expect(calculateGoal(70, 250)).toBe(10);
    expect(calculateGoal(80, 350)).toBe(8);
    expect(calculateGoal(55, 300)).toBe(6);
  });
});
