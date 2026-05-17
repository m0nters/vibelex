import { LanguageData } from "@/types";
import { getColorForIndex } from "@/utils";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageDetailListProps {
  data: LanguageData[];
  onLanguageClick: (code: string) => void;
}

export function LanguageDetailList({
  data,
  onLanguageClick,
}: LanguageDetailListProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-gray-200 p-4 transition-colors duration-300 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-800 transition-colors duration-300 dark:text-slate-300">
          {t("statistics:detailedBreakdown")}
        </h2>
      </div>
      <div className="divide-y divide-gray-200 transition-colors duration-300 dark:divide-slate-700">
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => onLanguageClick(item.code)}
            className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            <div className="flex items-center space-x-3">
              <div
                className="h-4 w-4 shrink-0 rounded-sm"
                style={{
                  backgroundColor: getColorForIndex(index, data.length),
                }}
              />
              <span
                className="max-w-16 truncate font-medium text-gray-800 transition-colors duration-300 dark:text-slate-300"
                title={item.name}
              >
                {item.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center space-x-4 transition-colors group-hover:space-x-6">
              <span
                className="max-w-24 truncate text-sm text-gray-600 transition-colors duration-300 dark:text-slate-400"
                title={t("statistics:translations", { count: item.value })}
              >
                {t("statistics:translations", { count: item.value })}
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 transition-colors duration-300 dark:bg-indigo-900/50 dark:text-indigo-300">
                {item.percentage}%
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
