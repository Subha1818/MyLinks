"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Shared scroll progress helper for a tall section.
 *
 * Writes `--progress` (0 to 1) directly as a CSS custom property on the target element
 * using a passive scroll listener throttled with requestAnimationFrame.
 *
 * Does NOT set React state on every frame to avoid unnecessary re-renders.
 * Active only when the section is near the viewport via IntersectionObserver.
 * SSR-safe and fully cleans up on unmount.
 */
export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  onProgress?: (progress: number) => void
): void {
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    let rafId: number | null = null;
    let isNear = false;

    const calculateProgress = () => {
      const rect = element.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 0) return 0;
      // 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
      const rawProgress = -rect.top / scrollableDistance;
      return Math.min(1, Math.max(0, rawProgress));
    };

    const update = () => {
      rafId = null;
      if (!element) return;
      const progress = calculateProgress();
      element.style.setProperty("--progress", progress.toFixed(4));
      onProgressRef.current?.(progress);
    };

    const onScrollOrResize = () => {
      if (!isNear) return;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isNear = entry ? entry.isIntersecting : false;
        if (isNear) {
          window.addEventListener("scroll", onScrollOrResize, { passive: true });
          window.addEventListener("resize", onScrollOrResize, { passive: true });
          update();
        } else {
          window.removeEventListener("scroll", onScrollOrResize);
          window.removeEventListener("resize", onScrollOrResize);
          if (rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
        }
      },
      {
        rootMargin: "300px 0px 300px 0px",
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [ref]);
}

function subscribeMediaQuery(query: string, callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * SSR-safe hook for prefers-reduced-motion.
 * Starts with `false` on server to prevent hydration mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery("(prefers-reduced-motion: reduce)", callback),
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false
  );
}

/**
 * SSR-safe hook for desktop viewport check (>= minWidth px).
 * Starts with `false` on server to prevent hydration mismatch.
 */
export function useIsDesktop(minWidth: number = 1024): boolean {
  const query = `(min-width: ${minWidth}px)`;
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery(query, callback),
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false
  );
}
