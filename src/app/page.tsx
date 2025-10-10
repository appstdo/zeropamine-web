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
    playCompletionSound,
    startTenSecondTest,
    previewSound,
    stopPreviewSound,
  } = usePomodoro();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const isDebug = process.env.NODE_ENV !== "production";

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

  // 알림 권한 요청 핸들러
  // const handleNotificationRequest = async () => {
  //   await requestNotificationPermission();
  //   if (typeof window !== "undefined" && "Notification" in window) {
  //     setNotificationPermission(Notification.permission);
  //   }
  // };

  return (
    <main className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center">
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        {/* 헤더 */}
        <header className="absolute top-4 sm:top-8 left-0 right-0 flex justify-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            zeropamine
          </h1>
        </header>

        {/* 알림 권한 요청 배너 */}
        {/* {notificationPermission === "default" && (
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
        )} */}

        {/* 메인 컨텐츠 */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12 max-w-2xl w-full mt-16 sm:mt-16">
          {/* 테마 비주얼 */}
          <PomodoroVisualizer
            mode={mode}
            progress={progress}
            theme={settings.theme}
          />

          {/* 타이머 */}
          <Timer mode={mode} timeLeft={timeLeft} />

          <div
            role="progressbar"
            aria-label="타이머 진행도"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            aria-valuetext={`진행률 ${progressPercentage}%`}
            className="w-full max-w-md h-3 sm:h-4 bg-white/10 border border-white/10 rounded-full overflow-hidden shadow-inner"
          >
            <div
              className={`h-full transition-all duration-700 ease-linear ${
                mode === "focus" ? "bg-amber-400/90" : "bg-white/80"
              }`}
              style={{ width: `${displayProgress * 100}%` }}
            />
          </div>

          {/* 컨트롤 버튼 */}
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
                디버그: 소리 테스트
              </button>
              <button
                type="button"
                onClick={startTenSecondTest}
                className="px-3 py-1 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                디버그: 10초 테스트
              </button>
            </div>
          )}

          {/* 현재 설정 표시 */}
          <div className="text-center text-xs sm:text-sm text-gray-400">
            <p>
              집중 {settings.focusDuration}분 · 휴식 {settings.breakDuration}분
              {settings.autoStart && " · 자동 시작"}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-4 sm:px-6 py-12 sm:py-16 text-center text-gray-900 space-y-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            뽀모도로 타이머로 집중 루틴을 설계하세요
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            zeropamine은 집중과 휴식을 번갈아 가며 반복하는 뽀모도로 기법을
            바탕으로 설계된 온라인 타이머입니다. 직관적인 인터페이스와
            애니메이션을 통해 공부, 코딩, 업무 등 다양한 상황에서 몰입 상태를
            쉽게 유지하도록 도와줍니다.
          </p>
          <ul className="text-left text-sm sm:text-base leading-relaxed text-gray-600 space-y-2 sm:space-y-3 list-disc list-inside sm:list-outside sm:pl-6">
            <li>집중/휴식 시간을 자유롭게 조절하며 자신만의 루틴을 구축</li>
            <li>다양한 테마와 진행도 애니메이션으로 남은 시간 직관적 확인</li>
            {/* <li>알림 권한과 사운드를 통해 세션 종료를 놓치지 않고 즉시 재시작</li> */}
          </ul>
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            오늘 바로 zeropamine 뽀모도로 타이머로 하루의 집중력을 설계하고,
            계획한 목표를 끝까지 완주해 보세요.
          </p>

          {/* 푸터 */}
          <footer className="pt-6 text-center text-gray-500 text-xs sm:text-sm">
            <p>집중력을 위한 뽀모도로 타이머</p>
          </footer>
        </div>
      </section>

      {/* 설정 다이얼로그 */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={updateSettings}
        onPreviewSound={previewSound}
        onStopPreview={stopPreviewSound}
      />
    </main>
  );
}
