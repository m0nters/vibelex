import { renderMarkdownText } from "@/utils";
import { Info, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ApiKeyGuide() {
  const { t } = useTranslation();

  const steps = [
    t("api:apiKeyStep1"),
    t("api:apiKeyStep2"),
    t("api:apiKeyStep3"),
    t("api:apiKeyStep4"),
  ];

  return (
    <>
      {/* How to get API key section */}
      <div className="mt-4 rounded-xl border border-indigo-200/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-4 transition-colors duration-300 dark:border-indigo-400/20 dark:from-indigo-400/10 dark:to-purple-400/10">
        <h3 className="mb-3 flex items-center space-x-2 text-sm font-semibold text-indigo-700 transition-colors duration-300 dark:text-indigo-300">
          <Info className="h-4 w-4" />
          <span>{t("api:howToGetApiKey")}</span>
        </h3>
        <ol className="space-y-2 text-xs text-gray-600 transition-colors duration-300 dark:text-slate-300">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 transition-colors duration-300 dark:bg-indigo-500/20 dark:text-indigo-300">
                {index + 1}
              </span>
              {renderMarkdownText(step)}
            </li>
          ))}
        </ol>
      </div>

      {/* Privacy note */}
      <div className="mt-4 text-center text-xs text-gray-500 transition-colors duration-300 dark:text-slate-400">
        <Lock className="mx-auto mb-1 h-3 w-3" />
        {t("api:apiKeyPrivacy")}
      </div>
    </>
  );
}
