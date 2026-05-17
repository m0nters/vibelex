import { useTranslation } from "react-i18next";

export function DisabledOverlay() {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-900/10 backdrop-blur-xs transition-colors duration-300 dark:bg-black/40">
      <div className="text-center">
        <div className="mb-1 text-sm font-semibold text-black transition-colors duration-300 dark:text-slate-300">
          {t("mainScreen:extensionDisabled")}
        </div>
        <div className="text-xs text-gray-900 transition-colors duration-300 dark:text-slate-300">
          {t("mainScreen:toggleToEnable")}
        </div>
      </div>
    </div>
  );
}
