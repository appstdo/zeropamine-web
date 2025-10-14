"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { TimerMode } from "@/types/pomodoro";

interface CoffeeMugProps {
  mode: TimerMode;
  progress: number; // 0 ~ 1
}

const FILL_TOP_Y = 72;
const FILL_BOTTOM_Y = 214;
const MAX_FILL_HEIGHT = FILL_BOTTOM_Y - FILL_TOP_Y;

export function CoffeeMug({ mode, progress }: CoffeeMugProps) {
  const t = useTranslations("pomodoro.aria");
  const { fillHeight, fillColor, fillOpacity } = useMemo(() => {
    const fillProgress = mode === "focus" ? progress : 1 - progress;
    const height = Math.max(0, Math.min(1, fillProgress)) * MAX_FILL_HEIGHT;
    const color = mode === "focus" ? "#D2A679" : "#FFFFFF";
    const opacity = mode === "focus" ? 0.95 : 0.85;
    return {
      fillHeight: height,
      fillColor: color,
      fillOpacity: opacity,
    };
  }, [mode, progress]);

  return (
    <div
      className="relative w-56 h-72 sm:w-72 sm:h-80 md:w-72 md:h-80 flex items-center justify-center scale-125"
      aria-label={t("coffeeMug")}
    >
      <svg
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 20 192 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 머그잔 본체 */}
        <path
          d="M 40 80 L 152 80 C 160 80 164 84 164 92 L 160 178 C 158 216 120 224 96 224 C 72 224 34 216 32 178 L 28 92 C 28 84 32 80 40 80 Z"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 머그잔 손잡이 */}
        <path
          d="M 152 108 C 176 108 184 124 184 144 C 184 164 176 180 152 180"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 20 192 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="coffee-fill-clip">
            <path d="M 44 84 L 154 84 C 159 84 163 86 163 92 L 159 175 C 157 208 132 222 98 221 C 64 222 36 207 35 176 L 31 93 C 31 86 36 84 41 84 Z" />
          </clipPath>
        </defs>

        <rect
          x="32"
          y={FILL_BOTTOM_Y - fillHeight + 10}
          width="140"
          height={fillHeight + 10}
          fill={fillColor}
          opacity={fillOpacity}
          clipPath="url(#coffee-fill-clip)"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
    </div>
  );
}
