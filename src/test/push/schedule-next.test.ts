import { describe, expect, it } from "vitest";
import { scheduleNextReminder } from "../../../api/_lib/schedule";

describe("scheduleNextReminder", () => {
  it("schedules +1h when candidate is inside wake window", () => {
    const now = new Date("2026-02-23T10:00:00.000Z");
    const scheduled = scheduleNextReminder(
      now,
      {
        wakeTime: "07:00",
        sleepTime: "23:00",
        timezone: "UTC",
      },
      60
    );

    expect(scheduled.toISOString()).toBe("2026-02-23T11:00:00.000Z");
  });

  it("moves to next wake when +1h lands outside day window", () => {
    const now = new Date("2026-02-23T23:30:00.000Z");
    const scheduled = scheduleNextReminder(
      now,
      {
        wakeTime: "07:00",
        sleepTime: "23:00",
        timezone: "UTC",
      },
      60
    );

    expect(scheduled.toISOString()).toBe("2026-02-24T07:00:00.000Z");
  });

  it("supports overnight windows", () => {
    const now = new Date("2026-02-23T02:30:00.000Z");
    const scheduled = scheduleNextReminder(
      now,
      {
        wakeTime: "20:00",
        sleepTime: "04:00",
        timezone: "UTC",
      },
      60
    );

    expect(scheduled.toISOString()).toBe("2026-02-23T03:30:00.000Z");
  });

  it("treats wake == sleep as 24h window", () => {
    const now = new Date("2026-02-23T03:15:00.000Z");
    const scheduled = scheduleNextReminder(
      now,
      {
        wakeTime: "07:00",
        sleepTime: "07:00",
        timezone: "UTC",
      },
      60
    );

    expect(scheduled.toISOString()).toBe("2026-02-23T04:15:00.000Z");
  });
});

