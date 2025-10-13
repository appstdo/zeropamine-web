"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { TimerMode } from "@/types/pomodoro";

const MAX_SAND_HEIGHT = 110;
const TOP_SAND_BASE_Y = 128;
const BOTTOM_SAND_BASE_Y = 238;

interface HourglassProps {
  mode: TimerMode;
  progress: number; // 0 ~ 1
}

export function Hourglass({ mode, progress }: HourglassProps) {
  const t = useTranslations("pomodoro.aria");
  // 모래 높이 계산 (clipPath 높이와 정확히 일치)
  const { topSandHeight, bottomSandHeight } = useMemo(() => {
    if (mode === "focus") {
      // 집중 시간: 위쪽 모래가 줄어들고, 아래쪽 모래가 차오름
      return {
        topSandHeight: progress * MAX_SAND_HEIGHT,
        bottomSandHeight: (1 - progress) * MAX_SAND_HEIGHT,
      };
    } else {
      // 휴식 시간: 아래쪽 모래가 줄어들고, 위쪽 모래가 차오름
      return {
        topSandHeight: (1 - progress) * MAX_SAND_HEIGHT,
        bottomSandHeight: progress * MAX_SAND_HEIGHT,
      };
    }
  }, [mode, progress]);

  const sandColor = mode === "focus" ? "#D2A679" : "#FFFFFF";
  const sandOpacity = mode === "focus" ? 0.95 : 0.85;

  return (
    <div
      className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-64 md:h-80 flex items-center justify-center"
      aria-label={t("hourglass")}
    >
      {/* 모래시계 테두리 */}
      <svg
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 0 192 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 상단 */}
        <path
          d="M 24 12 L 168 12 L 168 52 L 96 128 L 24 52 Z"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
        />
        {/* 하단 */}
        <path
          d="M 24 244 L 168 244 L 168 204 L 96 128 L 24 204 Z"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
        />
      </svg>

      {/* 모래 애니메이션 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 192 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 상단 모래 영역 - 선 안쪽으로 조정 */}
          <clipPath id="top-sand-clip">
            <path d="M 30 18 L 162 18 L 162 54 L 96 128 L 30 54 Z" />
          </clipPath>
          {/* 하단 모래 영역 - 선 안쪽으로 조정 */}
          <clipPath id="bottom-sand-clip">
            <path d="M 30 238 L 162 238 L 162 202 L 96 128 L 30 202 Z" />
          </clipPath>
        </defs>

        {/* 상단 모래 - 아래에서부터 채워짐 */}
        <rect
          x="24"
          y={TOP_SAND_BASE_Y - topSandHeight}
          width="144"
          height={topSandHeight}
          fill={sandColor}
          opacity={sandOpacity}
          clipPath="url(#top-sand-clip)"
          className="transition-all duration-1000 ease-linear"
        />

        {/* 하단 모래 - 아래에서부터 채워짐 */}
        <rect
          x="24"
          y={BOTTOM_SAND_BASE_Y - bottomSandHeight}
          width="144"
          height={bottomSandHeight}
          fill={sandColor}
          opacity={sandOpacity}
          clipPath="url(#bottom-sand-clip)"
          className="transition-all duration-1000 ease-linear"
        />

        {/* 떨어지는 모래 입자 효과 (선택사항) */}
        {mode === "focus" && progress > 0 && progress < 1 && (
          <circle
            cx="96"
            cy="128"
            r="2"
            fill="#D2A679"
            opacity="0.8"
            className="animate-ping"
          />
        )}
      </svg>
    </div>
  );
}
