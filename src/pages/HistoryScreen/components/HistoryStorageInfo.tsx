import { ChartPie, HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HistoryStorageInfoProps {
  historyEntryCount: number;
  historySize: string;
  historySizeUnit: string;
  isFromStatistics: boolean;
  onNavigateToStatistics: () => void;
}

export function HistoryStorageInfo({
  historyEntryCount,
  historySize,
  historySizeUnit,
  isFromStatistics,
  onNavigateToStatistics,
}: HistoryStorageInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[118px] z-10 mx-4 mt-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Statistics / Storage Usage Toggle Title */}
        {!isFromStatistics ? (
          <div
            className="group relative flex w-40 cursor-pointer overflow-hidden"
            onClick={onNavigateToStatistics}
          >
            <div
              className="absolute left-0 flex w-40 -translate-x-40 items-center space-x-2 transition-transform duration-300 group-hover:translate-x-0"
              title={t("statistics:statistics")}
            >
              <ChartPie className="h-4 w-4 shrink-0 text-indigo-600" />
              <span className="truncate text-sm font-medium text-indigo-600">
                {t("statistics:statistics")}
              </span>
            </div>
            <div
              className="flex w-40 translate-x-0 items-center justify-start space-x-2 transition-transform duration-300 group-hover:translate-x-40"
              title={t("history:storageUsage")}
            >
              <HardDrive className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="truncate text-sm font-medium text-gray-700">
                {t("history:storageUsage")}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex w-40 items-center justify-start space-x-2"
            title={t("history:storageUsage")}
          >
            <HardDrive className="h-4 w-4 shrink-0 text-gray-500" />
            <span className="truncate text-sm font-medium text-gray-700">
              {t("history:storageUsage")}
            </span>
          </div>
        )}

        {/* Storage Usage Details on mobile */}
        <div className="flex items-center space-x-3 text-xs text-gray-600 select-text sm:hidden">
          <span
            className="max-w-16 truncate"
            title={t("history:entriesCount", { count: historyEntryCount })}
          >
            {t("history:entriesCount", { count: historyEntryCount })}
          </span>
          <span
            className="max-w-16 truncate font-medium"
            title={`${historySize} ${historySizeUnit}`}
          >
            {historySize} {historySizeUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
