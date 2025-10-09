"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { PomodoroSettings } from "@/types/pomodoro";

const themeOptions: Array<{ value: PomodoroSettings["theme"]; label: string }> =
  [
    { value: "hourglass", label: "모래시계" },
    { value: "coffee", label: "커피 머그" },
  ];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: SettingsDialogProps) {
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [autoStart, setAutoStart] = useState(settings.autoStart);
  const [theme, setTheme] = useState(settings.theme);

  useEffect(() => {
    setFocusDuration(settings.focusDuration);
    setBreakDuration(settings.breakDuration);
    setAutoStart(settings.autoStart);
    setTheme(settings.theme);
  }, [settings]);

  const handleSave = () => {
    onSave({
      focusDuration: Math.max(1, Math.min(120, focusDuration)),
      breakDuration: Math.max(1, Math.min(60, breakDuration)),
      autoStart,
      theme,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">설정</DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            뽀모도로 타이머 설정을 변경하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          <div className="space-y-2">
            <label htmlFor="focus-duration" className="text-sm font-medium">
              집중 시간 (분)
            </label>
            <Input
              id="focus-duration"
              type="number"
              min="1"
              max="120"
              value={focusDuration}
              onChange={(e) => setFocusDuration(parseInt(e.target.value) || 1)}
              className="bg-gray-900 border-gray-700 text-white h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="break-duration" className="text-sm font-medium">
              휴식 시간 (분)
            </label>
            <Input
              id="break-duration"
              type="number"
              min="1"
              max="60"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value) || 1)}
              className="bg-gray-900 border-gray-700 text-white h-10 sm:h-11"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="auto-start" className="text-sm font-medium">
              자동 시작
            </label>
            <Switch
              id="auto-start"
              checked={autoStart}
              onCheckedChange={setAutoStart}
            />
          </div>

          <p className="text-xs text-gray-500">
            자동 시작을 활성화하면 집중/휴식 시간이 자동으로 전환됩니다.
          </p>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">테마</p>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map(({ value, label }) => {
                const isActive = theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm sm:text-base h-10 sm:h-11"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base h-10 sm:h-11"
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
