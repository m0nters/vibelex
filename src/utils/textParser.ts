import {
  DictionaryEntry,
  ParsedTranslation,
  PronunciationVariants,
  SentenceTranslation,
} from "@/types";
import { jsonrepair } from "jsonrepair";
import Markdown from "markdown-to-jsx";
import { createElement } from "react";

import { DictionaryEntrySchema, SentenceTranslationSchema } from "@/types";

/**
 * Renders text with support format using markdown-to-jsx
 */
export const renderText = (text: string) => {
  return createElement(Markdown, {
    options: {
      overrides: {
        code: {
          component: "code",
          props: {
            className:
              "bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono",
          },
        },
        a: {
          component: "a",
          props: {
            className:
              "font-semibold text-indigo-600 underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors hover:text-indigo-700 hover:decoration-indigo-400",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      },
    },
    children: text,
  });
};

/**
 * Checks if a translation CAN BE a dictionary entry (narrow check)
 */
export const isDictionaryEntry = (
  translation: ParsedTranslation,
): translation is DictionaryEntry => {
  return "word" in translation;
};

/**
 * Checks if a translation data is VALID dictionary entry (deep check) so that
 * the UI can parse
 */
export const isValidDictionaryEntry = (translation: any): boolean => {
  return DictionaryEntrySchema.safeParse(translation).success;
};

/**
 * Checks if a translation CAN BE a sentence/phrase (narrow check)
 */
export const isSentenceTranslation = (
  translation: ParsedTranslation,
): translation is SentenceTranslation => {
  return "text" in translation;
};

/**
 * Checks if a translation data is VALID sentence/phrase (deep check) so that
 * the UI can parse
 */
export const isValidSentenceTranslation = (translation: any): boolean => {
  return SentenceTranslationSchema.safeParse(translation).success;
};

/**
 * Checks if pronunciation has variants (UK/US)
 */
export const hasPronunciationVariants = (
  pronunciation: string | PronunciationVariants,
): pronunciation is PronunciationVariants => {
  return typeof pronunciation === "object" && pronunciation !== null;
};

/**
 * Parses the JSON translation content from the API
 */
export const parseTranslationJSON = (content: string): ParsedTranslation => {
  try {
    const repairedJson = jsonrepair(content); // AI generated JSON format can be malformed, this 3rd party lib repairs it
    const parsed = JSON.parse(repairedJson);

    // Try to validate as DictionaryEntry first
    if (isDictionaryEntry(parsed)) {
      if (isValidDictionaryEntry(parsed)) {
        return parsed as DictionaryEntry;
      }
    }
    // Try to validate as SentenceTranslation
    else if (isSentenceTranslation(parsed)) {
      if (isValidSentenceTranslation(parsed)) {
        return parsed as SentenceTranslation;
      }
    }

    throw new Error("Invalid JSON structure");
  } catch (error) {
    console.error("Failed to parse JSON translation:", error);
    console.error("Content that failed to parse:", content);

    throw new Error("Failed to parse JSON translation");
  }
};
