import { Clock, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function ApiKeyHistoryButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mt-4">
      <button
        onClick={() => navigate("/history")}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:bg-gray-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-colors duration-300 dark:bg-purple-900/50">
            <Clock className="h-4 w-4 text-purple-600 transition-colors duration-300 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-700 transition-colors duration-300 dark:text-slate-300">
              {t("history:title")}
            </h3>
            <p className="text-xs text-gray-600 transition-colors duration-300 dark:text-slate-400">
              {t("history:viewRecentTranslations")}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 transition-colors duration-300 dark:text-slate-500" />
      </button>
    </div>
  );
}
