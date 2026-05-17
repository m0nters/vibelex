/*
  There are two main types of translations:
  1. DictionaryEntry: Single words, compound words, fixed expressions, collocations, idioms, phrasal verbs, or terms that function as a cohesive unit in the dictionary.
  2. SentenceTranslation: For full sentence translations.
*/
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { ttsService } from "@/services";
import {
  DictionaryEntry,
  ParsedTranslation,
  SentenceTranslation,
} from "@/types";
import { isDictionaryEntry, isSentenceTranslation } from "@/utils/";
import { useEffect, useState } from "react";
import {
  DictionaryEntryRenderer,
  SentenceTranslationRenderer,
} from "./components";

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

  // Preload TTS voices for all language codes used on this page
  useEffect(() => {
    const codes = new Set<string>();

    // Main language codes (present on both dictionary entries and sentences)
    if (translation.source_tts_language_code)
      codes.add(translation.source_tts_language_code);
    if (translation.translated_tts_language_code)
      codes.add(translation.translated_tts_language_code);

    // Pronunciation variant codes (dictionary entries only, e.g. en-GB / en-US)
    if (isDictionaryEntry(translation)) {
      // as the rest have the same tts codes
      const meaning = translation.meanings[0];
      if (typeof meaning.pronunciation === "object") {
        for (const variant of Object.values(meaning.pronunciation)) {
          if (variant?.tts_code) codes.add(variant.tts_code);
        }
      }
    }

    if (codes.size > 0) ttsService.preloadVoices([...codes]);
  }, [translation]);

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
      <div className="text-gray-600 transition-colors duration-300 dark:text-slate-400">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(translation, null, 2)}
        </pre>
      </div>
    </div>
  );
}
