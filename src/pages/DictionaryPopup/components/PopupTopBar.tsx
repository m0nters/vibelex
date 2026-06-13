import { Moon, Sun, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

interface PopupTopBarProps {
  /** Final elapsed seconds recorded after loading completes. Null while loading or before first translation. */
  finalLoadingTime: number | null;
  isLoading: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClose: () => void;
}

export function PopupTopBar({
  finalLoadingTime,
  isLoading,
  isDarkMode,
  onToggleDarkMode,
  onClose,
}: PopupTopBarProps) {
  const { t } = useTranslation();
  const isDragging = useRef(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // Only left-click
    if (e.button !== 0) return;
    e.preventDefault(); // prevent text selection
    isDragging.current = true;

    window.parent.postMessage(
      {
        type: "POPUP_DRAG_START",
        clientX: e.clientX,
        clientY: e.clientY,
      },
      "*",
    );

    // Listen for mouseup inside the iframe to reset cursor
    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between border-b border-indigo-100 bg-white/70 px-4 py-2 backdrop-blur-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70"
      id="popup-top-bar"
    >
      {/* Drag handle area - everything except the buttons */}
      <div
        className="flex min-w-0 flex-1 cursor-grab items-center self-stretch active:cursor-grabbing"
        onMouseDown={handleDragStart}
        data-testid="drag-handle"
      >
        {/* Show final loading time after translation completes */}
        {!isLoading && finalLoadingTime !== null && (
          <div className="truncate text-xs text-gray-400 transition-colors duration-300 dark:text-slate-400">
            {t("popup:thoughtFor", { time: finalLoadingTime.toFixed(1) })}
          </div>
        )}
      </div>

      {/* Dark mode toggle — stopPropagation prevents drag */}
      <button
        id="popup-dark-mode-toggle"
        onClick={onToggleDarkMode}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex cursor-pointer rounded-full p-2 text-gray-400 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        aria-label={isDarkMode ? t("lightMode") : t("darkMode")}
        title={isDarkMode ? t("lightMode") : t("darkMode")}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {/* Close button — stopPropagation prevents drag */}
      <button
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex cursor-pointer rounded-full p-2 text-gray-400 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        aria-label={t("close")}
        title={t("close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
