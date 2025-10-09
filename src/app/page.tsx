"use client";

import { useState, useEffect, useMemo } from "react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { PomodoroVisualizer } from "@/components/pomodoro/PomodoroVisualizer";
import { Timer } from "@/components/pomodoro/Timer";
import { Controls } from "@/components/pomodoro/Controls";
import { SettingsDialog } from "@/components/pomodoro/SettingsDialog";
import { Bell } from "lucide-react";

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
  } = usePomodoro();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // 알림 권한 확인
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 진행도 계산 (0 ~ 1)
  const progress = useMemo(() => {
    const totalTime =
      mode === "focus"
        ? settings.focusDuration * 60
        : settings.breakDuration * 60;
    return totalTime > 0 ? timeLeft / totalTime : 0;
  }, [mode, timeLeft, settings]);

  // 알림 권한 요청 핸들러
  const handleNotificationRequest = async () => {
    await requestNotificationPermission();
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* 헤더 */}
      <div className="absolute top-4 sm:top-8 left-0 right-0 flex justify-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
          zeropamine
        </h1>
      </div>

      {/* 알림 권한 요청 배너 */}
      {notificationPermission === "default" && (
        <div className="absolute top-16 sm:top-20 left-4 right-4 sm:left-auto sm:right-auto sm:mx-auto max-w-md px-2 sm:px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 text-xs sm:text-sm text-white">
              <p className="font-medium">알림 받기</p>
              <p className="text-gray-300 text-xs hidden sm:block">
                타이머 종료 시 알림을 받으시겠습니까?
              </p>
            </div>
            <button
              onClick={handleNotificationRequest}
              className="px-2 sm:px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
            >
              허용
            </button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12 max-w-2xl w-full mt-16 sm:mt-0">
        {/* 테마 비주얼 */}
        <PomodoroVisualizer
          mode={mode}
          progress={progress}
          theme={settings.theme}
        />

        {/* 타이머 */}
        <Timer mode={mode} timeLeft={timeLeft} />

        {/* 컨트롤 버튼 */}
        <Controls
          status={status}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onSettings={() => setSettingsOpen(true)}
        />

        {/* 현재 설정 표시 */}
        <div className="text-center text-xs sm:text-sm text-gray-400">
          <p>
            집중 {settings.focusDuration}분 · 휴식 {settings.breakDuration}분
            {settings.autoStart && " · 자동 시작"}
          </p>
        </div>
      </div>

      {/* 설정 다이얼로그 */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={updateSettings}
      />

      {/* 푸터 */}
      <footer className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm px-4">
        <p>집중력을 위한 뽀모도로 타이머</p>
      </footer>
    </main>
  );
}
