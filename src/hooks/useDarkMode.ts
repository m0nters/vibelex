import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const themeValue = isDarkMode ? "dark" : "light";

    root.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", themeValue);

    const syncTheme = async () => {
      try {
        await chrome.storage.local.set({ theme: themeValue });
        const tabs = await chrome.tabs.query({});
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs
              .sendMessage(tab.id, { type: "THEME_CHANGED" })
              .catch(() => {});
          }
        });
      } catch (error) {
        // Silently handle storage/tabs failure
      }
    };
    syncTheme();
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleDarkMode };
}
