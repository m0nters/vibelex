import { KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteApiKeySectionProps {
  onDeleteApiKey: () => void;
}

export function DeleteApiKeySection({
  onDeleteApiKey,
}: DeleteApiKeySectionProps) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mt-4">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 transition-colors duration-300 hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/40"
        >
          <KeyRound className="h-4 w-4" />
          <span>{t("api:deleteApiKey")}</span>
        </button>
      ) : (
        <div className="animate-fade-in rounded-xl border-2 border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="mb-3 text-center text-sm font-semibold text-red-700 transition-colors duration-300 dark:text-red-300">
            {t("api:deleteApiKeyConfirm")}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onDeleteApiKey();
                setShowConfirm(false);
              }}
              className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("api:confirmDelete")}</span>
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 cursor-pointer rounded-lg border-2 border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 transition-colors duration-300 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t("common:cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
