import { changeLanguage } from "@/config";
import { MAX_WORDS_LIMIT_PER_TRANSLATION } from "@/constants";
import { useDarkMode, useTranslation } from "@/hooks";
import "@/index.css";
import { ttsService } from "@/services";
import { AppException } from "@/types";
import { updatePopupHeight } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation as useReactI18next } from "react-i18next";
import { TranslationRenderer } from "../TranslationRenderer";
import {
  PopupErrorState,
  PopupLanguageSelector,
  PopupLoadingState,
  PopupTopBar,
} from "./components";

export function DictionaryPopup() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    result,
    sourceLangCode,
    translatedLangCode,
    translateText,
    changeSourceLang,
    changeTargetLang,
  } = useTranslation();
  const { t } = useReactI18next();
  const [showLoadingTip, setShowLoadingTip] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [finalLoadingTime, setFinalLoadingTime] = useState<number | null>(null); // final time after loading
  const startTimeRef = useRef<number>(0);

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
  }, [result.loading, translatedLangCode, sourceLangCode]);

  // Timer to track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (result.loading) {
      startTimeRef.current = Date.now();
      setLoadingTime(0);

      interval = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setLoadingTime(elapsed);
      }, 100); // Update every 100ms for smooth display
    } else {
      if (startTimeRef.current > 0) {
        const totalElapsed = (Date.now() - startTimeRef.current) / 1000;
        setFinalLoadingTime(totalElapsed);
        startTimeRef.current = 0; // Reset
      }
      setLoadingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [result.loading, translatedLangCode, sourceLangCode]);

  // Monitor content height changes and notify parent
  useEffect(() => {
    // Ensure body has the correct background classes to avoid white flashes
    // when scrolling past bounds.
    document.body.classList.add(
      "bg-white",
      "transition-colors",
      "duration-300",
      "dark:bg-slate-900",
    );

    // Update height when content state changes (loading → result/error,
    // or when the loading tip appears).
    updatePopupHeight();

    // Also update on window resize
    const handleResize = () => updatePopupHeight();
    window.addEventListener("resize", handleResize);

    return () => {
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

  // Detect when the iframe loses focus entirely (e.g. user clicked extension popup
  // or switched tabs while focus was inside the iframe)
  // This makes debugging harder on client side
  useEffect(() => {
    const handleBlur = () => {
      // Wait 10ms for the browser to stabilize the focus shift.
      setTimeout(() => {
        if (!document.hasFocus()) {
          ttsService.stop();
          window.parent.postMessage({ type: "POPUP_BLURRED" }, "*");
        }
      }, 10);
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

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
    <div className="z-99999 flex max-h-screen min-h-screen w-full flex-col bg-white transition-colors duration-300 dark:bg-slate-900">
      <PopupTopBar
        finalLoadingTime={finalLoadingTime}
        isLoading={result.loading}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onClose={closePopup}
      />

      {/* Language selector bar */}
      <PopupLanguageSelector
        sourceLangCode={sourceLangCode}
        translatedLangCode={translatedLangCode}
        onChangeSource={(code) => {
          setFinalLoadingTime(null);
          changeSourceLang(code);
        }}
        onChangeTarget={(code) => {
          setFinalLoadingTime(null);
          changeTargetLang(code);
        }}
        onDropdownOpenChange={() => {
          // Delay slightly to let the dropdown's CSS transition render,
          // then re-measure height (including the absolute dropdown).
          setTimeout(() => updatePopupHeight(), 50);
        }}
      />

      {/* Scrollable content area — overflow-y-auto is managed by
           updatePopupHeight: only enabled when content exceeds MAX_HEIGHT.
           min-h-0 overrides the default min-height:auto so flex-1 can
           constrain the wrapper height and allow overflow scrolling. */}
      <div className="min-h-0 flex-1 px-4 pb-4" id="dictionary-content-wrapper">
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
