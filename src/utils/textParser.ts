import {
  DictionaryEntry,
  ParsedTranslation,
  PronunciationVariants,
  SentenceTranslation,
} from "@/types";
import { closest, distance } from "fastest-levenshtein";
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
 * Checks if a translation CAN BE a dictionary entry (narrow check, fast,
 * theoretically can return false positives in edge cases, but very reliable for
 * normal use), use for frequent checking tasks like conditional rendering,
 * search history, filters, etc.
 */
export const isDictionaryEntry = (
  translation: ParsedTranslation,
): translation is DictionaryEntry => {
  return "word" in translation;
};

/**
 * Checks if a translation data is VALID dictionary entry (deep check, slower,
 * but guaranteed to be accurate), only use for correctness-critical mission like
 * pre-parsing or sanitizing data before storing.
 *
 * NOTE: The data goes into Zod's `.safeParse()`. By default, Zod is extremely
 * forgiving with extra keys. It simply ignores keys that aren't defined in the
 * schema. If all the required keys are present, Zod says success: true.
 */
export const isValidDictionaryEntry = (translation: any): boolean => {
  return DictionaryEntrySchema.safeParse(translation).success;
};

/**
 * Checks if a translation CAN BE a sentence/phrase
 */
export const isSentenceTranslation = (
  translation: ParsedTranslation,
): translation is SentenceTranslation => {
  return "translation" in translation;
};

/**
 * Checks if a translation data is VALID sentence/phrase
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

const EXPECTED_KEYS = [
  "source_language_code",
  "translated_language_code",
  "source_language_main_country_code",
  "translated_language_main_country_code",
  "source_tts_language_code",
  "translated_tts_language_code",
  "word",
  "verb_forms",
  "label",
  "form",
  "meanings",
  "pronunciation",
  "ipa",
  "tts_code",
  "part_of_speech",
  "definition",
  "note",
  "synonyms",
  "items",
  "idioms",
  "idiom",
  "phrasal_verbs",
  "phrasal_verb",
  "examples",
  "text",
  "translation",
  "meaning",
];

/** Max edit distance ratio (distance / key length) to consider a match */
const MAX_DISTANCE_RATIO = 0.4;

/**
 * Finds the closest expected key for a given unknown key using Levenshtein distance
 */
const findClosestKey = (key: string): string | null => {
  const match = closest(key, EXPECTED_KEYS);
  const maxAllowed = Math.ceil(key.length * MAX_DISTANCE_RATIO);
  return distance(key, match) <= maxAllowed ? match : null;
};

/**
 * Recursively fixes typos in JSON keys using Levenshtein distance against EXPECTED_KEYS
 */
export const fixJsonKeys = (data: any): any => {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => fixJsonKeys(item));
  }

  const fixedObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    let finalKey = key;

    if (!EXPECTED_KEYS.includes(key)) {
      const closest = findClosestKey(key);
      if (closest) {
        finalKey = closest;
      }
    }

    fixedObj[finalKey] = fixJsonKeys(value);
  }

  return fixedObj;
};

/**
 * Parses the JSON translation content from the API
 */
export const parseTranslationJSON = (content: string): ParsedTranslation => {
  try {
    const repairedJson = jsonrepair(content); // AI generated JSON format can be malformed, this 3rd party lib repairs it
    const parsed = JSON.parse(repairedJson);
    const fixedParsed = fixJsonKeys(parsed); // Fix mistyped keys, for e.g. sometimes we get "phral_verb" instead of "phrasal_verb"

    // Try to validate as DictionaryEntry first
    if (isDictionaryEntry(fixedParsed)) {
      if (isValidDictionaryEntry(fixedParsed)) {
        return fixedParsed as DictionaryEntry;
      }
    }
    // Try to validate as SentenceTranslation
    else if (isSentenceTranslation(fixedParsed)) {
      if (isValidSentenceTranslation(fixedParsed)) {
        return fixedParsed as SentenceTranslation;
      }
    }

    throw new Error("Invalid JSON structure");
  } catch (error) {
    console.error("Failed to parse JSON translation:", error);
    console.error("Content that failed to parse:", content);

    throw new Error("Failed to parse JSON translation");
  }
};
