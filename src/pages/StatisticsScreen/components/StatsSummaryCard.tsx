import { TabType } from "@/types";
import { useTranslation } from "react-i18next";

interface StatsSummaryCardProps {
  totalEntries: number;
  activeTab: TabType;
  languageCount: number;
}

export function StatsSummaryCard({
  totalEntries,
  activeTab,
  languageCount,
}: StatsSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 select-text dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 transition-colors duration-300 dark:text-slate-400">
            {t("statistics:totalTranslations")}
          </p>
          <p className="text-2xl font-bold text-indigo-600 transition-colors duration-300 dark:text-indigo-400">
            {totalEntries.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 transition-colors duration-300 dark:text-slate-400">
            {t(
              activeTab === "source"
                ? "statistics:sourceLanguages"
                : "statistics:targetLanguages",
            )}
          </p>
          <p className="text-2xl font-bold text-purple-600 transition-colors duration-300 dark:text-purple-400">
            {languageCount}
          </p>
        </div>
      </div>
    </div>
  );
}
