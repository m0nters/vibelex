/*
  There are two main types of translations:
  1. DictionaryEntry: Single words, compound words, fixed expressions, collocations, idioms, phrasal verbs, or terms that function as a cohesive unit in the dictionary.
  2. SentenceTranslation: For full sentence translations.
*/
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import {
  DictionaryEntry,
  ParsedTranslation,
  SentenceTranslation,
} from "@/types";
import { isDictionaryEntry, isSentenceTranslation } from "@/utils/";
import { useEffect, useState } from "react";
import { DictionaryEntryRenderer } from "./DictionaryEntryRenderer";
import { SentenceTranslationRenderer } from "./SentenceTranslationRenderer";

interface TranslationRendererProps {
  translation: ParsedTranslation;
  isHistoryDetailView?: boolean;
}
export function TranslationRenderer({
  translation,
  isHistoryDetailView = false,
}: TranslationRendererProps) {
  const [sourceLangCodeSetting, setSourceLangCodeSetting] = useState<string>(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );

  // Load source language code from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get("sourceLangCode", (data) => {
      if (data.sourceLangCode) {
        setSourceLangCodeSetting(data.sourceLangCode);
      }
    });
  }, []);

  if (isSentenceTranslation(translation)) {
    return (
      <SentenceTranslationRenderer
        sentenceTranslation={translation as SentenceTranslation}
        sourceLangCodeSetting={sourceLangCodeSetting}
        isHistoryDetailView={isHistoryDetailView}
      />
    );
  }

  if (isDictionaryEntry(translation)) {
    return (
      <DictionaryEntryRenderer
        dictionaryEntry={translation as DictionaryEntry}
        sourceLangCodeSetting={sourceLangCodeSetting}
        isHistoryDetailView={isHistoryDetailView}
      />
    );
  }

  // Fallback for unknown format
  return (
    <div className="dictionary-content">
      <div className="text-gray-600">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(translation, null, 2)}
        </pre>
      </div>
    </div>
  );
}
