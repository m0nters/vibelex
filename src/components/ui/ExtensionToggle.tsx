import { Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ExtensionToggleProps {
  initialValue?: boolean;
  onChange?: (enabled: boolean) => void;
  label?: string;
}

export function ExtensionToggle({
  initialValue = true,
  onChange,
  label = "Enable Extension",
}: ExtensionToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);

  // Update internal state when initialValue changes
  useEffect(() => {
    setEnabled(initialValue);
  }, [initialValue]);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onChange?.(newState);
  };

  const { t } = useTranslation();

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
        enabled
          ? "bg-linear-to-r from-indigo-500 to-purple-600 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
          : "bg-gray-300 focus-visible:ring-gray-300 dark:bg-slate-700 dark:focus-visible:ring-slate-600"
      }`}
      aria-pressed={enabled}
      title={
        enabled ? t("common:disableExtension") : t("common:enableExtension")
      }
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 dark:bg-slate-100 ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      >
        <Power
          className={`absolute top-0.5 left-0.5 h-3 w-3 transition-colors duration-300 ${
            enabled ? "text-indigo-500" : "text-gray-400 dark:text-slate-500"
          }`}
        />
      </span>
    </button>
  );
}
