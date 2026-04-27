import { changeLanguage } from "@/config/i18n";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-gray-100 to-indigo-100 p-4">
      <ThankYouBackground />

      <ThankYouLanguageSwitcher onLanguageChange={handleLanguageChange} />

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
