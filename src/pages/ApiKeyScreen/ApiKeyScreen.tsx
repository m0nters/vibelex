import { useState } from "react";
import {
  ApiKeyBackground,
  ApiKeyForm,
  ApiKeyGuide,
  ApiKeyHeader,
  ApiKeyHistoryButton,
  ApiKeySettings,
} from "./components";
import { DarkModeToggle } from "@/components";

interface ApiKeyScreenProps {
  onApiKeySubmit: (apiKey: string) => void;
  appLangCode: string;
  onChangeAppLanguage: (value: string) => Promise<void>;
}

export function ApiKeyScreen({
  onApiKeySubmit,
  appLangCode,
  onChangeAppLanguage,
}: ApiKeyScreenProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  const displaySave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  const handleAppLanguageChange = async (langCode: string) => {
    if (langCode === appLangCode) return;
    await onChangeAppLanguage(langCode);
    displaySave();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (apiKey.trim().length !== 39 || !apiKey.trim().startsWith("AIzaSy")) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    onApiKeySubmit(apiKey.trim());
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setError(false);
  };

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 dark:text-slate-300 select-none">
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
