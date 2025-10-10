export type TimerMode = "focus" | "break";

export type TimerStatus = "idle" | "running" | "paused";

export interface PomodoroSettings {
  focusDuration: number; // 분 단위
  breakDuration: number; // 분 단위
  autoStart: boolean; // 자동 전환 여부
  theme: "hourglass" | "coffee";
  soundType: "alarm" | "bell";
  volume: number; // 0 ~ 1
}

export interface PomodoroState {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number; // 초 단위
  settings: PomodoroSettings;
}
