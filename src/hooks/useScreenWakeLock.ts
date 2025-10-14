"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (
    type: "release",
    listener: (this: WakeLockSentinel, ev: Event) => unknown,
    options?: boolean | AddEventListenerOptions
  ) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinel>;
  };
};

const getWakeLockNavigator = () =>
  (typeof navigator !== "undefined"
    ? (navigator as WakeLockNavigator)
    : undefined);

const toError = (value: unknown) =>
  value instanceof Error
    ? value
    : new Error(typeof value === "string" ? value : "Wake Lock request failed");

export function useScreenWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldHoldRef = useRef(false);
  const isRequestingRef = useRef(false);

  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const nav = getWakeLockNavigator();
    setIsSupported(Boolean(nav?.wakeLock?.request));
  }, []);

  const requestWakeLock = useCallback(async () => {
    const nav = getWakeLockNavigator();
    if (!nav?.wakeLock?.request || isRequestingRef.current) {
      return wakeLockRef.current !== null;
    }

    if (wakeLockRef.current) {
      return true;
    }

    isRequestingRef.current = true;
    try {
      const sentinel = await nav.wakeLock.request("screen");
      sentinel.addEventListener("release", () => {
        wakeLockRef.current = null;
        setIsActive(false);
        if (
          shouldHoldRef.current &&
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          void requestWakeLock();
        }
      });

      wakeLockRef.current = sentinel;
      setIsActive(true);
      setError(null);
      return true;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setIsActive(false);
      wakeLockRef.current = null;
      return false;
    } finally {
      isRequestingRef.current = false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    shouldHoldRef.current = false;
    setError(null);

    if (!wakeLockRef.current) {
      setIsActive(false);
      return;
    }

    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;
    try {
      await sentinel.release();
    } catch (err) {
      setError(toError(err));
    } finally {
      setIsActive(false);
    }
  }, []);

  const acquire = useCallback(async () => {
    shouldHoldRef.current = true;
    setError(null);

    if (!isSupported) {
      return false;
    }

    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return true;
    }

    return requestWakeLock();
  }, [isSupported, requestWakeLock]);

  const release = useCallback(async () => {
    await releaseWakeLock();
  }, [releaseWakeLock]);

  useEffect(() => {
    if (!isSupported || typeof document === "undefined") {
      return;
    }

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        shouldHoldRef.current &&
        !wakeLockRef.current
      ) {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isSupported, requestWakeLock]);

  useEffect(
    () => () => {
      shouldHoldRef.current = false;
      if (wakeLockRef.current) {
        void wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    },
    []
  );

  return {
    isSupported,
    isActive,
    error,
    acquire,
    release,
  };
}
