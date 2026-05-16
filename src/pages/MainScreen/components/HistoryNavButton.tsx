import { ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface HistoryNavButtonProps {
  extensionEnabled: boolean;
}

export function HistoryNavButton({ extensionEnabled }: HistoryNavButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mt-4">
      <button
        onClick={() => navigate("/history")}
        disabled={!extensionEnabled}
        className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all duration-300 ${
          !extensionEnabled
            ? "cursor-not-allowed border-gray-300/30 bg-gray-100/70 dark:border-slate-700/30 dark:bg-slate-800/70"
            : "cursor-pointer border-gray-200 bg-gray-50 hover:bg-gray-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${
              !extensionEnabled ? "bg-gray-300/50 dark:bg-slate-700/50" : "bg-purple-100 dark:bg-purple-900/50"
            }`}
          >
            <Clock
              className={`h-4 w-4 transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400 dark:text-slate-500" : "text-purple-600 dark:text-purple-400"
              }`}
            />
          </div>
          <div className="text-left">
            <h3
              className={`text-sm font-semibold transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-300"
              }`}
            >
              {t("history:title")}
            </h3>
            <p
              className={`text-xs transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-400"
              }`}
            >
              {t("history:viewRecentTranslations")}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`h-5 w-5 transition-colors duration-300 ${
            !extensionEnabled ? "text-gray-300 dark:text-slate-600" : "text-gray-400 dark:text-slate-500"
          }`}
        />
      </button>
    </div>
  );
}
