import { Info, MousePointer2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UsageInstructionsProps {
  extensionEnabled: boolean;
}

export function UsageInstructions({ extensionEnabled }: UsageInstructionsProps) {
  const { t } = useTranslation();

  const dotClass = `mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
    !extensionEnabled ? "bg-gray-400" : "bg-indigo-400"
  }`;

  return (
    <div
      className={`mt-4 rounded-xl border border-indigo-200/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-4 transition-all duration-300 dark:border-indigo-400/20 dark:from-indigo-400/10 dark:to-purple-400/10 ${
        !extensionEnabled ? "border-gray-300/30 bg-gray-500/10 opacity-50 dark:border-slate-700/30 dark:bg-slate-800/50" : ""
      }`}
    >
      <h3
        className={`mb-2 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
          !extensionEnabled ? "text-gray-500 dark:text-slate-500" : "text-indigo-700 dark:text-indigo-300"
        }`}
      >
        <Info
          className={`h-4 w-4 transition-colors duration-300 ${
            !extensionEnabled ? "text-gray-400" : ""
          }`}
        />
        <span>{t("mainScreen:howToUse")}</span>
      </h3>
      <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300">
        <li className="flex items-start space-x-2">
          <span className={dotClass}></span>
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
          <span className={dotClass}></span>
          <span>{t("mainScreen:step3")}</span>
        </li>
      </ul>
    </div>
  );
}
