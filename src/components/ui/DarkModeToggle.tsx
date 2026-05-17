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
      className={`cursor-pointer rounded-full bg-white/50 p-2 shadow-sm transition-colors duration-300 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-700 ${className}`}
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
