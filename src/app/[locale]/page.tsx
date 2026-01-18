"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { PomodoroVisualizer } from "@/components/pomodoro/PomodoroVisualizer";
import { Timer } from "@/components/pomodoro/Timer";
import { Controls } from "@/components/pomodoro/Controls";
import { SettingsDialog } from "@/components/pomodoro/SettingsDialog";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { usePomodoro } from "@/hooks/usePomodoro";
import { Link } from "@/i18n/routing";

export default function Home() {
  const {
    mode,
    status,
    timeLeft,
    settings,
    start,
    pause,
    reset,
    updateSettings,
    requestNotificationPermission,
    playCompletionSound,
    startTenSecondTest,
    previewSound,
    stopPreviewSound,
  } = usePomodoro();

  const tPage = useTranslations("pomodoro.page");
  const tCommon = useTranslations("common");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const isDebug = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const progress = useMemo(() => {
    const totalTime =
      mode === "focus"
        ? settings.focusDuration * 60
        : settings.breakDuration * 60;
    return totalTime > 0 ? timeLeft / totalTime : 0;
  }, [mode, timeLeft, settings]);

  const focusProgress = useMemo(
    () => Math.min(1, Math.max(0, progress)),
    [progress]
  );
  const breakProgress = useMemo(
    () => Math.min(1, Math.max(0, 1 - progress)),
    [progress]
  );
  const displayProgress = mode === "focus" ? focusProgress : breakProgress;
  const progressPercentage = Math.round(displayProgress * 100);

  const handleNotificationRequest = useCallback(async () => {
    await requestNotificationPermission();
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [requestNotificationPermission]);

  return (
    <main className="bg-[#20212E] flex flex-col items-center">
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <header className="absolute top-4 sm:top-8 left-0 right-0 flex justify-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            {tPage("headline")}
          </h1>
        </header>

        {/* {notificationPermission === "default" && (
          <div className="absolute top-16 sm:top-20 left-4 right-4 sm:left-auto sm:right-auto sm:mx-auto max-w-md px-2 sm:px-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1 text-xs sm:text-sm text-white">
                <p className="font-medium">{tPage("notifications.title")}</p>
                <p className="text-gray-300 text-xs hidden sm:block">
                  {tPage("notifications.description")}
                </p>
              </div>
              <button
                onClick={handleNotificationRequest}
                className="px-2 sm:px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
              >
                {tPage("notifications.allow")}
              </button>
            </div>
          </div>
        )} */}

        <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12 max-w-2xl w-full mt-16 sm:mt-16">
          <PomodoroVisualizer
            mode={mode}
            progress={progress}
            theme={settings.theme}
          />

          <Timer mode={mode} timeLeft={timeLeft} />

          <div
            role="progressbar"
            aria-label={tPage("progress.ariaLabel")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            aria-valuetext={tPage("progress.ariaValue", {
              value: progressPercentage,
            })}
            className="w-full max-w-md h-3 sm:h-4 bg-white/10 border border-white/10 rounded-full overflow-hidden shadow-inner"
          >
            <div
              className={`h-full transition-all duration-700 ease-linear ${
                mode === "focus" ? "bg-amber-400/90" : "bg-white/80"
              }`}
              style={{ width: `${displayProgress * 100}%` }}
            />
          </div>

          <Controls
            status={status}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSettings={() => setSettingsOpen(true)}
          />

          {isDebug && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={playCompletionSound}
                className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                {tPage("debug.sound")}
              </button>
              <button
                type="button"
                onClick={startTenSecondTest}
                className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                {tPage("debug.tenSeconds")}
              </button>
            </div>
          )}

          <div className="text-center text-xs sm:text-sm text-gray-400">
            <p>
              {tPage("currentSettings", {
                focus: settings.focusDuration,
                break: settings.breakDuration,
                autoStart: settings.autoStart ? "true" : "false",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 sm:px-6 py-12 sm:py-16 text-center text-gray-900 space-y-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {tPage("sectionTitle")}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            {tPage("description")}
          </p>
          <ul className="text-left text-sm sm:text-base leading-relaxed text-gray-600 space-y-2 sm:space-y-3 list-disc list-inside sm:list-outside sm:pl-6">
            <li>{tPage("list.customize")}</li>
            <li>{tPage("list.visual")}</li>
          </ul>
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            {tPage("cta")}
          </p>

          <footer className="pt-6 text-center text-gray-500 text-xs sm:text-sm">
            <p>{tPage("footer")}</p>
            <div className="mt-2 space-x-2 sm:space-x-4">
              <Link href="/privacy" className="hover:underline">
                {tCommon("footer.privacy")}
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms" className="hover:underline">
                {tCommon("footer.terms")}
              </Link>
              <span className="text-gray-400">•</span>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="hover:underline"
              >
                {tCommon("footer.contact")}
              </button>
            </div>
          </footer>
        </div>
      </section>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={updateSettings}
        onPreviewSound={previewSound}
        onStopPreview={stopPreviewSound}
      />

      <ContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
      />
    </main>
  );
}
