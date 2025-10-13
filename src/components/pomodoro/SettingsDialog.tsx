"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import type { PomodoroSettings, TimerMode } from "@/types/pomodoro";
import { CoffeeMug } from "./CoffeeMug";
import { Hourglass } from "./Hourglass";

const PREVIEW_MODE_SEQUENCE: TimerMode[] = [
  "focus",
  "focus",
  "break",
  "break",
];

const PREVIEW_PROGRESS_SEQUENCE = [1, 0, 1, 0] as const;

function ThemePreview({ theme }: { theme: PomodoroSettings["theme"] }) {
  const [step, setStep] = useState(0);
  const totalSteps = PREVIEW_MODE_SEQUENCE.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [totalSteps]);

  const previewMode = PREVIEW_MODE_SEQUENCE[step];
  const previewProgress = PREVIEW_PROGRESS_SEQUENCE[step];

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center overflow-hidden">
      <div className="flex items-center justify-center w-full h-full">
        <div className="pointer-events-none transform scale-[0.22] sm:scale-[0.26] origin-center">
          {theme === "coffee" ? (
            <CoffeeMug mode={previewMode} progress={previewProgress} />
          ) : (
            <Hourglass mode={previewMode} progress={previewProgress} />
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onPreviewSound: (
    soundType: PomodoroSettings["soundType"],
    volume: number
  ) => void;
  onStopPreview: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
  onPreviewSound,
  onStopPreview,
}: SettingsDialogProps) {
  const tSettings = useTranslations("pomodoro.settings");
  const tTheme = useTranslations("pomodoro.theme");
  const tSound = useTranslations("pomodoro.sound");

  const [focusDuration, setFocusDuration] = useState(settings.focusDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [autoStart, setAutoStart] = useState(settings.autoStart);
  const [theme, setTheme] = useState(settings.theme);
  const [soundType, setSoundType] = useState(settings.soundType);
  const [volume, setVolume] = useState(settings.volume);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onStopPreview();
    }
    onOpenChange(next);
  };

  useEffect(() => {
    setFocusDuration(settings.focusDuration);
    setBreakDuration(settings.breakDuration);
    setAutoStart(settings.autoStart);
    setTheme(settings.theme);
    setSoundType(settings.soundType);
    setVolume(settings.volume);
  }, [settings]);

  useEffect(() => {
    if (!open) {
      onStopPreview();
    }
  }, [open, onStopPreview]);

  useEffect(
    () => () => {
      onStopPreview();
    },
    [onStopPreview]
  );

  const handleSoundSelect = (value: PomodoroSettings["soundType"]) => {
    setSoundType(value);
    onPreviewSound(value, volume);
  };

  const handleVolumeChange = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setVolume(clamped);
    onPreviewSound(soundType, clamped);
  };

  const handleSave = () => {
    onSave({
      focusDuration: Math.max(1, Math.min(120, focusDuration)),
      breakDuration: Math.max(1, Math.min(60, breakDuration)),
      autoStart,
      theme,
      soundType,
      volume: Math.max(0, Math.min(1, volume)),
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md bg-gray-800 text-white border-gray-700 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {tSettings("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            {tSettings("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <label htmlFor="focus-duration" className="text-sm font-medium">
              {tSettings("focusDuration.label")}
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
              {tSettings("breakDuration.label")}
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
              {tSettings("autoStart.label")}
            </label>
            <Switch
              id="auto-start"
              checked={autoStart}
              onCheckedChange={setAutoStart}
            />
          </div>

          <p className="text-xs text-gray-500">
            {tSettings("autoStart.hint")}
          </p>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">
              {tSettings("theme.label")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["coffee", "hourglass"] as const).map((value) => {
                const label = tTheme(value);
                const isActive = theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors flex flex-col items-center gap-2 ${
                      isActive
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    <ThemePreview theme={value} />
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">
              {tSettings("sound.label")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["alarm", "bell"] as const).map((value) => {
                const label = tSound(`${value}.label`);
                const description = tSound(`${value}.description`);
                const isActive = soundType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSoundSelect(value)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="block font-medium">{label}</span>
                    <span className="text-xs text-gray-400">{description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="volume" className="text-sm font-medium">
              {tSettings("volume.label")}
            </label>
            <div className="flex items-center gap-3">
              <input
                id="volume"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(volume * 100)}
                onChange={(e) =>
                  handleVolumeChange(Number(e.target.value) / 100)
                }
                className="flex-1 accent-amber-400"
              />
              <span className="w-12 text-right text-xs text-gray-400">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {tSettings("volume.hint")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 pt-2">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm sm:text-base h-10 sm:h-11"
          >
            {tSettings("actions.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base h-10 sm:h-11"
          >
            {tSettings("actions.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
