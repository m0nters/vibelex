import { changeLanguage } from "@/config";
import { MAX_WORDS_LIMIT_PER_TRANSLATION } from "@/constants";
import { useDarkMode, useTranslation } from "@/hooks";
import "@/index.css";
import { ttsService } from "@/services";
import { AppException } from "@/types";
import { updatePopupHeight } from "@/utils";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation as useReactI18next } from "react-i18next";
import { TranslationRenderer } from "../TranslationRenderer";
import { PopupErrorState, PopupLoadingState, PopupTopBar } from "./components";

export function DictionaryPopup() {
  useDarkMode(); // Apply dark mode class to iframe document
  const { result, translateText } = useTranslation();
  const { t } = useReactI18next();
  const [showLoadingTip, setShowLoadingTip] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [finalLoadingTime, setFinalLoadingTime] = useState<number | null>(null); // final time after loading

  // Transferring messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // When this React popup component is ready (the `POPUP_READY` signal
      // below notifies the parent, aka the content script), the content script
      // will send back `TRANSLATE_TEXT` signal with the text to translate.
      //
      // Then, the popup need to tell the content script the size of itself
      // (through the `UPDATE_POPUP_HEIGHT` signal inside `useTranslation` hook)
      // so that content script can adjust the size of the popup container
      if (event.data.type === "TRANSLATE_TEXT") {
        // Since the page context (where this message from) is separate from
        // the popup context (where this message is handled), and the popup
        // context is the one that decides the interface language, we need to
        // communicate between them to display the correct language on UI
        changeLanguage(event.data.appLanguage).then(() => {
          translateText(event.data.text);
        });
      }
      // The content script sends this message when the popup is being closed
      // from OUTSIDE (e.g. user clicked outside the popup, or the extension was
      // disabled). We need to stop any playing TTS audio before the iframe gets
      // torn down by the content script.
      if (event.data.type === "PARENT_CLOSING_POPUP") {
        ttsService.stop();
      }
      // Listen for language changes from extension popup
      if (event.data.type === "LANGUAGE_CHANGED") {
        // Same reason as above: the page context is separate from the popup
        // context, so when the popup changes the language, the page
        // context needs to be informed to change accordingly
        changeLanguage(event.data.language);
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to parent that the component is ready
    window.parent.postMessage({ type: "POPUP_READY" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
      // Stop any playing TTS when popup unmounts
      ttsService.stop();
    };
  }, []);

  // Show tip after 10 seconds of loading
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (result.loading) {
      setShowLoadingTip(false);
      timer = setTimeout(() => {
        setShowLoadingTip(true);
      }, 10000);
    } else {
      setShowLoadingTip(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [result.loading]);

  // Timer to track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTime: number;

    if (result.loading) {
      startTime = Date.now();
      setLoadingTime(0);

      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setLoadingTime(elapsed);
      }, 100); // Update every 100ms for smooth display
    } else {
      if (loadingTime > 0) {
        setFinalLoadingTime(loadingTime);
      }
      setLoadingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [result.loading]);

  // Monitor content height changes and notify parent
  useEffect(() => {
    // Initial height update
    updatePopupHeight();

    // Update height whenever content changes
    const observer = new MutationObserver(() => {
      updatePopupHeight();
    });

    const contentWrapper = document.getElementById(
      "dictionary-content-wrapper",
    );
    if (contentWrapper) {
      observer.observe(contentWrapper, {
        childList: true,
        // subtree: true, // this causes a weird bug of playing a speaker when scrolling will update the scroll position of the popup
        attributes: true,
        characterData: true,
      });
    }

    // Also update on window resize
    const handleResize = () => updatePopupHeight();
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [result.loading, result.error, result.translation, showLoadingTip]);

  // Handle the close button (X) click inside the popup header.
  // We stop TTS ourselves first, then notify the content script to remove
  // the iframe from the DOM. The content script listens for this specific
  // event and destroys the iframe immediately (no delay needed since TTS
  // is already stopped).
  const closePopup = () => {
    ttsService.stop();
    window.parent.postMessage({ type: "POPUP_CLOSE_BUTTON_CLICKED" }, "*");
  };

  // Translate error codes to localized messages
  const getErrorMessage = (error: AppException): string => {
    switch (error.code) {
      case "TEXT_TOO_LONG":
        return t("errors:textTooLong", {
          maxWords: MAX_WORDS_LIMIT_PER_TRANSLATION,
          currentWords: parseInt(error.data?.wordCount || "0", 10),
        });
      case "API_KEY_MISSING":
        return t("errors:apiKeyMissing");
      case "GENERAL_ERROR": // for generic errors with message
        return (
          error.data?.message ||
          "An unknown error occurred with no message, this should not happen, contact admin for support"
        );
      default:
        return "Undefined error code, this should not happen, contact admin for support";
    }
  };

  return (
    <div className="z-99999 flex h-full w-full flex-col bg-white transition-colors duration-300 dark:bg-slate-900">
      <PopupTopBar
        finalLoadingTime={finalLoadingTime}
        isLoading={result.loading}
        onClose={closePopup}
      />

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-4"
        id="dictionary-content-wrapper"
      >
        <div className="w-full">
          {result.loading && (
            <PopupLoadingState
              loadingTime={loadingTime}
              showLoadingTip={showLoadingTip}
            />
          )}

          {result.error && (
            <PopupErrorState
              message={getErrorMessage(result.error)}
              onRetry={() => {
                if (result.text) translateText(result.text);
              }}
            />
          )}

          {!result.loading && !result.error && result.translation && (
            <TranslationRenderer translation={result.translation} />
          )}

          {!result.loading &&
            !result.error &&
            !result.translation &&
            result.text && (
              <p className="py-8 text-center text-sm text-gray-400 transition-colors duration-300 dark:text-slate-500">
                {t("popup:noTranslationAvailable")}
              </p>
            )}

          {!result.text && (
            <p className="py-8 text-center text-sm text-gray-400 transition-colors duration-300 dark:text-slate-500">
              {t("popup:selectTextToTranslate")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Initialize the popup
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<DictionaryPopup />);
}
