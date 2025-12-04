import {
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_SOURCE_LANGUAGE_CODE,
} from "@/constants";
import { saveTranslation, translateWithGemini } from "@/services";
import { AppException, TranslationResult } from "@/types";
import {
  isDictionaryEntry,
  isSentenceTranslation,
  parseTranslationJSON,
  updatePopupHeight,
} from "@/utils";
import { useEffect, useState } from "react";

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
    chrome.storage.sync.get(
      ["translatedLangCode", "sourceLangCode"],
      (data) => {
        if (data.translatedLangCode) {
          setTranslatedLangCode(data.translatedLangCode);
        }
        if (data.sourceLangCode) {
          setSourceLangCode(data.sourceLangCode);
        }
      },
    );
  }, []);

  /**
   * Translates text using the current translated language
   */
  const translateText = async (text: string) => {
    setResult((prev) => ({
      ...prev,
      text,
      loading: true,
    }));

    try {
      // Get the most current language codes from storage to avoid stale state issues
      const {
        translatedLangCode: currentTranslatedLangCode,
        sourceLangCode: currentSourceLangCode,
      } = await chrome.storage.sync.get([
        "translatedLangCode",
        "sourceLangCode",
      ]);
      const translatedLang = currentTranslatedLangCode || DEFAULT_LANGUAGE_CODE;
      const sourceLang = currentSourceLangCode || DEFAULT_SOURCE_LANGUAGE_CODE;

      const rawResponse = await translateWithGemini(
        text,
        translatedLang,
        sourceLang,
      );

      // Parse the translation first - this will throw error if parsing fails
      // and stop the rest below
      const parsedTranslation = parseTranslationJSON(rawResponse);

      // add another field `word` or `text` to the parsedTranslation for UI display in the future
      if (isDictionaryEntry(parsedTranslation)) {
        parsedTranslation.word = text;
      } else if (isSentenceTranslation(parsedTranslation)) {
        parsedTranslation.text = text;
      }

      // Set successful result
      setResult((prev) => ({
        ...prev,
        translation: parsedTranslation,
        loading: false,
      }));

      // Save translation to history
      try {
        await saveTranslation(parsedTranslation);
      } catch (historyError) {
        console.error("Failed to save translation to history:", historyError);
        // Don't fail the translation if history saving fails
      }

      // Update popup height after translation is set
      updatePopupHeight();
    } catch (error) {
      // convert all of the errors to `AppException`
      // then keep transfering them to the component layer for i18n handling
      if (error instanceof AppException) {
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: error,
        }));
      } else if (error instanceof Error) {
        // Handle other generic errors
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: new AppException({
            code: "GENERAL_ERROR",
            data: { message: error.message },
          }),
        }));
      }

      // Update popup height after error is set
      updatePopupHeight();
    }
  };

  return {
    result,
    translatedLangCode,
    sourceLangCode,
    translateText,
  };
};
