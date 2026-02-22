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
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm select-text">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {t("statistics:totalTranslations")}
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {totalEntries.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            {t(
              activeTab === "source"
                ? "statistics:sourceLanguages"
                : "statistics:targetLanguages",
            )}
          </p>
          <p className="text-2xl font-bold text-purple-600">{languageCount}</p>
        </div>
      </div>
    </div>
  );
}
