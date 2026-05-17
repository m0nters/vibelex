import { DarkModeToggle, ExtensionToggle } from "@/components";
import { useTranslation } from "react-i18next";

interface MainScreenHeaderProps {
  extensionEnabled: boolean;
  onExtensionToggle: (enabled: boolean) => void;
}

export function MainScreenHeader({
  extensionEnabled,
  onExtensionToggle,
}: MainScreenHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="relative z-10 p-6 pb-0">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo/logo.png" alt="App Logo" className="h-16 w-16" />
          <div>
            <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent transition-colors duration-300 dark:from-indigo-400 dark:to-purple-400">
              VibeLex
            </h1>
            <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-slate-400">
              {t("mainScreen:appSubtitle")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end space-y-3">
          {/* Toggle Switch */}
          <ExtensionToggle
            initialValue={extensionEnabled}
            onChange={onExtensionToggle}
            label="Toggle Extension"
          />

          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
}
