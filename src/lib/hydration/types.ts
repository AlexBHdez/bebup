export interface DayLog {
  date: string;
  glasses: number;
  goal: number;
}

export interface HydrationSettings {
  weight: number;
  glassSize: number;
  dailyGoal: number;
  wakeTime: string;
  sleepTime: string;
  remindersEnabled: boolean;
  reminderInterval: number;
  onboarded: boolean;
}
