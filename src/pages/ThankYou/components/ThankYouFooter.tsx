import { useTranslation } from "react-i18next";

export function ThankYouFooter() {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex items-end justify-center gap-1 text-center">
      <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-slate-500">
        {t("thankYou:author")}
      </p>
      <a
        href="https://github.com/m0nters"
        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tài Trịnh
      </a>
    </div>
  );
}
