import { changeLanguage } from "@/config/i18n";
import { DarkModeToggle } from "@/components";
import { useEffect, useState } from "react";
import {
  ThankYouActions,
  ThankYouBackground,
  ThankYouFeatures,
  ThankYouFooter,
  ThankYouHero,
  ThankYouHowToUse,
  ThankYouLanguageSwitcher,
} from "./components";

export function ThankYou() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLanguageChange = async (value: string) => {
    if (value === selectedLanguage) return;
    setSelectedLanguage(value);
    setIsVisible(false);
    setTimeout(async () => {
      await changeLanguage(value);
      setIsVisible(true);
    }, 800);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-gray-100 to-indigo-100 p-4 transition-colors duration-300 dark:from-slate-900 dark:to-indigo-950">
      <ThankYouBackground />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
        <DarkModeToggle />
        <ThankYouLanguageSwitcher onLanguageChange={handleLanguageChange} />
      </div>

      {/* Main content with fade-in animation */}
      <div
        className={`relative z-10 w-full max-w-4xl transform transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <ThankYouHero />
        <ThankYouFeatures />
        <ThankYouHowToUse />
        <ThankYouActions />
        <ThankYouFooter />
      </div>
    </div>
  );
}
