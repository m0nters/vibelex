import { changeLanguage } from "@/config";
import {
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants";
import {
  ApiKeyScreen,
  HistoryDetailScreen,
  HistoryScreen,
  MainScreen,
  StatisticsScreen,
} from "@/pages";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";

function App() {
  const { i18n } = useTranslation();
  const [appLangCode, setAppLangCode] = useState<string>(DEFAULT_LANGUAGE_CODE);
  const [sourceLangCode, setSourceLangCode] = useState<string>(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );
  const [translatedLangCode, setTranslatedLangCode] = useState<string>(
    DEFAULT_LANGUAGE_CODE,
  );
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load saved settings once at mount
  useEffect(() => {
    chrome.storage.sync.get(
      [
        "translatedLangCode",
        "appLangCode",
        "sourceLangCode",
        "extensionEnabled",
        "geminiApiKey",
      ],
      (data) => {
        if (
          data.translatedLangCode &&
          data.translatedLangCode !== DEFAULT_LANGUAGE_CODE
        ) {
          setTranslatedLangCode(data.translatedLangCode);
        }

        if (data.appLangCode && data.appLangCode !== i18n.language) {
          setAppLangCode(data.appLangCode);
          changeLanguage(data.appLangCode);
        }

        if (
          data.sourceLangCode &&
          data.sourceLangCode !== DEFAULT_SOURCE_LANGUAGE_CODE
        ) {
          setSourceLangCode(data.sourceLangCode);
        }

        if (typeof data.extensionEnabled === "boolean") {
          setExtensionEnabled(data.extensionEnabled);
        }

        if (data.geminiApiKey) {
          setApiKey(data.geminiApiKey);
        }
      },
    );
  }, []);

  const handleChangeSourceLanguage = (value: string) => {
    if (value === sourceLangCode) return; // just a double check, we have checked this in MainScreen already
    setSourceLangCode(value);

    chrome.storage.sync.set({ sourceLangCode: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to save source language to storage:",
          chrome.runtime.lastError,
        );
        return;
      }
    });
  };

  const handleChangeTranslatedLanguage = (value: string) => {
    if (value === translatedLangCode) return;
    setTranslatedLangCode(value);

    chrome.storage.sync.set({ translatedLangCode: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to save translated language to storage:",
          chrome.runtime.lastError,
        );
        return;
      }
    });
  };

  const handleChangeAppLanguage = async (value: string) => {
    if (value === appLangCode) return;

    // Update local state immediately for responsive UI
    setAppLangCode(value);

    try {
      await changeLanguage(value);
      // Broadcast language change to all content scripts (dictionary popups)
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: "LANGUAGE_CHANGED",
              language: value,
            });
          }
        });
      });
    } catch (error) {
      console.error("Failed to change app language:", error);
      // Revert local state on error
      setAppLangCode(i18n.language);
    }
  };

  const handleExtensionToggle = (enabled: boolean) => {
    setExtensionEnabled(enabled);

    // Save to chrome storage
    chrome.storage.sync.set({ extensionEnabled: enabled }, () => {
      if (chrome.runtime.lastError) {
        console.warn(
          "Failed to save extension enabled state:",
          chrome.runtime.lastError,
        );
        return;
      }
      // Broadcast to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs
              .sendMessage(tab.id, {
                type: "EXTENSION_TOGGLE",
                enabled: enabled,
              })
              .catch(() => {
                // Silently handle content script not being available
                // This is normal for pages where content scripts don't run
              });
          }
        });
      });
    });
  };

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
    handleExtensionToggle(true); // first time API key submission enables the extension

    // Save to chrome storage
    chrome.storage.sync.set({ geminiApiKey: newApiKey }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to save API key to storage:",
          chrome.runtime.lastError,
        );
      }
    });
  };

  const handleDeleteApiKey = () => {
    setApiKey(null);
    handleExtensionToggle(false);

    // Remove from chrome storage
    chrome.storage.sync.remove("geminiApiKey", () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to delete API key from storage:",
          chrome.runtime.lastError,
        );
      }
    });
  };

  return (
    <MemoryRouter>
      <div className="relative h-[574px] w-100 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              apiKey ? (
                <MainScreen
                  appLangCode={appLangCode}
                  sourceLangCode={sourceLangCode}
                  translatedLangCode={translatedLangCode}
                  onChangeSourceLanguage={handleChangeSourceLanguage}
                  onChangeTranslatedLanguage={handleChangeTranslatedLanguage}
                  onChangeAppLanguage={handleChangeAppLanguage}
                  extensionEnabled={extensionEnabled}
                  onExtensionToggle={handleExtensionToggle}
                  onDeleteApiKey={handleDeleteApiKey}
                />
              ) : (
                <ApiKeyScreen
                  onApiKeySubmit={handleApiKeySubmit}
                  appLangCode={appLangCode}
                  onChangeAppLanguage={handleChangeAppLanguage}
                />
              )
            }
          />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:id" element={<HistoryDetailScreen />} />
          <Route path="/statistics" element={<StatisticsScreen />} />
        </Routes>
      </div>
    </MemoryRouter>
  );
}
export default App;
