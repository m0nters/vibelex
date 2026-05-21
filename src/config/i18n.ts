import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE_CODE } from "@/constants";
import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// Dynamically discover available namespaces from locale files
// In production, Vite will bundle these, but we need to know them at build time
// Note: This uses Vite's import.meta.glob for static analysis at build time
const localeModules = import.meta.glob("/public/locales/en/*.json", {
  eager: false,
});

// Extract namespace names from file paths
export const NAMESPACES = Object.keys(localeModules)
  .map((path) => {
    // Extract filename without extension from path like '/public/locales/en/common.json'
    const match = path.match(/\/([^/]+)\.json$/);
    return match ? match[1] : "";
  })
  .filter(Boolean);

// Fallback for development/testing if glob doesn't work
if (NAMESPACES.length === 0) {
  console.warn("No namespaces found via import.meta.glob, using fallback list");
}

// i18n configuration
i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANGUAGE_CODE,
    fallbackLng: DEFAULT_LANGUAGE_CODE,

    // Namespaces configuration
    ns: NAMESPACES,
    defaultNS: "common",

    // Backend configuration
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      addPath: "/locales/{{lng}}/{{ns}}.missing.json",
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // React specific options
    react: {
      useSuspense: false, // Better for extension environment
    },

    // Chrome extension specific setup
    load: "currentOnly", // Only load current language to reduce bundle size
    preload: [DEFAULT_LANGUAGE_CODE], // Preload default language

    // Only allow supported languages
    supportedLngs: AVAILABLE_LANGUAGES.map((lang) => lang.code),

    // Fallback configuration
    saveMissing: process.env.NODE_ENV === "development",
    saveMissingTo: "current",
  });

// Custom function to change language and save to Chrome storage
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);

    // Save to Chrome storage
    try {
      await chrome.storage.sync.set({ appLangCode: languageCode });
    } catch (error) {
      console.error("Failed to save app language to storage:", error);
    }

    // Broadcast language change to all content scripts (dictionary popups)
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "LANGUAGE_CHANGED",
              language: languageCode,
            })
            .catch(() => {
              // Silently handle content script not being available
            });
        }
      });
    } catch (error) {
      // Silently handle tabs query failure
    }
  } catch (error) {
    console.error("Failed to change app language:", error);
  }
};

export default i18n;
