import { DropdownMenu } from "@/components";
import {
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TRANSLATED_LANGUAGE,
} from "@/constants";
import { ArrowRight, Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { transliterate } from "transliteration";

interface TranslationLanguageSettingsProps {
  extensionEnabled: boolean;
  sourceLangCode: string;
  translatedLangCode: string;
  saved: boolean;
  onChangeSourceLanguage: (langCode: string) => void;
  onChangeTranslatedLanguage: (langCode: string) => void;
}

export function TranslationLanguageSettings({
  extensionEnabled,
  sourceLangCode,
  translatedLangCode,
  saved,
  onChangeSourceLanguage,
  onChangeTranslatedLanguage,
}: TranslationLanguageSettingsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-colors duration-300 ${
        !extensionEnabled
          ? "border-gray-300/30 bg-gray-100/70 dark:border-slate-700/30 dark:bg-slate-800/70"
          : "border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <label
        className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
          !extensionEnabled
            ? "text-gray-400 dark:text-slate-500"
            : "text-gray-700 dark:text-slate-300"
        }`}
      >
        <Languages
          className={`h-4 w-4 transition-colors duration-300 ${
            !extensionEnabled ? "text-gray-400" : "text-indigo-500"
          }`}
        />
        <span>{t("mainScreen:translate")}</span>
      </label>

      {/* Source and Target Language Selection */}
      <div className="flex items-center space-x-3">
        {/* Source Language Dropdown */}
        <div className="flex-1">
          <div className="mb-2 translate-x-0.5 text-xs font-medium text-gray-600 transition-colors duration-300 dark:text-slate-400">
            {t("mainScreen:from")}
          </div>
          <DropdownMenu
            value={sourceLangCode}
            options={[
              { value: "auto", label: t("mainScreen:autoDetect") },
              ...SUPPORTED_SOURCE_LANGUAGE.map((lang) => ({
                value: lang.code,
                /* For i18n-check
                    t('languages:aa')
                    t('languages:ab')
                    t('languages:ae')
                    t('languages:af')
                    t('languages:ak')
                    t('languages:am')
                    t('languages:an')
                    t('languages:ar')
                    t('languages:as')
                    t('languages:av')
                    t('languages:ay')
                    t('languages:az')
                    t('languages:ba')
                    t('languages:be')
                    t('languages:bg')
                    t('languages:bh')
                    t('languages:bi')
                    t('languages:bm')
                    t('languages:bn')
                    t('languages:bo')
                    t('languages:br')
                    t('languages:bs')
                    t('languages:ca')
                    t('languages:ce')
                    t('languages:ch')
                    t('languages:co')
                    t('languages:cr')
                    t('languages:cs')
                    t('languages:cu')
                    t('languages:cv')
                    t('languages:cy')
                    t('languages:da')
                    t('languages:de')
                    t('languages:dv')
                    t('languages:dz')
                    t('languages:ee')
                    t('languages:el')
                    t('languages:en')
                    t('languages:eo')
                    t('languages:es')
                    t('languages:et')
                    t('languages:eu')
                    t('languages:fa')
                    t('languages:ff')
                    t('languages:fi')
                    t('languages:fj')
                    t('languages:fo')
                    t('languages:fr')
                    t('languages:fy')
                    t('languages:ga')
                    t('languages:gd')
                    t('languages:gl')
                    t('languages:gn')
                    t('languages:gu')
                    t('languages:gv')
                    t('languages:ha')
                    t('languages:he')
                    t('languages:hi')
                    t('languages:ho')
                    t('languages:hr')
                    t('languages:ht')
                    t('languages:hu')
                    t('languages:hy')
                    t('languages:hz')
                    t('languages:ia')
                    t('languages:id')
                    t('languages:ie')
                    t('languages:ig')
                    t('languages:ii')
                    t('languages:ik')
                    t('languages:io')
                    t('languages:is')
                    t('languages:it')
                    t('languages:iu')
                    t('languages:ja')
                    t('languages:jv')
                    t('languages:ka')
                    t('languages:kg')
                    t('languages:ki')
                    t('languages:kj')
                    t('languages:kk')
                    t('languages:kl')
                    t('languages:km')
                    t('languages:kn')
                    t('languages:ko')
                    t('languages:kr')
                    t('languages:ks')
                    t('languages:ku')
                    t('languages:kv')
                    t('languages:kw')
                    t('languages:ky')
                    t('languages:la')
                    t('languages:lb')
                    t('languages:lg')
                    t('languages:li')
                    t('languages:ln')
                    t('languages:lo')
                    t('languages:lt')
                    t('languages:lu')
                    t('languages:lv')
                    t('languages:mg')
                    t('languages:mh')
                    t('languages:mi')
                    t('languages:mk')
                    t('languages:ml')
                    t('languages:mn')
                    t('languages:mr')
                    t('languages:ms')
                    t('languages:mt')
                    t('languages:my')
                    t('languages:na')
                    t('languages:nb')
                    t('languages:nd')
                    t('languages:ne')
                    t('languages:ng')
                    t('languages:nl')
                    t('languages:nn')
                    t('languages:no')
                    t('languages:nr')
                    t('languages:nv')
                    t('languages:ny')
                    t('languages:oc')
                    t('languages:oj')
                    t('languages:om')
                    t('languages:or')
                    t('languages:os')
                    t('languages:pa')
                    t('languages:pi')
                    t('languages:pl')
                    t('languages:ps')
                    t('languages:pt')
                    t('languages:qu')
                    t('languages:rm')
                    t('languages:rn')
                    t('languages:ro')
                    t('languages:ru')
                    t('languages:rw')
                    t('languages:sa')
                    t('languages:sc')
                    t('languages:sd')
                    t('languages:se')
                    t('languages:sg')
                    t('languages:si')
                    t('languages:sk')
                    t('languages:sl')
                    t('languages:sm')
                    t('languages:sn')
                    t('languages:so')
                    t('languages:sq')
                    t('languages:sr')
                    t('languages:ss')
                    t('languages:st')
                    t('languages:su')
                    t('languages:sv')
                    t('languages:sw')
                    t('languages:ta')
                    t('languages:te')
                    t('languages:tg')
                    t('languages:th')
                    t('languages:ti')
                    t('languages:tk')
                    t('languages:tl')
                    t('languages:tn')
                    t('languages:to')
                    t('languages:tr')
                    t('languages:ts')
                    t('languages:tt')
                    t('languages:tw')
                    t('languages:ty')
                    t('languages:ug')
                    t('languages:uk')
                    t('languages:ur')
                    t('languages:uz')
                    t('languages:ve')
                    t('languages:vi')
                    t('languages:vo')
                    t('languages:wa')
                    t('languages:wo')
                    t('languages:xh')
                    t('languages:yi')
                    t('languages:yo')
                    t('languages:za')
                    t('languages:zh')
                    t('languages:zu')
                    t('languages:unknown')
                    */
                label: `${t(`languages:${lang.code}`)} (${lang.nativeName})`,
                searchTerms: [
                  transliterate(lang.nativeName),
                  transliterate(t(`languages:${lang.code}`)),
                  lang.englishName,
                ],
              })),
            ]}
            pin={{ value: "auto", label: t("mainScreen:autoDetect") }}
            onChange={onChangeSourceLanguage}
            focusColor="indigo"
            canSearch={true}
            className="w-[125px]"
          />
        </div>

        {/* Arrow Icon */}
        <div className="flex h-full translate-y-4 items-end pb-2">
          <ArrowRight
            className={`h-5 w-5 transition-colors duration-300 ${
              !extensionEnabled ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>

        {/* Target Language Dropdown */}
        <div className="flex-1">
          <div className="mb-2 translate-x-0.5 text-xs font-medium text-gray-600 transition-colors duration-300 dark:text-slate-400">
            {t("mainScreen:to")}
          </div>
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
            onChange={onChangeTranslatedLanguage}
            focusColor="indigo"
            canSearch={true}
            className="w-[125px]"
          />
        </div>
      </div>

      {/* Save indicator */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          saved ? "mt-3 max-h-20" : "mt-0 max-h-0"
        }`}
      >
        <div className="animate-fade-in flex items-center space-x-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-xs font-medium">{t("mainScreen:saved")}</span>
        </div>
      </div>
    </div>
  );
}
