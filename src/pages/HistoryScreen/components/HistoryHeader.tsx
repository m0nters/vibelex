import { BackButton, ConfirmDialog } from "@/components";
import { clearHistory } from "@/services";
import { Clock, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HistoryHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasEntries: boolean;
  onCleared: () => void;
}

export function HistoryHeader({
  searchQuery,
  setSearchQuery,
  hasEntries,
  onCleared,
}: HistoryHeaderProps) {
  const { t } = useTranslation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmClearHistory = async () => {
    try {
      await clearHistory();
      onCleared();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BackButton />
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-semibold text-gray-800 dark:text-slate-300">
                {t("history:title")}
              </h1>
            </div>
          </div>

          {hasEntries && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex cursor-pointer items-center space-x-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-500 transition-all duration-200 hover:bg-red-100 hover:shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">{t("history:clearAll")}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("history:searchPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pr-10 pl-10 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmClearHistory}
        title={t("history:confirmClearAllTitle")}
        message={t("history:confirmClearAllMessage")}
        confirmText={t("history:clearAll")}
        cancelText={t("common:cancel")}
        variant="danger"
      />
    </>
  );
}
