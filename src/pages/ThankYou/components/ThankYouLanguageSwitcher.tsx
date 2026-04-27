import { DropdownMenu } from "@/components";
import { SUPPORTED_APP_LANGUAGE } from "@/constants";
import { useTranslation } from "react-i18next";

interface ThankYouLanguageSwitcherProps {
  onLanguageChange: (langCode: string) => void;
}

export function ThankYouLanguageSwitcher({
  onLanguageChange,
}: ThankYouLanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const languageOptions = SUPPORTED_APP_LANGUAGE.map((lang) => ({
    value: lang.code,
    label: lang.nativeName,
  }));

  return (
    <div className="absolute top-4 right-4 z-20">
      <DropdownMenu
        value={i18n.language}
        options={languageOptions}
        onChange={onLanguageChange}
        className="min-w-[140px]"
        focusColor="indigo"
      />
    </div>
  );
}
