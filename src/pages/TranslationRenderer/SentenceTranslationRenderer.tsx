import { CopyButton, SpeakerButton } from "@/components";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { useScrollContainer } from "@/contexts/ScrollContainerContext";
import { SentenceTranslation } from "@/types";
import { renderText } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

/**
 * Collapsible text section component
 */
function CollapsibleTextSection({
  text,
  isInitiallyExpanded = true,
  className = "",
}: {
  text: string;
  isInitiallyExpanded?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useScrollContainer();

  // Only enable sticky behavior for history detail view (which has scrollable content)
  // Dictionary popup doesn't scroll internally, so skip sticky logic
  useEffect(() => {
    const scrollableParent = scrollContainerRef?.current;
    if (!scrollableParent) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setIsSticky(containerRect.bottom > 200);
    };

    scrollableParent.addEventListener("scroll", handleScroll);

    handleScroll(); // Initial check

    return () => {
      scrollableParent.removeEventListener("scroll", handleScroll);
    };
  }, [isExpanded, scrollContainerRef]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-start ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`shrink-0 cursor-pointer rounded-full bg-blue-400 transition-all duration-300 ease-in-out ${isExpanded ? "mt-1 mr-2 h-6 w-1" : "mt-2 mr-0 h-3 w-3 -translate-x-1"}`}
      />
      <div className="mr-2 min-w-0 flex-1">
        <p
          className={`text-base leading-relaxed font-medium wrap-break-word whitespace-pre-wrap text-gray-800 ${
            !isExpanded ? "line-clamp-1" : ""
          }`}
        >
          {renderText(text)}
        </p>
      </div>
      <CopyButton
        text={text}
        className={`shrink-0 ${isSticky ? "sticky top-20" : ""}`}
      />
    </div>
  );
}

interface SentenceTranslationRendererProps {
  sentenceTranslation: SentenceTranslation;
  sourceLangCodeSetting: string;
  isHistoryDetailView?: boolean;
}

export function SentenceTranslationRenderer({
  sentenceTranslation,
  sourceLangCodeSetting,
  isHistoryDetailView = false,
}: SentenceTranslationRendererProps) {
  return (
    <div className="dictionary-content">
      {!isHistoryDetailView && (
        <SourceLanguageRenderer
          sourceLangCode={sentenceTranslation.source_language_code}
          isAutoDetected={
            sourceLangCodeSetting === DEFAULT_SOURCE_LANGUAGE_CODE
          }
          mainCountryCode={
            sentenceTranslation.source_language_main_country_code
          }
        />
      )}
      {sentenceTranslation.source_tts_language_code && (
        <SpeakerButton
          word={sentenceTranslation.text}
          ttsCode={sentenceTranslation.source_tts_language_code}
          className="-translate-x-3"
        />
      )}
      <CollapsibleTextSection
        text={sentenceTranslation.text}
        isInitiallyExpanded={isHistoryDetailView}
      />
      {sentenceTranslation.translated_tts_language_code && (
        <SpeakerButton
          word={sentenceTranslation.translation}
          ttsCode={sentenceTranslation.translated_tts_language_code}
          className="-translate-x-3"
        />
      )}
      <CollapsibleTextSection text={sentenceTranslation.translation} />
    </div>
  );
}
