"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

let progressListeners: Array<() => void> = [];

export function startProgress() {
  progressListeners.forEach((listener) => listener());
}

function useProgressBus(onStart: () => void) {
  useEffect(() => {
    progressListeners.push(onStart);

    return () => {
      progressListeners = progressListeners.filter((listener) => listener !== onStart);
    };
  }, [onStart]);
}

export function TopProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(8);

    intervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return 88;
        }

        return current + Math.random() * 12;
      });
    }, 180);
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      timeoutRef.current = null;
    }, 350);
  }, [clearTimers]);

  useProgressBus(start);

  useEffect(() => {
    const id = setTimeout(complete, 0);

    return () => clearTimeout(id);
  }, [complete, pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || target === "_blank") {
        return;
      }

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) {
        return;
      }

      start();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [clearTimers, start]);

  if (!visible) {
    return null;
  }

  return <div className="top-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} aria-hidden="true" />;
}
