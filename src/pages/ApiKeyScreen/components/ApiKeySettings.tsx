import { DropdownMenu } from "@/components";
import { SUPPORTED_APP_LANGUAGE } from "@/constants";
import { Check, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ApiKeySettingsProps {
  appLangCode: string;
  saved: boolean;
  onChangeAppLanguage: (langCode: string) => void;
}

export function ApiKeySettings({
  appLangCode,
  saved,
  onChangeAppLanguage,
}: ApiKeySettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 rounded-2xl border-2 border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800">
      <div>
        <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-slate-200">
          <Settings className="h-4 w-4 text-purple-500" />
          <span>{t("mainScreen:appLanguage")}</span>
        </label>

        <DropdownMenu
          value={appLangCode}
          options={SUPPORTED_APP_LANGUAGE.map((lang) => ({
            value: lang.code,
            label: lang.nativeName,
          }))}
          onChange={onChangeAppLanguage}
          focusColor="purple"
          isSorted={false}
        />
      </div>

      {/* Save indicator */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          saved ? "mt-3 max-h-20" : "mt-0 max-h-0"
        }`}
      >
        <div className="animate-fade-in flex items-center space-x-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-xs font-medium">{t("mainScreen:saved")}</span>
        </div>
      </div>
    </div>
  );
}
