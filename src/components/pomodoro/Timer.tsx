"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { TimerMode } from "@/types/pomodoro";

interface TimerProps {
  mode: TimerMode;
  timeLeft: number; // 초 단위
}

export function Timer({ mode, timeLeft }: TimerProps) {
  const t = useTranslations("pomodoro.timer");
  const { minutes, seconds } = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return {
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0"),
    };
  }, [timeLeft]);

  const modeLabel = mode === "focus" ? t("focus") : t("break");
  const heading = t("heading", { mode: modeLabel });
  const modeColor = mode === "focus" ? "text-blue-400" : "text-green-400";

  return (
    <div
      className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4"
      role="timer"
      aria-live="polite"
    >
      <h2
        className={`text-lg sm:text-xl md:text-2xl font-bold ${modeColor} transition-colors`}
      >
        {heading}
      </h2>
      <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold text-white tracking-wider tabular-nums">
        {minutes}:{seconds}
      </div>
    </div>
  );
}
