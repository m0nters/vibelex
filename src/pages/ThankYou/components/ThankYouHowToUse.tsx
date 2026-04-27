import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ThankYouHowToUse() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            {t("thankYou:howToUse")}
          </h3>
          <p className="leading-relaxed text-gray-600">
            {t("thankYou:usageDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}
