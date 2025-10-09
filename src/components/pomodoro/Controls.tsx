"use client";

import { Play, Pause, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimerStatus } from "@/types/pomodoro";

interface ControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSettings: () => void;
}

export function Controls({
  status,
  onStart,
  onPause,
  onReset,
  onSettings,
}: ControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0">
      {status === "running" ? (
        <Button
          onClick={onPause}
          size="lg"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full sm:w-auto text-sm sm:text-base"
          aria-label="일시정지"
        >
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          일시정지
        </Button>
      ) : (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full sm:w-auto text-sm sm:text-base"
          aria-label={status === "paused" ? "재개" : "시작"}
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          {status === "paused" ? "재개" : "시작"}
        </Button>
      )}

      <div className="flex gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex-1 sm:flex-none text-sm sm:text-base"
          aria-label="리셋"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">리셋</span>
        </Button>

        <Button
          onClick={onSettings}
          size="lg"
          variant="outline"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex-1 sm:flex-none text-sm sm:text-base"
          aria-label="설정"
        >
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">설정</span>
        </Button>
      </div>
    </div>
  );
}
