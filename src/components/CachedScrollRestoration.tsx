import {
  useEffectOnActive,
  useKeepAliveContext,
  useLayoutEffectOnActive,
} from "keepalive-for-react";
import { useRef, type PropsWithChildren } from "react";

type ScrollPosition = {
  left: number;
  top: number;
};

/**
 * Keeps scroll positions for every cached route visit without requiring
 * individual screens to add scroll handlers or restoration code.
 */
export function CachedScrollRestoration({
  children,
}: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef(new Map<HTMLElement, ScrollPosition>());
  const { active } = useKeepAliveContext();
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffectOnActive(() => {
    const container = containerRef.current;
    if (!container) return;

    const rememberPosition = (event: Event) => {
      if (!activeRef.current || !(event.target instanceof HTMLElement)) return;

      const element = event.target;
      if (element.scrollHeight <= element.clientHeight) return;

      const { overflowY } = window.getComputedStyle(element);
      if (overflowY !== "auto" && overflowY !== "scroll" && overflowY !== "overlay") {
        return;
      }

      positionsRef.current.set(element, {
        left: element.scrollLeft,
        top: element.scrollTop,
      });
    };

    container.addEventListener("scroll", rememberPosition, true);
    return () => container.removeEventListener("scroll", rememberPosition, true);
  }, []);

  useLayoutEffectOnActive(() => {
    const frame = window.requestAnimationFrame(() => {
      for (const [element, position] of positionsRef.current) {
        if (!element.isConnected) {
          positionsRef.current.delete(element);
          continue;
        }

        element.scrollLeft = position.left;
        element.scrollTop = position.top;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
}
