import { changeLanguage } from "@/config";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ApiKeyBackground,
  ApiKeyForm,
  ApiKeyGuide,
  ApiKeyHeader,
  ApiKeyHistoryButton,
  ApiKeySettings,
} from "./components";

interface ApiKeyScreenProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyScreen({ onApiKeySubmit }: ApiKeyScreenProps) {
  const { i18n } = useTranslation();
  const appLangCode = i18n.language;

  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  const displaySave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  const handleAppLanguageChange = async (langCode: string) => {
    if (langCode === appLangCode) return;
    await changeLanguage(langCode);
    displaySave();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newApiKey = apiKey.trim();

    if (newApiKey.length !== 39 || !newApiKey.startsWith("AIzaSy")) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    // Save to chrome storage
    try {
      await chrome.storage.sync.set({
        geminiApiKey: newApiKey,
        extensionEnabled: true,
      });

      // Broadcast extension enabled to all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "EXTENSION_TOGGLE",
              enabled: true,
            })
            .catch(() => {});
        }
      });
    } catch (error) {
      console.error("Failed to save API key to storage:", error);
    }

    onApiKeySubmit(newApiKey);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setError(false);
  };

  return (
    <div className="animate-slide-in-right h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 transition-colors duration-300 select-none dark:from-gray-900 dark:to-slate-900 dark:text-slate-300">
      <ApiKeyBackground />

      <div className="relative z-10 p-6">
        <ApiKeyHeader />

        <ApiKeyForm
          apiKey={apiKey}
          error={error}
          onApiKeyChange={handleApiKeyChange}
          onSubmit={handleSubmit}
        />

        <ApiKeySettings
          appLangCode={appLangCode}
          saved={saved}
          onChangeAppLanguage={handleAppLanguageChange}
        />

        <ApiKeyHistoryButton />

        <ApiKeyGuide />
      </div>
    </div>
  );
}
