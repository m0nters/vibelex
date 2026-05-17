import { BackButton } from "@/components/ui";
import { HistoryEntry } from "@/types";
import { formatTimestampDetail } from "@/utils";
import { Download, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HistoryDetailHeaderProps {
  entry: HistoryEntry;
  isDownloading: boolean;
  onDownload: () => void;
}

export function HistoryDetailHeader({
  entry,
  isDownloading,
  onDownload,
}: HistoryDetailHeaderProps) {
  // @ts-ignore
  const { t, i18n } = useTranslation();

  return (
    <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm transition-colors duration-300 select-none dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center space-x-2">
          <BackButton />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-800 transition-colors duration-300 dark:text-slate-300">
              {t("history:translationDetail")}
            </h1>
            <p
              className="truncate text-xs text-gray-500 transition-colors duration-300 select-text dark:text-slate-400"
              title={formatTimestampDetail(entry.timestamp, i18n.language)}
            >
              {formatTimestampDetail(entry.timestamp, i18n.language)}
            </p>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-800"
          title={t("history:downloadAsPng")}
        >
          {isDownloading ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
