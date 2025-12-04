import { SpeakerButton } from "@/components";
import { MeaningEntry } from "@/types";
import { renderText } from "@/utils";
import { PronunciationRenderer } from "./PronunciationRenderer";

interface MeaningEntryRendererProps {
  entry: MeaningEntry;
  word: string;
  sourceTtsLanguageCode: string;
  translatedTtsLanguageCode: string;
}

export function MeaningEntryRenderer({
  entry,
  word,
  sourceTtsLanguageCode,
  translatedTtsLanguageCode,
}: MeaningEntryRendererProps) {
  return (
    <div>
      {/* Word and Pronunciation Header (original style) */}
      <div className="mb-4">
        <h1 className="mb-1 text-xl font-semibold wrap-break-word text-blue-600">
          {word}
        </h1>
        <PronunciationRenderer
          pronunciation={entry.pronunciation}
          word={word}
          ttsCode={sourceTtsLanguageCode}
        />
      </div>

      {/* Part of Speech and Translation/Definition (original style) */}
      <div className="mb-4">
        <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
          {entry.part_of_speech}
        </span>
        {entry.note && (
          <p className="mt-2 ml-1 text-xs text-gray-800 [&_strong]:text-sm [&_strong]:font-medium">
            ({renderText(entry.note)})
          </p>
        )}
        <p className="mt-2 ml-1 text-sm font-medium text-gray-800">
          {entry.definition}
        </p>
      </div>

      {/* Examples (consistent object format for all languages) */}
      {entry.examples && entry.examples.length > 0 && (
        <div className="space-y-2">
          {entry.examples.map((example, exampleIndex) => (
            <div
              key={exampleIndex}
              className="mb-3 ml-4 rounded-lg border-l-4 border-blue-200 bg-blue-50 p-3"
            >
              <div className="mb-1 flex items-start justify-between gap-1">
                <p className="min-w-0 flex-1 text-sm font-medium wrap-break-word text-gray-800">
                  {renderText(example.text)}
                </p>
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <SpeakerButton
                    word={example.text.replace(/\*\*/g, "")}
                    ttsCode={sourceTtsLanguageCode}
                    className="translate-y-0.5"
                  />
                </div>
              </div>
              {example.pronunciation && (
                <p className="mb-1 text-xs text-gray-600 italic">
                  {renderText(example.pronunciation)}
                </p>
              )}
              {example.translation && (
                <div className="flex items-start justify-between gap-1">
                  <p className="min-w-0 flex-1 text-sm font-normal wrap-break-word text-blue-700">
                    {renderText(example.translation)}
                  </p>
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <SpeakerButton
                      word={example.translation.replace(/\*\*/g, "")}
                      ttsCode={translatedTtsLanguageCode}
                      className="translate-y-0.5"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Idioms Section */}
      {entry.idioms && entry.idioms.items && entry.idioms.items.length > 0 && (
        <div className="mt-8 mb-4">
          {/* Label */}
          <div className="mb-2 flex items-center space-x-2">
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-600">
              {entry.idioms.label}
            </span>
          </div>
          {/* Content */}
          <div className="ml-2 space-y-3">
            {entry.idioms.items.map((idiom, index) => (
              <div
                key={index}
                className="rounded-lg border border-teal-200 bg-teal-50 p-3"
              >
                <div className="mb-2 flex items-start gap-1">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {renderText(idiom.idiom)}
                  </h4>
                  <SpeakerButton
                    word={idiom.idiom}
                    ttsCode={sourceTtsLanguageCode}
                    hoverBackgroundColor="hover:bg-teal-100"
                    hoverTextColor="hover:text-teal-600"
                    speakingBackgroundColor="bg-teal-200"
                    speakingTextColor="text-teal-700"
                    className="-translate-y-0.5"
                  />
                </div>
                <p className="mb-2 text-sm text-gray-700">{idiom.meaning}</p>
                {idiom.examples && idiom.examples.length > 0 && (
                  <div className="space-y-2">
                    {idiom.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex}>
                        <div className="mb-1 flex items-start justify-between gap-1">
                          <p className="min-w-0 flex-1 border-l-4 border-teal-300 pl-3 text-xs font-medium wrap-break-word text-gray-800">
                            {renderText(example.text)}
                          </p>
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <SpeakerButton
                              word={example.text.replace(/\*\*/g, "")}
                              ttsCode={sourceTtsLanguageCode}
                              hoverBackgroundColor="hover:bg-teal-100"
                              hoverTextColor="hover:text-teal-600"
                              speakingBackgroundColor="bg-teal-200"
                              speakingTextColor="text-teal-700"
                              className="scale-75"
                            />
                          </div>
                        </div>
                        {example.pronunciation && (
                          <p className="mb-1 pl-4 text-xs text-gray-500 italic">
                            {renderText(example.pronunciation)}
                          </p>
                        )}
                        {example.translation && (
                          <div className="flex items-start justify-between gap-1">
                            <p className="min-w-0 flex-1 pl-4 text-xs wrap-break-word text-teal-700">
                              {renderText(example.translation)}
                            </p>
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                              <SpeakerButton
                                word={example.translation.replace(/\*\*/g, "")}
                                ttsCode={translatedTtsLanguageCode}
                                hoverBackgroundColor="hover:bg-teal-100"
                                hoverTextColor="hover:text-teal-600"
                                speakingBackgroundColor="bg-teal-200"
                                speakingTextColor="text-teal-700"
                                className="scale-75"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phrasal Verbs Section */}
      {entry.phrasal_verbs &&
        entry.phrasal_verbs.items &&
        entry.phrasal_verbs.items.length > 0 && (
          <div className="mt-8 mb-4">
            <div className="mb-2 flex items-center space-x-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">
                {entry.phrasal_verbs.label}
              </span>
            </div>
            <div className="ml-2 space-y-3">
              {entry.phrasal_verbs.items.map((phrasalVerb, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                >
                  <div className="mb-2 flex items-start gap-1">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {renderText(phrasalVerb.phrasal_verb)}
                    </h4>
                    <SpeakerButton
                      word={phrasalVerb.phrasal_verb}
                      ttsCode={sourceTtsLanguageCode}
                      hoverBackgroundColor="hover:bg-amber-100"
                      hoverTextColor="hover:text-amber-600"
                      speakingBackgroundColor="bg-amber-200"
                      speakingTextColor="text-amber-700"
                      className="-translate-y-0.5"
                    />
                  </div>
                  <p className="mb-2 text-sm text-gray-700">
                    {phrasalVerb.meaning}
                  </p>
                  {phrasalVerb.examples && phrasalVerb.examples.length > 0 && (
                    <div className="space-y-2">
                      {phrasalVerb.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex}>
                          <div className="mb-1 flex items-start justify-between gap-1">
                            <p className="min-w-0 flex-1 border-l-4 border-amber-300 pl-3 text-xs font-medium wrap-break-word text-gray-800">
                              {renderText(example.text)}
                            </p>
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                              <SpeakerButton
                                word={example.text.replace(/\*\*/g, "")}
                                ttsCode={sourceTtsLanguageCode}
                                hoverBackgroundColor="hover:bg-amber-100"
                                hoverTextColor="hover:text-amber-600"
                                speakingBackgroundColor="bg-amber-200"
                                speakingTextColor="text-amber-700"
                                className="scale-75"
                              />
                            </div>
                          </div>
                          {example.pronunciation && (
                            <p className="mb-1 pl-4 text-xs text-gray-500 italic">
                              {renderText(example.pronunciation)}
                            </p>
                          )}
                          {example.translation && (
                            <div className="flex items-start justify-between gap-1">
                              <p className="min-w-0 flex-1 pl-4 text-xs wrap-break-word text-amber-700">
                                {renderText(example.translation)}
                              </p>
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                                <SpeakerButton
                                  word={example.translation.replace(
                                    /\*\*/g,
                                    "",
                                  )}
                                  ttsCode={translatedTtsLanguageCode}
                                  hoverBackgroundColor="hover:bg-amber-100"
                                  hoverTextColor="hover:text-amber-600"
                                  speakingBackgroundColor="bg-amber-200"
                                  speakingTextColor="text-amber-700"
                                  className="scale-75"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Synonyms Section */}
      {entry.synonyms &&
        entry.synonyms.items &&
        entry.synonyms.items.length > 0 && (
          <div className="mt-8 mb-4">
            <div className="mb-2 flex items-center space-x-2">
              <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600">
                {entry.synonyms.label}
              </span>
            </div>
            <div className="ml-2 flex flex-wrap gap-1">
              {entry.synonyms.items.map((synonym, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-900 transition-colors duration-200 hover:bg-gray-200"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
