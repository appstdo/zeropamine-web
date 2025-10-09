"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PomodoroSettings,
  PomodoroState,
  TimerMode,
  TimerStatus,
} from "@/types/pomodoro";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  autoStart: false,
  theme: "hourglass",
};

const STORAGE_KEY = "zeropamine-settings";

const INITIAL_STATE: PomodoroState = {
  mode: "focus",
  status: "idle",
  timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
  settings: { ...DEFAULT_SETTINGS },
};

export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(INITIAL_STATE);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 클라이언트에서 기존 설정 불러오기 (SSR과의 초기 불일치 방지)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (!savedSettings) {
      return;
    }

    try {
      const raw = JSON.parse(savedSettings) as Partial<PomodoroSettings>;
      const parsed: PomodoroSettings = {
        ...DEFAULT_SETTINGS,
        ...raw,
        theme: raw?.theme === "coffee" ? "coffee" : "hourglass",
      };
      setState((prev) => ({
        ...prev,
        settings: parsed,
        timeLeft:
          prev.status === "idle"
            ? (prev.mode === "focus"
                ? parsed.focusDuration
                : parsed.breakDuration) * 60
            : prev.timeLeft,
      }));
    } catch (error) {
      console.warn("Failed to parse pomodoro settings:", error);
    }
  }, []);

  // 설정 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    }
  }, [state.settings]);

  // 타이머 로직
  useEffect(() => {
    if (state.status === "running") {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            // 타이머 종료
            const nextMode: TimerMode =
              prev.mode === "focus" ? "break" : "focus";
            const nextDuration =
              nextMode === "focus"
                ? prev.settings.focusDuration
                : prev.settings.breakDuration;

            // 자동 시작 여부에 따라 상태 결정
            const nextStatus: TimerStatus = prev.settings.autoStart
              ? "running"
              : "idle";

            // 알림 (옵션)
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Zeropamine", {
                  body:
                    nextMode === "focus"
                      ? "휴식이 끝났습니다. 집중 시간입니다!"
                      : "집중 시간이 끝났습니다. 휴식하세요!",
                  icon: "/favicon.ico",
                });
              }
            }

            return {
              ...prev,
              mode: nextMode,
              status: nextStatus,
              timeLeft: nextDuration * 60,
            };
          }

          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status]);

  // 시작/재개
  const start = useCallback(() => {
    setState((prev) => ({ ...prev, status: "running" }));
  }, []);

  // 일시정지
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, status: "paused" }));
  }, []);

  // 리셋
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      timeLeft:
        prev.mode === "focus"
          ? prev.settings.focusDuration * 60
          : prev.settings.breakDuration * 60,
    }));
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setState((prev) => {
        const updated = { ...prev.settings, ...newSettings };
        const nextTheme =
          updated.theme === "coffee" ? "coffee" : "hourglass";
        return {
          ...prev,
          settings: { ...updated, theme: nextTheme },
          timeLeft:
            prev.status === "idle"
              ? (prev.mode === "focus"
                  ? updated.focusDuration
                  : updated.breakDuration) * 60
              : prev.timeLeft,
        };
      });
    },
    []
  );

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  }, []);

  return {
    ...state,
    start,
    pause,
    reset,
    updateSettings,
    requestNotificationPermission,
  };
}
