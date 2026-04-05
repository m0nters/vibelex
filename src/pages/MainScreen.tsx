import { DropdownMenu, ToggleSwitch } from "@/components";
import {
  SUPPORTED_APP_LANGUAGE,
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TRANSLATED_LANGUAGE,
} from "@/constants";
import { checkPrivilegePage } from "@/utils";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Info,
  KeyRound,
  Languages,
  MousePointer2,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { transliterate } from "transliteration";


interface MainScreenProps {
  appLangCode: string;
  sourceLangCode: string;
  translatedLangCode: string;
  onChangeSourceLanguage: (value: string) => void;
  onChangeTranslatedLanguage: (value: string) => void;
  onChangeAppLanguage: (value: string) => Promise<void>;
  extensionEnabled: boolean;
  onExtensionToggle: (enabled: boolean) => void;
  onDeleteApiKey: () => void;
}

export function MainScreen({
  appLangCode,
  sourceLangCode,
  translatedLangCode,
  onChangeSourceLanguage,
  onChangeTranslatedLanguage,
  onChangeAppLanguage,
  extensionEnabled,
  onExtensionToggle,
  onDeleteApiKey,
}: MainScreenProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPrivilegePage, setIsPrivilegePage] = useState(false);
  const [saved1, setSaved1] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current tab is a privilege page
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        const isRestricted = await checkPrivilegePage(tab.id);
        setIsPrivilegePage(isRestricted);
      }
    });
  }, []);

  const displaySave1 = () => {
    setSaved1(true);
    setTimeout(() => setSaved1(false), 1000);
  };

  const displaySave2 = () => {
    setSaved2(true);
    setTimeout(() => setSaved2(false), 1000);
  };

  const handleSourceLanguageChange = (langCode: string) => {
    if (langCode === sourceLangCode) return;
    onChangeSourceLanguage(langCode);
    displaySave1();
  };

  const handleTranslatedLanguageChange = (langCode: string) => {
    if (langCode === translatedLangCode) return;
    onChangeTranslatedLanguage(langCode);
    displaySave1();
  };

  const handleAppLanguageChange = async (langCode: string) => {
    if (langCode === appLangCode) return;
    await onChangeAppLanguage(langCode);
    displaySave2();
  };

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="animate-blob-slow absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-linear-to-br from-indigo-300 to-purple-300 opacity-50"></div>
        <div className="animate-blob-slow animation-delay-2000 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-linear-to-tr from-purple-300 to-indigo-300 opacity-30"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 pb-0">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo/logo.png" alt="App Logo" className="h-16 w-16" />
            <div>
              <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                VibeLex
              </h1>
              <p className="text-sm text-gray-500">
                {t("mainScreen:appSubtitle")}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-end">
            <ToggleSwitch
              initialValue={extensionEnabled}
              onChange={onExtensionToggle}
              label="Toggle Extension"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 px-6 pb-6 transition-all duration-300 ${
          !extensionEnabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {/* Extension disabled overlay */}
        {!extensionEnabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-900/10 backdrop-blur-xs">
            <div className="text-center">
              <div className="mb-1 text-sm font-semibold text-black">
                {t("mainScreen:extensionDisabled")}
              </div>
              <div className="text-xs text-gray-900">
                {t("mainScreen:toggleToEnable")}
              </div>
            </div>
          </div>
        )}

        {/* Privilege Page Warning */}
        {isPrivilegePage && (
          <div className="mb-4 flex items-start space-x-2">
            <div className="flex h-4 w-4 items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xs text-orange-700">
              {t("errors:privilegePageDescription")}
            </p>
          </div>
        )}

        {/* Translation Languages Setting */}
        <div
          className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
            !extensionEnabled
              ? "border-gray-300/30 bg-gray-100/70"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {/* Header */}
          <label
            className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
              !extensionEnabled ? "text-gray-400" : "text-gray-700"
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
              <div className="mb-2 translate-x-0.5 text-xs font-medium text-gray-600">
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
                onChange={handleSourceLanguageChange}
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

            {/* Translated Language Dropdown */}
            <div className="flex-1">
              <div className="mb-2 translate-x-0.5 text-xs font-medium text-gray-600">
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
                onChange={handleTranslatedLanguageChange}
                focusColor="indigo"
                canSearch={true}
                className="w-[125px]"
              />
            </div>
          </div>

          {/* Save indicator*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              saved1 ? "mt-3 max-h-20" : "mt-0 max-h-0"
            }`}
          >
            <div className="animate-fade-in flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">
                {t("mainScreen:saved")}
              </span>
            </div>
          </div>
        </div>

        {/* App Language Setting */}
        <div
          className={`mt-4 rounded-2xl border-2 p-5 transition-all duration-300 ${
            !extensionEnabled
              ? "border-gray-300/30 bg-gray-100/70"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div>
            <label
              className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <Settings
                className={`h-4 w-4 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-purple-500"
                }`}
              />
              <span>{t("mainScreen:appLanguage")}</span>
            </label>

            <DropdownMenu
              value={appLangCode}
              options={SUPPORTED_APP_LANGUAGE.map((lang) => ({
                value: lang.code,
                label: lang.nativeName,
              }))}
              onChange={handleAppLanguageChange}
              focusColor="purple"
              isSorted={false}
            />
          </div>

          {/* Save indicator*/}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              saved2 ? "mt-3 max-h-20" : "mt-0 max-h-0"
            }`}
          >
            <div className="animate-fade-in flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">
                {t("mainScreen:saved")}
              </span>
            </div>
          </div>
        </div>

        {/* History Button */}
        <div className="mt-4">
          <button
            onClick={() => navigate("/history")}
            disabled={!extensionEnabled}
            className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all duration-300 ${
              !extensionEnabled
                ? "cursor-not-allowed border-gray-300/30 bg-gray-100/70"
                : "cursor-pointer border-gray-200 bg-gray-50 hover:bg-gray-100 hover:shadow-md"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-300/50" : "bg-purple-100"
                }`}
              >
                <Clock
                  className={`h-4 w-4 transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div className="text-left">
                <h3
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {t("history:title")}
                </h3>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    !extensionEnabled ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("history:viewRecentTranslations")}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`h-5 w-5 transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-300" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Usage instructions */}
        <div
          className={`mt-4 rounded-xl border border-indigo-200/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-4 transition-all duration-300 ${
            !extensionEnabled
              ? "border-gray-300/30 bg-gray-500/10 opacity-50"
              : ""
          }`}
        >
          <h3
            className={`mb-2 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
              !extensionEnabled ? "text-gray-500" : "text-indigo-700"
            }`}
          >
            <Info
              className={`h-4 w-4 transition-colors duration-300 ${
                !extensionEnabled ? "text-gray-400" : ""
              }`}
            />
            <span>{t("mainScreen:howToUse")}</span>
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
              <span>{t("mainScreen:step1")}</span>
            </li>
            <li className="flex items-start space-x-2">
              <MousePointer2
                className={`mt-1 h-3 w-3 shrink-0 transition-colors duration-300 ${
                  !extensionEnabled ? "text-gray-400" : "text-purple-400"
                }`}
              />
              <span>{t("mainScreen:step2")}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
                  !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
                }`}
              ></span>
              <span>{t("mainScreen:step3")}</span>
            </li>
          </ul>
        </div>

        {/* Delete API Key Section */}
        <div className="mt-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100"
            >
              <KeyRound className="h-4 w-4" />
              <span>{t("api:deleteApiKey")}</span>
            </button>
          ) : (
            <div className="animate-fade-in rounded-xl border-2 border-red-300 bg-red-50 p-4">
              <p className="mb-3 text-center text-sm font-semibold text-red-700">
                {t("api:deleteApiKeyConfirm")}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onDeleteApiKey();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t("api:confirmDelete")}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 cursor-pointer rounded-lg border-2 border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
                >
                  {t("common:cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
