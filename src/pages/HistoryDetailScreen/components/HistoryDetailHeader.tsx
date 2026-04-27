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
    <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm select-none">
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center space-x-2">
          <BackButton />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-800">
              {t("history:translationDetail")}
            </h1>
            <p
              className="truncate text-xs text-gray-500 select-text"
              title={formatTimestampDetail(entry.timestamp, i18n.language)}
            >
              {formatTimestampDetail(entry.timestamp, i18n.language)}
            </p>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
          title={t("history:downloadAsPng")}
        >
          {isDownloading ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
