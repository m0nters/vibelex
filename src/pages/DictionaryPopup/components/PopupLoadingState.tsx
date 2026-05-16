import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PopupLoadingStateProps {
  /** Elapsed seconds since translation started, for live display. */
  loadingTime: number;
  /** Whether to show the "this is taking a while" tip (shown after ~10 s). */
  showLoadingTip: boolean;
}

export function PopupLoadingState({
  loadingTime,
  showLoadingTip,
}: PopupLoadingStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12" key="loading">
      <div className="flex items-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">{t("common:loading")}</span>
      </div>
      <div className="mt-2 text-xs text-gray-400 dark:text-slate-500">{loadingTime.toFixed(1)}s</div>
      {showLoadingTip && (
        <p className="animate-fade-in mt-4 max-w-xs text-center text-xs text-gray-400 dark:text-slate-500">
          {t("popup:loadingTip")}
        </p>
      )}
    </div>
  );
}
