"use client";

import { Play, Pause, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("pomodoro.controls");

  const startLabel =
    status === "paused" ? t("resume") : t("start");
  const startAria =
    status === "paused" ? t("aria.resume") : t("aria.start");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0">
      {status === "running" ? (
        <Button
          onClick={onPause}
          size="lg"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full sm:w-auto text-sm sm:text-base"
          aria-label={t("aria.pause")}
        >
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("pause")}
        </Button>
      ) : (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full sm:w-auto text-sm sm:text-base"
          aria-label={startAria}
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          {startLabel}
        </Button>
      )}

      <div className="flex gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex-1 sm:flex-none text-sm sm:text-base"
          aria-label={t("aria.reset")}
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{t("reset")}</span>
        </Button>

        <Button
          onClick={onSettings}
          size="lg"
          variant="outline"
          className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 flex-1 sm:flex-none text-sm sm:text-base"
          aria-label={t("aria.settings")}
        >
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </Button>
      </div>
    </div>
  );
}
