import { MeaningEntryRenderer, VerbFormsRenderer } from "@/components";
import { DEFAULT_SOURCE_LANGUAGE_CODE } from "@/constants";
import { DictionaryEntry } from "@/types";
import { SourceLanguageRenderer } from "./SourceLanguageRenderer";

interface DictionaryEntryRendererProps {
  dictionaryEntry: DictionaryEntry;
  sourceLangCodeSetting: string;
  isHistoryDetailView?: boolean;
}

export function DictionaryEntryRenderer({
  dictionaryEntry,
  sourceLangCodeSetting,
  isHistoryDetailView = false,
}: DictionaryEntryRendererProps) {
  return (
    <div className="dictionary-content">
      {!isHistoryDetailView && (
        <SourceLanguageRenderer
          sourceLangCode={dictionaryEntry.source_language_code}
          isAutoDetected={
            sourceLangCodeSetting === DEFAULT_SOURCE_LANGUAGE_CODE
          }
          mainCountryCode={dictionaryEntry.source_language_main_country_code}
        />
      )}
      <div className="mb-4">
        {/* Verb Forms (if present) */}
        {dictionaryEntry.verb_forms &&
          dictionaryEntry.verb_forms.length > 0 && (
            <VerbFormsRenderer verbForms={dictionaryEntry.verb_forms} />
          )}

        {/* Meanings */}
        {dictionaryEntry.meanings.map((meaning, index) => (
          <MeaningEntryRenderer
            key={index}
            entry={meaning}
            word={dictionaryEntry.word}
            sourceTtsLanguageCode={
              dictionaryEntry.source_tts_language_code || ""
            }
            translatedTtsLanguageCode={
              dictionaryEntry.translated_tts_language_code || ""
            }
          />
        ))}
      </div>
    </div>
  );
}
