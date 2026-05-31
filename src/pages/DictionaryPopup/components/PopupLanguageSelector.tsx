import { DropdownMenu } from "@/components";
import {
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TRANSLATED_LANGUAGE,
} from "@/constants";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { transliterate } from "transliteration";

interface PopupLanguageSelectorProps {
  sourceLangCode: string;
  translatedLangCode: string;
  onChangeSource: (langCode: string) => void;
  onChangeTarget: (langCode: string) => void;
  onDropdownOpenChange?: (isOpen: boolean) => void;
}

export function PopupLanguageSelector({
  sourceLangCode,
  translatedLangCode,
  onChangeSource,
  onChangeTarget,
  onDropdownOpenChange,
}: PopupLanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 transition-colors duration-300 dark:border-slate-800"
      id="popup-language-selector"
    >
      {/* Source Language Dropdown */}
      <div className="min-w-0 flex-1">
        <DropdownMenu
          value={sourceLangCode}
          options={[
            { value: "auto", label: t("mainScreen:autoDetect") },
            ...SUPPORTED_SOURCE_LANGUAGE.map((lang) => ({
              value: lang.code,
              label: `${t(`languages:${lang.code}`)} (${lang.nativeName})`,
              searchTerms: [
                transliterate(lang.nativeName),
                transliterate(t(`languages:${lang.code}`)),
                lang.englishName,
              ],
            })),
          ]}
          pin={{ value: "auto", label: t("mainScreen:autoDetect") }}
          onChange={onChangeSource}
          onOpenChange={onDropdownOpenChange}
          focusColor="indigo"
          canSearch={true}
          size="compact"
        />
      </div>

      {/* Arrow Icon */}
      <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-colors duration-300 dark:text-slate-500" />

      {/* Target Language Dropdown */}
      <div className="min-w-0 flex-1">
        <DropdownMenu
          value={translatedLangCode}
          options={SUPPORTED_TRANSLATED_LANGUAGE.map((lang) => ({
            value: lang.code,
            label: `${t(`languages:${lang.code}`)} (${lang.nativeName})`,
            searchTerms: [
              transliterate(lang.nativeName),
              transliterate(t(`languages:${lang.code}`)),
              lang.englishName,
            ],
          }))}
          onChange={onChangeTarget}
          onOpenChange={onDropdownOpenChange}
          focusColor="indigo"
          canSearch={true}
          size="compact"
          align="right"
        />
      </div>
    </div>
  );
}
