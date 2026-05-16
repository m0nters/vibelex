import { SpeakerButton } from "@/components";
import { PronunciationVariants } from "@/types";
import { hasPronunciationVariants } from "@/utils";

interface PronunciationRendererProps {
  pronunciation: string | PronunciationVariants;
  word: string;
  ttsCode: string;
}

export function PronunciationRenderer({
  pronunciation,
  word,
  ttsCode,
}: PronunciationRendererProps) {
  const styleMap = {
    UK: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    US: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    PT: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    BR: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  };

  if (hasPronunciationVariants(pronunciation)) {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-0.5">
        {Object.keys(pronunciation).map((key) => {
          const variant = pronunciation[key as keyof PronunciationVariants];
          if (!variant) return null;

          const ipaTexts = variant.ipa;
          const ttsCode = variant.tts_code;

          return (
            <span key={key} className="flex items-start gap-0.5">
              <div className="flex items-center gap-0.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    styleMap[key as keyof typeof styleMap] ||
                    "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {key}
                </span>
                <SpeakerButton word={word} ttsCode={ttsCode} />
              </div>
              <div className="flex flex-wrap gap-2">
                {ipaTexts.map((ipa, index) => (
                  <span key={index} className="text-base text-gray-600 dark:text-slate-400">
                    {ipa}
                  </span>
                ))}
              </div>
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="inline-flex items-end gap-1">
      {pronunciation && (
        <span className="text-base text-gray-600 dark:text-slate-400">
          {pronunciation as string}
        </span>
      )}
      <SpeakerButton
        word={word}
        ttsCode={ttsCode}
        className={`translate-y-1 ${!pronunciation ? "-translate-x-1.5" : ""}`}
      />
    </span>
  );
}
