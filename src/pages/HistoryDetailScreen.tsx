import { BackButton } from "@/components";
import { HistoryEntry } from "@/types";
import { formatTimestampDetail } from "@/utils";
import { toPng } from "html-to-image";
import { Download, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { DictionaryRenderer } from "./DictionaryRenderer";

export function HistoryDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const entry = location.state?.entry as HistoryEntry;
  // @ts-ignore
  const { t, i18n } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const dataUrl = await toPng(contentRef.current, {
        quality: 1,
        pixelRatio: 3,
      });

      const link = document.createElement("a");
      const fileName = entry.id;
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // If no entry is found, navigate back to history
  if (!entry) {
    navigate("/history");
    return null;
  }

  console.log(entry);

  return (
    <div className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-indigo-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex min-w-0 items-center space-x-2">
            <BackButton />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-800">
                {t("history:translationDetail")}
              </h1>
              <p
                className="truncate text-xs text-gray-500"
                title={formatTimestampDetail(entry.timestamp, i18n.language)}
              >
                {formatTimestampDetail(entry.timestamp, i18n.language)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
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

      {/* Content */}
      <div className="flex-1 p-4">
        <div
          ref={contentRef}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-xl backdrop-blur-sm"
        >
          <DictionaryRenderer
            translation={entry.translation}
            isHistoryDetailView={true}
          />
        </div>
      </div>
    </div>
  );
}
