import { changeLanguage } from "@/config";
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
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load saved settings once at mount
  useEffect(() => {
    chrome.storage.sync.get(["appLangCode", "geminiApiKey"], (data) => {
      if (data.appLangCode && data.appLangCode !== i18n.language) {
        changeLanguage(data.appLangCode);
      }

      if (data.geminiApiKey) {
        setApiKey(data.geminiApiKey);
      }
    });
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const handleDeleteApiKey = () => {
    setApiKey(null);
    // Remove from chrome storage
    chrome.storage.sync.remove("geminiApiKey", () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to delete API key from storage:",
          chrome.runtime.lastError,
        );
      }
    });
    // Set extensionEnabled to false
    chrome.storage.sync.set({ extensionEnabled: false }, () => {
      // Broadcast extension enabled to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs
              .sendMessage(tab.id, {
                type: "EXTENSION_TOGGLE",
                enabled: false,
              })
              .catch(() => {});
          }
        });
      });
    });
  };

  return (
    <MemoryRouter>
      <div className="relative h-[574px] w-100 overflow-hidden bg-linear-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900">
        <Routes>
          <Route
            path="/"
            element={
              apiKey ? (
                <MainScreen onDeleteApiKey={handleDeleteApiKey} />
              ) : (
                <ApiKeyScreen onApiKeySubmit={handleApiKeySubmit} />
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
