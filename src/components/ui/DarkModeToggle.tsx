import { useDarkMode } from "@/hooks";
import { Moon, Sun } from "lucide-react";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className = "" }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`cursor-pointer p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm ${className}`}
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600" />
      )}
    </button>
  );
}
