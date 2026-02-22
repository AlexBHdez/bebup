import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayKey } from "@/lib/hydration/date";
import { buildTodayLog } from "@/lib/hydration/storage";
import type { DayLog } from "@/lib/hydration/types";

describe("date key and daily reset boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses UTC date key parity behavior", () => {
    vi.setSystemTime(new Date("2026-02-22T23:30:00-05:00"));
    expect(getTodayKey()).toBe("2026-02-23");
  });

  it("returns empty log for a new day when there is no record", () => {
    const previousDayLogs: DayLog[] = [{ date: "2026-02-22", glasses: 5, goal: 10 }];

    vi.setSystemTime(new Date("2026-02-23T08:00:00Z"));

    expect(buildTodayLog(previousDayLogs, 10)).toEqual({
      date: "2026-02-23",
      glasses: 0,
      goal: 10,
    });
  });

  it("returns existing log for today if present", () => {
    const logs: DayLog[] = [{ date: "2026-02-23", glasses: 3, goal: 10 }];

    vi.setSystemTime(new Date("2026-02-23T10:00:00Z"));

    expect(buildTodayLog(logs, 10)).toEqual({ date: "2026-02-23", glasses: 3, goal: 10 });
  });
});
