import { BackButton } from "@/components";
import { TabType } from "@/types/statistics";
import { ChartPie } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatisticsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function StatisticsHeader({
  activeTab,
  onTabChange,
}: StatisticsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <BackButton />
          <div className="flex items-center space-x-2">
            <ChartPie className="h-5 w-5 text-indigo-600" />
            <h1 className="text-lg font-semibold text-gray-800">
              {t("statistics:title")}
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-gray-200 bg-white/50">
        <button
          onClick={() => onTabChange("source")}
          className={`flex-1 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "source"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {t("statistics:sourceLanguages")}
        </button>
        <button
          onClick={() => onTabChange("target")}
          className={`flex-1 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "target"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {t("statistics:targetLanguages")}
        </button>
      </div>
    </div>
  );
}
