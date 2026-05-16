import { Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ToggleSwitchProps {
  initialValue?: boolean;
  onChange?: (enabled: boolean) => void;
  label?: string;
}

export function ToggleSwitch({
  initialValue = true,
  onChange,
  label = "Enable Extension",
}: ToggleSwitchProps) {
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
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
          enabled
            ? "bg-linear-to-r from-indigo-500 to-purple-600 focus:ring-indigo-500"
            : "bg-gray-300 focus:ring-gray-300 dark:bg-slate-700 dark:focus:ring-slate-700"
        }`}
        aria-pressed={enabled}
        aria-label={label}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 dark:bg-slate-100 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        >
          <Power
            className={`absolute top-0.5 left-0.5 h-3 w-3 transition-colors duration-200 ${
              enabled ? "text-indigo-500" : "text-gray-400 dark:text-slate-500"
            }`}
          />
        </span>
      </button>

      <span
        className={`text-xs font-medium transition-colors duration-200 ${
          enabled ? "text-gray-700 dark:text-slate-300" : "text-gray-400 dark:text-slate-500"
        }`}
      >
        {enabled ? t("common:on") : t("common:off")}
      </span>
    </div>
  );
}
