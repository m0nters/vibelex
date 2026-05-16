import { ScrollContainerContext } from "@/contexts/ScrollContainerContext";
import { HistoryEntry } from "@/types";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HistoryDetailContent, HistoryDetailHeader } from "./components";

export function HistoryDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const entry = location.state?.entry as HistoryEntry;
  const contentRef = useRef<HTMLDivElement>(null); // for html-to-image
  const scrollContainerRef = useRef<HTMLDivElement>(null); // for scroll event
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
      link.download = `${entry.id}.png`;
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

  return (
    // why Provider?
    // basically inside this component, there's component called
    // `CollapsibleTextSection` which needs to know the scroll position of the
    // parent container (this component) to determine when to apply sticky
    // behavior to the copy button. By providing the scroll container ref
    // through context, we can allow `CollapsibleTextSection` to listen to scroll
    // events and update its state accordingly, without having to pass down
    // props through multiple levels of components.
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      <div
        ref={scrollContainerRef}
        className="animate-slide-in-right h-full w-full overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 dark:text-slate-300"
      >
        <HistoryDetailHeader
          entry={entry}
          isDownloading={isDownloading}
          onDownload={handleDownload}
        />

        <HistoryDetailContent
          contentRef={contentRef}
          translation={entry.translation}
        />
      </div>
    </ScrollContainerContext.Provider>
  );
}
