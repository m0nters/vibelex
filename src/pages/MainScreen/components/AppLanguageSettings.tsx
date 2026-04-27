import { DropdownMenu } from "@/components";
import { SUPPORTED_APP_LANGUAGE } from "@/constants";
import { Check, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AppLanguageSettingsProps {
  extensionEnabled: boolean;
  appLangCode: string;
  saved: boolean;
  onChangeAppLanguage: (langCode: string) => void;
}

export function AppLanguageSettings({
  extensionEnabled,
  appLangCode,
  saved,
  onChangeAppLanguage,
}: AppLanguageSettingsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`mt-4 rounded-2xl border-2 p-5 transition-all duration-300 ${
        !extensionEnabled
          ? "border-gray-300/30 bg-gray-100/70"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div>
        <label
          className={`mb-3 flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 ${
            !extensionEnabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          <Settings
            className={`h-4 w-4 transition-colors duration-300 ${
              !extensionEnabled ? "text-gray-400" : "text-purple-500"
            }`}
          />
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
