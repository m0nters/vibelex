import { changeLanguage } from "@/config";
import {
  ApiKeyScreen,
  HistoryDetailScreen,
  HistoryScreen,
  MainScreen,
  StatisticsScreen,
} from "@/pages";
import { CachedScrollRestoration } from "@/components/CachedScrollRestoration";
import { KeepAlive } from "keepalive-for-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const MAX_CACHED_VISITS = 20;

interface CachedScreensProps {
  apiKey: string | null;
  onApiKeySubmit: (apiKey: string) => void;
  onDeleteApiKey: () => Promise<void>;
}

function CachedScreens({
  apiKey,
  onApiKeySubmit,
  onDeleteApiKey,
}: CachedScreensProps) {
  const location = useLocation();
  const activeCacheKey = `${location.key}:${apiKey ? "configured" : "setup"}`;

  return (
    <div className="relative h-143.5 w-100 overflow-hidden bg-linear-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900">
      <KeepAlive
        activeCacheKey={activeCacheKey}
        max={MAX_CACHED_VISITS}
        enableActivity
      >
        <CachedScrollRestoration>
          <Routes location={location}>
            <Route
              path="/"
              element={
                apiKey ? (
                  <MainScreen onDeleteApiKey={onDeleteApiKey} />
                ) : (
                  <ApiKeyScreen onApiKeySubmit={onApiKeySubmit} />
                )
              }
            />
            <Route
              path="/history"
              element={<HistoryScreen location={location} />}
            />
            <Route
              path="/history/:id"
              element={<HistoryDetailScreen location={location} />}
            />
            <Route path="/statistics" element={<StatisticsScreen />} />
          </Routes>
        </CachedScrollRestoration>
      </KeepAlive>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load saved settings once at mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await chrome.storage.sync.get([
          "appLangCode",
          "geminiApiKey",
        ]);

        if (data.appLangCode && data.appLangCode !== i18n.language) {
          changeLanguage(data.appLangCode);
        }

        if (data.geminiApiKey) {
          setApiKey(data.geminiApiKey);
        }
      } catch (error) {
        console.error("Failed to load settings from storage:", error);
      }
    };
    loadSettings();
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const handleDeleteApiKey = async () => {
    setApiKey(null);

    try {
      // Remove API key from chrome storage
      await chrome.storage.sync.remove("geminiApiKey");

      // Set extensionEnabled to false
      await chrome.storage.sync.set({ extensionEnabled: false });

      // Broadcast extension disabled to all tabs
      const tabs = await chrome.tabs.query({});
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
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  return (
    <MemoryRouter>
      <CachedScreens
        apiKey={apiKey}
        onApiKeySubmit={handleApiKeySubmit}
        onDeleteApiKey={handleDeleteApiKey}
      />
    </MemoryRouter>
  );
}
export default App;
