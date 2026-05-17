import { DarkModeToggle } from "@/components";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newApiKey = apiKey.trim();

    if (newApiKey.length !== 39 || !newApiKey.startsWith("AIzaSy")) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    // Save to chrome storage
    chrome.storage.sync.set(
      { geminiApiKey: newApiKey, extensionEnabled: true },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to save API key to storage:",
            chrome.runtime.lastError,
          );
        } else {
          // Broadcast extension enabled to all tabs
          chrome.tabs.query({}, (tabs) => {
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
          });
        }
      },
    );

    onApiKeySubmit(newApiKey);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setError(false);
  };

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none dark:from-gray-900 dark:to-slate-900 dark:text-slate-300">
      <ApiKeyBackground />

      {/* Dark Mode Toggle */}
      <DarkModeToggle className="absolute top-6 right-6 z-20" />

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
