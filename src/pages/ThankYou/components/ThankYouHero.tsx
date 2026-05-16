import { useTranslation } from "react-i18next";

export function ThankYouHero() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center">
      <img src="/logo/logo.png" alt="App Logo" className="h-36 w-36" />

      <h1 className="mb-4 text-5xl font-bold text-gray-800 md:text-6xl dark:text-slate-300">
        <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t("thankYou:title")}
        </span>
      </h1>

      <p className="mx-auto max-w-md text-xl leading-relaxed text-gray-600 dark:text-slate-400">
        {t("thankYou:subtitle")}
      </p>
    </div>
  );
}
