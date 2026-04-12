import { DropdownMenu } from "@/components";
import { SUPPORTED_APP_LANGUAGE } from "@/constants";
import { renderMarkdownText } from "@/utils";
import {
  Check,
  ChevronRight,
  Clock,
  Info,
  Key,
  Lock,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  return (
    <div className="animate-slide-in-right relative h-full w-full overflow-x-hidden overflow-y-auto bg-linear-to-br from-indigo-50 to-purple-50 select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="animate-blob-slow absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-linear-to-br from-indigo-300 to-purple-300 opacity-50"></div>
        <div className="animate-blob-slow animation-delay-2000 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-linear-to-tr from-purple-300 to-indigo-300 opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 shadow-lg">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
            {t("api:apiKeyRequired")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("api:apiKeyDescription")}
          </p>
        </div>

        {/* API Key Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>{t("api:geminiApiKey")}</span>
            </label>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(false);
              }}
              placeholder={t("api:enterApiKey")}
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
            />

            <div
              className={`mt-2 overflow-hidden text-xs text-red-600 transition-all duration-300 ease-out ${error ? "max-h-20" : "max-h-0"}`}
            >
              {t("errors:apiKeyInvalid")}
            </div>

            <button
              type="submit"
              className="mt-2 w-full cursor-pointer rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg active:scale-95"
            >
              {t("api:saveAndContinue")}
            </button>
          </div>
        </form>

        {/* App Language Setting */}
        <div className="mt-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-5">
          <div>
            <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Settings className="h-4 w-4 text-purple-500" />
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
              saved ? "mt-3 max-h-20" : "mt-0 max-h-0"
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
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-colors duration-300">
                <Clock className="h-4 w-4 text-purple-600 transition-colors duration-300" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-700 transition-colors duration-300">
                  {t("history:title")}
                </h3>
                <p className="text-xs text-gray-600 transition-colors duration-300">
                  {t("history:viewRecentTranslations")}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 transition-colors duration-300" />
          </button>
        </div>

        {/* How to get API key section */}
        <div className="mt-4 rounded-xl border border-indigo-200/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-4">
          <h3 className="mb-3 flex items-center space-x-2 text-sm font-semibold text-indigo-700">
            <Info className="h-4 w-4" />
            <span>{t("api:howToGetApiKey")}</span>
          </h3>
          <ol className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                1
              </span>
              {renderMarkdownText(t("api:apiKeyStep1"))}
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                2
              </span>
              {renderMarkdownText(t("api:apiKeyStep2"))}
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                3
              </span>
              {renderMarkdownText(t("api:apiKeyStep3"))}
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                4
              </span>
              {renderMarkdownText(t("api:apiKeyStep4"))}
            </li>
          </ol>
        </div>

        {/* Privacy note */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <Lock className="mx-auto mb-1 h-3 w-3" />
          {t("api:apiKeyPrivacy")}
        </div>
      </div>
    </div>
  );
}
