import { Key } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ApiKeyHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 shadow-lg transition-colors duration-300">
        <Key className="h-8 w-8 text-white" />
      </div>
      <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent transition-colors duration-300">
        {t("api:apiKeyRequired")}
      </h1>
      <p className="mt-2 text-sm text-gray-600 transition-colors duration-300 dark:text-slate-300">
        {t("api:apiKeyDescription")}
      </p>
    </div>
  );
}
