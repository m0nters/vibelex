import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PopupTopBarProps {
  /** Final elapsed seconds recorded after loading completes. Null while loading or before first translation. */
  finalLoadingTime: number | null;
  isLoading: boolean;
  onClose: () => void;
}

export function PopupTopBar({
  finalLoadingTime,
  isLoading,
  onClose,
}: PopupTopBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between bg-white/70 px-4 py-2 backdrop-blur-sm transition-colors duration-300 dark:bg-slate-900/70"
      id="close-button"
    >
      {/* Show final loading time after translation completes */}
      {!isLoading && finalLoadingTime !== null && (
        <div className="text-xs text-gray-400 transition-colors duration-300 dark:text-slate-400">
          {t("popup:thoughtFor", { time: finalLoadingTime.toFixed(1) })}
        </div>
      )}
      <div className="flex-1"></div>
      <button
        onClick={onClose}
        className="flex cursor-pointer rounded-full p-2 text-gray-400 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
