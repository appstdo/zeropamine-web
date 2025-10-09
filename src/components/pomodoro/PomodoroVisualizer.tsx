"use client";

import type { TimerMode } from "@/types/pomodoro";
import { Hourglass } from "./Hourglass";
import { CoffeeMug } from "./CoffeeMug";

interface PomodoroVisualizerProps {
  mode: TimerMode;
  progress: number; // 0 ~ 1
  theme: "hourglass" | "coffee";
}

export function PomodoroVisualizer({
  mode,
  progress,
  theme,
}: PomodoroVisualizerProps) {
  if (theme === "coffee") {
    return <CoffeeMug mode={mode} progress={progress} />;
  }

  return <Hourglass mode={mode} progress={progress} />;
}
