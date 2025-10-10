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
  const audioContextRef = useRef<AudioContext | null>(null);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const context = audioContextRef.current;
    if (context.state === "suspended") {
      void context.resume();
    }

    return context;
  }, []);

  const playCompletionSound = useCallback(() => {
    const audioContext = ensureAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    // ===== 자명종 느낌 파라미터 =====
    const pairCount = 5; // 이중 펄스 반복 횟수
    const toneA = 1700; // 첫 톤(Hz)
    const toneB = 2000; // 두 번째 톤(Hz)
    const singleDur = 0.11; // 한 톤 길이(초)
    const intraGap = 0.03; // 이중 톤 사이 간격(초)
    const pairGap = 0.18; // 다음 이중 톤까지 간격(초)

    // 얇은 금속성 대역을 강조하는 BPF
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1850, now);
    bandpass.Q.setValueAtTime(6, now);

    // 약한 하드-클리핑으로 금속성 질감 강화
    const shaper = audioContext.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      // 부드러운 소프트클립 → 살짝 거친 하모닉
      curve[i] = Math.tanh(2.2 * x);
    }
    shaper.curve = curve;
    shaper.oversample = "2x";

    // 전체 볼륨
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(1.5, now);

    // 체인: bandpass → shaper → destination
    bandpass.connect(shaper);
    shaper.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // 한 톤(금속성 펄스) 생성 & 스케줄
    const scheduleTone = (startTime: number, freq: number) => {
      // 금속성 느낌: 좁은 펄스파(PeriodicWave) + 약간의 디튠 2보이스
      const makeVoice = (detuneCents: number) => {
        const osc = audioContext.createOscillator();
        // 펄스파를 PeriodicWave로 흉내 (사각보다 더 얇은 질감)
        // 1/n 고조파를 일부만 남겨 얇은 대역을 강조
        const harmonics = 32;
        const real = new Float32Array(harmonics);
        const imag = new Float32Array(harmonics);
        for (let n = 1; n < harmonics; n++) {
          // 홀수 위주 + 고역 완만 감쇠
          const amp = n % 2 === 1 ? 1 / (n * 0.85) : 0.12 / n;
          imag[n] = amp;
        }
        const wave = audioContext.createPeriodicWave(real, imag, {
          disableNormalization: false,
        });
        osc.setPeriodicWave(wave);
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime(detuneCents, startTime);
        return osc;
      };

      const v1 = makeVoice(-8);
      const v2 = makeVoice(+8);

      // 클릭감 있는 엔벌로프
      const g = audioContext.createGain();
      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.exponentialRampToValueAtTime(0.42, startTime + 0.015); // 빠른 어택
      g.gain.exponentialRampToValueAtTime(0.22, startTime + singleDur - 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + singleDur);

      v1.connect(g);
      v2.connect(g);
      g.connect(bandpass);

      v1.start(startTime);
      v2.start(startTime);
      v1.stop(startTime + singleDur + 0.02);
      v2.stop(startTime + singleDur + 0.02);
    };

    // 이중 톤을 pairCount만큼 반복 스케줄
    let t = now;
    for (let i = 0; i < pairCount; i += 1) {
      scheduleTone(t, toneA);
      t += singleDur + intraGap;
      scheduleTone(t, toneB);
      t += singleDur + pairGap;
    }
  }, [ensureAudioContext]);

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

            playCompletionSound();

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
  }, [state.status, playCompletionSound]);

  // 시작/재개
  const start = useCallback(() => {
    ensureAudioContext();
    setState((prev) => ({ ...prev, status: "running" }));
  }, [ensureAudioContext]);

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

  const startTenSecondTest = useCallback(() => {
    ensureAudioContext();
    setState((prev) => ({
      ...prev,
      status: "running",
      timeLeft: 10,
    }));
  }, [ensureAudioContext]);

  // 설정 업데이트
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setState((prev) => {
        const updated = { ...prev.settings, ...newSettings };
        const nextTheme = updated.theme === "coffee" ? "coffee" : "hourglass";
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
    playCompletionSound,
    startTenSecondTest,
  };
}
