import {
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants";
import { saveTranslation, translateWithGemini } from "@/services";
import { AppException, TranslationResult } from "@/types";
import {
  isSentenceTranslation,
  parseTranslationJSON,
  updatePopupHeight,
} from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing translation state and functionality
 */
export const useTranslation = () => {
  const [result, setResult] = useState<TranslationResult>({
    text: "",
    translation: undefined,
    loading: false,
    error: undefined,
  });
  const [translatedLangCode, setTranslatedLangCode] = useState(
    DEFAULT_LANGUAGE_CODE,
  );
  const [sourceLangCode, setSourceLangCode] = useState(
    DEFAULT_SOURCE_LANGUAGE_CODE,
  );

  // Load saved language settings from Chrome storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await chrome.storage.sync.get([
          "translatedLangCode",
          "sourceLangCode",
        ]);

        if (data.translatedLangCode) {
          setTranslatedLangCode(data.translatedLangCode);
        }

        if (data.sourceLangCode) {
          setSourceLangCode(data.sourceLangCode);
        }
      } catch (error) {
        console.error("Failed to load settings from storage:", error);
      }
    };
    loadSettings();
  }, []);

  // Keep track of the current abort controller to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Translates text using the current translated language
   */
  const translateText = async (text: string) => {
    // Abort the previous request if it's still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setResult((prev) => ({
      ...prev,
      text,
      loading: true,
      error: undefined,
    }));

    try {
      // Get the most current language codes from storage to avoid stale state issues.
      // Falls back to current state values if storage read fails.
      const data = (await chrome.storage.sync
        .get(["translatedLangCode", "sourceLangCode"])
        .catch(() => ({}))) as any;

      const newTranslatedLangCode =
        data.translatedLangCode ?? translatedLangCode ?? DEFAULT_LANGUAGE_CODE;
      const newSourceLangCode =
        data.sourceLangCode ?? sourceLangCode ?? DEFAULT_SOURCE_LANGUAGE_CODE;

      const rawResponse = await translateWithGemini(
        text,
        newTranslatedLangCode,
        newSourceLangCode,
        abortController.signal,
      );

      // Parse the translation first - this will throw error if parsing fails
      // and stop the rest below
      const parsedTranslation = parseTranslationJSON(rawResponse);

      /*
        A sentence has a lot of words (at least on average), if we include this
        field `text` in the prompt at the beginning, the AI will just rewrite
        the whole input in the response, which wastes a lot of tokens, so we
        only need AI to provide the `translation` field, and we manually add
        this field `text` to the translation post-parse for UI display

        Experiments show that we can reduce the output tokens by 33% on average
        by doing this! Which saves us a lot of money.
      */
      if (isSentenceTranslation(parsedTranslation)) {
        parsedTranslation.text = text;
      }

      // Set successful result
      setResult((prev) => ({
        ...prev,
        translation: parsedTranslation,
        loading: false,
      }));

      // Non-fatal: don't fail the translation if history saving fails
      await saveTranslation(parsedTranslation).catch((err) =>
        console.error("Failed to save translation to history:", err),
      );

      // Update popup height after translation is set
      updatePopupHeight();
    } catch (error) {
      // If the request was aborted, just return and do nothing (don't set error state)
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      // Normalize all errors to AppException for i18n handling in the component layer
      const appError =
        error instanceof AppException
          ? error
          : new AppException({
              code: "GENERAL_ERROR",
              data: { message: (error as Error).message },
            });

      setResult((prev) => ({ ...prev, loading: false, error: appError }));
      updatePopupHeight();
    }
  };

  // Keep a ref to the latest `result.text` so that the `changeSourceLang` /
  // `changeTargetLang` callbacks can read the current value without needing
  // `result` in their dependency arrays (which would cause them to be recreated
  // on every render).
  const currentTextRef = useRef(result.text);
  currentTextRef.current = result.text;

  /**
   * Change the source language, persist to storage, and re-translate the
   * current text (if any).
   */
  const changeSourceLang = useCallback(
    async (code: string) => {
      setSourceLangCode(code);
      try {
        await chrome.storage.sync.set({ sourceLangCode: code });
      } catch (error) {
        console.error("Failed to save source language to storage:", error);
      }
      if (currentTextRef.current) {
        translateText(currentTextRef.current);
      }
    },
    [translateText],
  );

  /**
   * Change the target (translated) language, persist to storage, and
   * re-translate the current text (if any).
   */
  const changeTargetLang = useCallback(
    async (code: string) => {
      setTranslatedLangCode(code);
      try {
        await chrome.storage.sync.set({ translatedLangCode: code });
      } catch (error) {
        console.error(
          "Failed to save translated language to storage:",
          error,
        );
      }
      if (currentTextRef.current) {
        translateText(currentTextRef.current);
      }
    },
    [translateText],
  );

  return {
    result,
    translatedLangCode,
    sourceLangCode,
    translateText,
    changeSourceLang,
    changeTargetLang,
  };
};
