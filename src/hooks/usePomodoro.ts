"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PomodoroSettings,
  PomodoroState,
  TimerMode,
  TimerStatus,
} from "@/types/pomodoro";

type TrackedAudioNode = {
  node: AudioNode;
  stop?: () => void;
};

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  autoStart: false,
  theme: "coffee",
  soundType: "alarm",
  volume: 1,
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
  const { soundType: activeSoundType, volume: activeVolume } = state.settings;
  const previewNodesRef = useRef<TrackedAudioNode[]>([]);

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

  const stopPreviewSound = useCallback(() => {
    previewNodesRef.current.forEach(({ stop, node }) => {
      try {
        stop?.();
      } catch {
        // ignore stop errors
      }
      try {
        node.disconnect();
      } catch {
        // ignore disconnect errors
      }
    });
    previewNodesRef.current = [];
  }, []);

  useEffect(
    () => () => {
      stopPreviewSound();
    },
    [stopPreviewSound]
  );

  const playSound = useCallback(
    (
      soundTypeParam: PomodoroSettings["soundType"],
      volumeParam: number,
      trackNodes = false
    ) => {
      const audioContext = ensureAudioContext();
      if (!audioContext) return;

      const normalizedVolume = Math.max(
        0,
        Math.min(1, volumeParam ?? DEFAULT_SETTINGS.volume)
      );

      const now = audioContext.currentTime;
      type RegisterFn = (node: AudioNode, stop?: () => void) => void;
      const register: RegisterFn | undefined = trackNodes
        ? (node, stop) => {
            previewNodesRef.current.push({ node, stop });
          }
        : undefined;

      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.3 * normalizedVolume, now);
      masterGain.connect(audioContext.destination);
      register?.(masterGain, () => {
        masterGain.gain.cancelScheduledValues(audioContext.currentTime);
        masterGain.gain.setValueAtTime(0, audioContext.currentTime);
        try {
          masterGain.disconnect();
        } catch {
          // ignore
        }
      });

      const playAlarmSound = () => {
        const pairCount = 5;
        const toneA = 1700;
        const toneB = 2000;
        const singleDur = 0.11;
        const intraGap = 0.03;
        const pairGap = 0.18;

        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(1850, now);
        bandpass.Q.setValueAtTime(6, now);
        register?.(bandpass, () => {
          try {
            bandpass.disconnect();
          } catch {
            // ignore
          }
        });

        const shaper = audioContext.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < curve.length; i += 1) {
          const x = (i / (curve.length - 1)) * 2 - 1;
          curve[i] = Math.tanh(2.2 * x);
        }
        shaper.curve = curve;
        shaper.oversample = "2x";
        register?.(shaper, () => {
          try {
            shaper.disconnect();
          } catch {
            // ignore
          }
        });

        bandpass.connect(shaper);
        shaper.connect(masterGain);

        const scheduleTone = (startTime: number, freq: number) => {
          const makeVoice = (detuneCents: number) => {
            const osc = audioContext.createOscillator();
            const harmonics = 32;
            const real = new Float32Array(harmonics);
            const imag = new Float32Array(harmonics);
            for (let n = 1; n < harmonics; n += 1) {
              const amp = n % 2 === 1 ? 1 / (n * 0.85) : 0.12 / n;
              imag[n] = amp;
            }
            const wave = audioContext.createPeriodicWave(real, imag, {
              disableNormalization: false,
            });
            osc.setPeriodicWave(wave);
            osc.frequency.setValueAtTime(freq, startTime);
            osc.detune.setValueAtTime(detuneCents, startTime);
            register?.(osc, () => {
              try {
                osc.stop(audioContext.currentTime);
              } catch {
                // ignore
              }
              try {
                osc.disconnect();
              } catch {
                // ignore
              }
            });
            return osc;
          };

          const v1 = makeVoice(-8);
          const v2 = makeVoice(+8);

          const g = audioContext.createGain();
          g.gain.setValueAtTime(0.0001, startTime);
          g.gain.exponentialRampToValueAtTime(0.42, startTime + 0.015);
          g.gain.exponentialRampToValueAtTime(
            0.22,
            startTime + singleDur - 0.04
          );
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + singleDur);
          register?.(g, () => {
            try {
              g.disconnect();
            } catch {
              // ignore
            }
          });

          v1.connect(g);
          v2.connect(g);
          g.connect(bandpass);

          v1.start(startTime);
          v2.start(startTime);
          v1.stop(startTime + singleDur + 0.02);
          v2.stop(startTime + singleDur + 0.02);
        };

        let t = now;
        for (let i = 0; i < pairCount; i += 1) {
          scheduleTone(t, toneA);
          t += singleDur + intraGap;
          scheduleTone(t, toneB);
          t += singleDur + pairGap;
        }
      };

      const playBellSound = () => {
        const baseFrequency = 880;
        const strikeInterval = 0.4;
        const strikeCount = 3;

        const strikeNoiseBuffer = audioContext.createBuffer(
          1,
          audioContext.sampleRate * 0.2,
          audioContext.sampleRate
        );
        const data = strikeNoiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
        }

        const scheduleBellStrike = (strikeTime: number) => {
          const createPartial = (
            frequency: number,
            gainValue: number,
            decay: number
          ) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(frequency, strikeTime);

            gain.gain.setValueAtTime(gainValue, strikeTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decay);

            filter.type = "bandpass";
            filter.frequency.setValueAtTime(frequency, strikeTime);
            filter.Q.setValueAtTime(12, strikeTime);

            osc.connect(gain);
            gain.connect(filter);
            filter.connect(masterGain);

            register?.(osc, () => {
              try {
                osc.stop(audioContext.currentTime);
              } catch {
                // ignore
              }
              try {
                osc.disconnect();
              } catch {
                // ignore
              }
            });
            register?.(gain, () => {
              try {
                gain.disconnect();
              } catch {
                // ignore
              }
            });
            register?.(filter, () => {
              try {
                filter.disconnect();
              } catch {
                // ignore
              }
            });

            osc.start(strikeTime);
            osc.stop(strikeTime + decay + 0.1);
          };

          createPartial(baseFrequency, 0.9, 1.2);
          createPartial(baseFrequency * 2, 0.4, 0.9);
          createPartial(baseFrequency * 2.5, 0.25, 0.7);
          createPartial(baseFrequency * 3, 0.18, 0.6);

          const noise = audioContext.createBufferSource();
          noise.buffer = strikeNoiseBuffer;
          register?.(noise, () => {
            try {
              noise.stop(audioContext.currentTime);
            } catch {
              // ignore
            }
            try {
              noise.disconnect();
            } catch {
              // ignore
            }
          });

          const noiseGain = audioContext.createGain();
          noiseGain.gain.setValueAtTime(0.2, strikeTime);
          noiseGain.gain.exponentialRampToValueAtTime(
            0.0001,
            strikeTime + 0.25
          );
          register?.(noiseGain, () => {
            try {
              noiseGain.disconnect();
            } catch {
              // ignore
            }
          });

          const highpass = audioContext.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.setValueAtTime(600, strikeTime);
          register?.(highpass, () => {
            try {
              highpass.disconnect();
            } catch {
              // ignore
            }
          });

          noise.connect(highpass);
          highpass.connect(noiseGain);
          noiseGain.connect(masterGain);

          noise.start(strikeTime);
          noise.stop(strikeTime + 0.3);
        };

        let strikeTime = now;
        for (let i = 0; i < strikeCount; i += 1) {
          scheduleBellStrike(strikeTime);
          strikeTime += strikeInterval;
        }
      };

      if (soundTypeParam === "bell") {
        playBellSound();
      } else {
        playAlarmSound();
      }
    },
    [ensureAudioContext]
  );

  const playCompletionSound = useCallback(() => {
    playSound(activeSoundType, activeVolume, false);
  }, [playSound, activeSoundType, activeVolume]);

  const previewSound = useCallback(
    (type: PomodoroSettings["soundType"], volumeValue: number) => {
      stopPreviewSound();
      playSound(type, volumeValue, true);
    },
    [playSound, stopPreviewSound]
  );

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
        soundType: raw?.soundType === "bell" ? "bell" : "alarm",
        volume:
          typeof raw?.volume === "number"
            ? Math.max(0, Math.min(1, raw.volume))
            : DEFAULT_SETTINGS.volume,
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
      mode: "focus",
      status: "idle",
      timeLeft: prev.settings.focusDuration * 60,
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
        const nextSoundType = updated.soundType === "bell" ? "bell" : "alarm";
        const nextVolume =
          typeof updated.volume === "number"
            ? Math.max(0, Math.min(1, updated.volume))
            : prev.settings.volume;
        const nextFocusDuration =
          typeof updated.focusDuration === "number"
            ? Math.max(1, Math.min(120, updated.focusDuration))
            : prev.settings.focusDuration;
        const nextBreakDuration =
          typeof updated.breakDuration === "number"
            ? Math.max(1, Math.min(60, updated.breakDuration))
            : prev.settings.breakDuration;

        return {
          ...prev,
          settings: {
            ...updated,
            focusDuration: nextFocusDuration,
            breakDuration: nextBreakDuration,
            theme: nextTheme,
            soundType: nextSoundType,
            volume: nextVolume,
          },
          timeLeft:
            prev.status === "idle"
              ? (prev.mode === "focus"
                  ? nextFocusDuration
                  : nextBreakDuration) * 60
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
    previewSound,
    stopPreviewSound,
    startTenSecondTest,
  };
}
