import { checkPrivilegePage } from "@/utils";
import { useEffect, useState } from "react";
import {
  AppLanguageSettings,
  DeleteApiKeySection,
  DisabledOverlay,
  HistoryNavButton,
  MainScreenBackground,
  MainScreenHeader,
  PrivilegePageWarning,
  TranslationLanguageSettings,
  UsageInstructions,
} from "./components";

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
  const [isPrivilegePage, setIsPrivilegePage] = useState(false);
  const [savedLanguages, setSavedLanguages] = useState(false);
  const [savedAppLang, setSavedAppLang] = useState(false);

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

  const displaySavedLanguages = () => {
    setSavedLanguages(true);
    setTimeout(() => setSavedLanguages(false), 1000);
  };

  const displaySavedAppLang = () => {
    setSavedAppLang(true);
    setTimeout(() => setSavedAppLang(false), 1000);
  };

  const handleSourceLanguageChange = (langCode: string) => {
    if (langCode === sourceLangCode) return;
    onChangeSourceLanguage(langCode);
    displaySavedLanguages();
  };

  const handleTranslatedLanguageChange = (langCode: string) => {
    if (langCode === translatedLangCode) return;
    onChangeTranslatedLanguage(langCode);
    displaySavedLanguages();
  };

  const handleAppLanguageChange = async (langCode: string) => {
    if (langCode === appLangCode) return;
    await onChangeAppLanguage(langCode);
    displaySavedAppLang();
  };

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 dark:text-white select-none">
      <MainScreenBackground />

      <MainScreenHeader
        extensionEnabled={extensionEnabled}
        onExtensionToggle={onExtensionToggle}
      />

      {/* Main content */}
      <div
        className={`relative z-10 px-6 pb-6 transition-all duration-300 ${
          !extensionEnabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {/* Extension disabled overlay */}
        {!extensionEnabled && <DisabledOverlay />}

        {/* Privilege Page Warning */}
        {isPrivilegePage && <PrivilegePageWarning />}

        <TranslationLanguageSettings
          extensionEnabled={extensionEnabled}
          sourceLangCode={sourceLangCode}
          translatedLangCode={translatedLangCode}
          saved={savedLanguages}
          onChangeSourceLanguage={handleSourceLanguageChange}
          onChangeTranslatedLanguage={handleTranslatedLanguageChange}
        />

        <AppLanguageSettings
          extensionEnabled={extensionEnabled}
          appLangCode={appLangCode}
          saved={savedAppLang}
          onChangeAppLanguage={handleAppLanguageChange}
        />

        <HistoryNavButton extensionEnabled={extensionEnabled} />

        <UsageInstructions extensionEnabled={extensionEnabled} />

        <DeleteApiKeySection onDeleteApiKey={onDeleteApiKey} />
      </div>
    </div>
  );
}
