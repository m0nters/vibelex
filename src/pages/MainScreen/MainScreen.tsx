import { changeLanguage } from "@/config";
import {
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants";
import { checkPrivilegePage } from "@/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  onDeleteApiKey: () => void;
}

export function MainScreen({ onDeleteApiKey }: MainScreenProps) {
  const { i18n } = useTranslation();
  const appLangCode = i18n.language;

  const [sourceLangCode, setSourceLangCode] = useState<string>(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );
  const [translatedLangCode, setTranslatedLangCode] = useState<string>(
    DEFAULT_LANGUAGE_CODE,
  );
  const [extensionEnabled, setExtensionEnabled] = useState(true);

  const [isPrivilegePage, setIsPrivilegePage] = useState(false);
  const [savedLanguages, setSavedLanguages] = useState(false);
  const [savedAppLang, setSavedAppLang] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await chrome.storage.sync.get([
          "translatedLangCode",
          "sourceLangCode",
          "extensionEnabled",
        ]);

        if (
          data.translatedLangCode &&
          data.translatedLangCode !== DEFAULT_LANGUAGE_CODE
        ) {
          setTranslatedLangCode(data.translatedLangCode);
        }

        if (
          data.sourceLangCode &&
          data.sourceLangCode !== DEFAULT_SOURCE_LANGUAGE_CODE
        ) {
          setSourceLangCode(data.sourceLangCode);
        }

        if (typeof data.extensionEnabled === "boolean") {
          setExtensionEnabled(data.extensionEnabled);
        }
      } catch (error) {
        console.error("Failed to load settings from storage:", error);
      }
    };
    loadSettings();
  }, []);

  // Check if current tab is a privilege page
  useEffect(() => {
    const checkTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.id) {
          const isRestricted = await checkPrivilegePage(tab.id);
          setIsPrivilegePage(isRestricted);
        }
      } catch (error) {
        console.error("Failed to check privilege page:", error);
      }
    };
    checkTab();
  }, []);

  const displaySavedLanguages = () => {
    setSavedLanguages(true);
    setTimeout(() => setSavedLanguages(false), 1000);
  };

  const displaySavedAppLang = () => {
    setSavedAppLang(true);
    setTimeout(() => setSavedAppLang(false), 1000);
  };

  const handleSourceLanguageChange = async (langCode: string) => {
    if (langCode === sourceLangCode) return;
    setSourceLangCode(langCode);
    try {
      await chrome.storage.sync.set({ sourceLangCode: langCode });
    } catch (error) {
      console.error("Failed to save source language to storage:", error);
    }
    displaySavedLanguages();
  };

  const handleTranslatedLanguageChange = async (langCode: string) => {
    if (langCode === translatedLangCode) return;
    setTranslatedLangCode(langCode);
    try {
      await chrome.storage.sync.set({ translatedLangCode: langCode });
    } catch (error) {
      console.error("Failed to save translated language to storage:", error);
    }
    displaySavedLanguages();
  };

  const handleAppLanguageChange = async (langCode: string) => {
    if (langCode === appLangCode) return;
    await changeLanguage(langCode);
    displaySavedAppLang();
  };

  const handleExtensionToggle = async (enabled: boolean) => {
    setExtensionEnabled(enabled);
    try {
      await chrome.storage.sync.set({ extensionEnabled: enabled });
      const tabs = await chrome.tabs.query({});
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, { type: "EXTENSION_TOGGLE", enabled })
            .catch(() => {});
        }
      });
    } catch (error) {
      console.warn("Failed to save extension enabled state:", error);
    }
  };

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 transition-colors duration-300 select-none dark:from-gray-900 dark:to-slate-900 dark:text-slate-300">
      <MainScreenBackground />

      <MainScreenHeader
        extensionEnabled={extensionEnabled}
        onExtensionToggle={handleExtensionToggle}
      />

      {/* Main content */}
      <div
        className={`relative z-10 px-6 py-6 transition-opacity duration-300 ${
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
