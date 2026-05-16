import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ApiKeyFormProps {
  apiKey: string;
  error: boolean;
  onApiKeyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ApiKeyForm({
  apiKey,
  error,
  onApiKeyChange,
  onSubmit,
}: ApiKeyFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
          <Lock className="h-4 w-4 text-indigo-500" />
          <span>{t("api:geminiApiKey")}</span>
        </label>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={t("api:enterApiKey")}
          className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:placeholder:text-slate-400 dark:hover:border-slate-500 dark:focus:ring-indigo-900/50"
        />

        <div
          className={`mt-2 overflow-hidden text-xs text-red-600 transition-all duration-300 ease-out dark:text-red-400 ${error ? "max-h-20" : "max-h-0"}`}
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
  );
}
