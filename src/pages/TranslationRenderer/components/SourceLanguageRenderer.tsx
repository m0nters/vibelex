import { useTranslation } from "react-i18next";
import "/node_modules/flag-icons/css/flag-icons.min.css";

interface SourceLanguageRendererProps {
  sourceLangCode: string;
  mainCountryCode?: string | null;
  isAutoDetected: boolean;
}

export function SourceLanguageRenderer({
  sourceLangCode,
  mainCountryCode,
  isAutoDetected,
}: SourceLanguageRendererProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center justify-center rounded-lg border border-gray-200 bg-linear-to-r from-gray-50 to-blue-50 p-3 shadow-sm dark:border-slate-800 dark:from-slate-800/80 dark:to-blue-900/20">
      <div className="flex flex-wrap items-center justify-center space-x-2">
        <div className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {`${t("popup:sourceLanguage")}:`}
        </div>
        <div className="flex items-center space-x-2">
          {mainCountryCode && (
            <span className={`fi fi-${mainCountryCode} scale-120`}></span>
          )}
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {isAutoDetected
              ? `${t(`languages:${sourceLangCode}`)} (${t("popup:autoDetect")})`
              : t(`languages:${sourceLangCode}`)}
          </div>
        </div>
      </div>
    </div>
  );
}
