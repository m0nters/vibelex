import { ParsedTranslation } from "@/types";
import React from "react";
import { TranslationRenderer } from "../../TranslationRenderer";

interface HistoryDetailContentProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  translation: ParsedTranslation;
}

export function HistoryDetailContent({
  contentRef,
  translation,
}: HistoryDetailContentProps) {
  return (
    <div className="flex-1 p-4">
      <div
        ref={contentRef}
        className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <TranslationRenderer
          translation={translation}
          isHistoryDetailView={true}
        />
      </div>
    </div>
  );
}
