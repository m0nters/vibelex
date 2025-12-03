import type { SearchOperator, SearchOperatorType } from "@/constants";
import { SEARCH_OPERATOR_REGEX } from "@/constants";
import { HistoryEntry } from "@/types";
import {
  hasPronunciationVariants,
  isDictionaryEntry,
  isSentenceTranslation,
} from "@/utils";
import Fuse from "fuse.js";
import { getHistory } from "./historyStorage";

/**
 * Parse search operators from query
 * Supports: source:langcode, target:langcode
 */
const parseSearchOperators = (
  query: string,
): {
  operators: SearchOperator[];
  remainingText: string;
} => {
  const operators: SearchOperator[] = [];
  let remainingText = query;

  // Use the shared regex pattern
  let match;

  while ((match = SEARCH_OPERATOR_REGEX.exec(query)) !== null) {
    const operatorType = match[1].toLowerCase() as SearchOperatorType;
    const langCode = match[2].toLowerCase();

    operators.push({ type: operatorType, value: langCode });

    // Remove this operator from the remaining text
    remainingText = remainingText.replace(match[0], "").trim();
  }

  return { operators, remainingText };
};

/**
 * Extract all searchable text from a history entry
 */
const extractSearchableFields = (entry: HistoryEntry): string[] => {
  const { translation } = entry;
  const searchableFields: string[] = [];

  if (isDictionaryEntry(translation)) {
    // Add the word itself
    searchableFields.push(translation.word);

    // Add verb forms if available
    if (translation.verb_forms) {
      searchableFields.push(...translation.verb_forms);
    }

    // Extract pronunciations from all meaning entries
    translation.meanings.forEach((meaning) => {
      // Add definition
      searchableFields.push(meaning.definition);

      // Extract pronunciation IPAs
      if (typeof meaning.pronunciation === "string") {
        searchableFields.push(meaning.pronunciation);
      } else if (hasPronunciationVariants(meaning.pronunciation)) {
        // Push all pronunciation variants dynamically
        Object.values(meaning.pronunciation).forEach((variant) => {
          if (variant?.ipa) {
            searchableFields.push(...variant.ipa);
          }
        });
      }

      // Add examples
      meaning.examples.forEach((example) => {
        searchableFields.push(example.text);
        if (example.pronunciation) {
          searchableFields.push(example.pronunciation);
        }
        if (example.translation) {
          searchableFields.push(example.translation);
        }
      });

      // Add synonyms
      if (meaning.synonyms) {
        searchableFields.push(...meaning.synonyms.items);
      }

      // Add idioms
      if (meaning.idioms) {
        meaning.idioms.items.forEach((idiom) => {
          searchableFields.push(idiom.idiom, idiom.meaning);
          idiom.examples.forEach((example) => {
            searchableFields.push(example.text);
            if (example.pronunciation) {
              searchableFields.push(example.pronunciation);
            }
            if (example.translation) {
              searchableFields.push(example.translation);
            }
          });
        });
      }

      // Add phrasal verbs
      if (meaning.phrasal_verbs) {
        meaning.phrasal_verbs.items.forEach((pv) => {
          searchableFields.push(pv.phrasal_verb, pv.meaning);
          pv.examples.forEach((example) => {
            searchableFields.push(example.text);
            if (example.pronunciation) {
              searchableFields.push(example.pronunciation);
            }
            if (example.translation) {
              searchableFields.push(example.translation);
            }
          });
        });
      }
    });
  } else if (isSentenceTranslation(translation)) {
    searchableFields.push(translation.text, translation.translation);
  }

  return searchableFields;
};

/**
 * Search history entries based on query with support for search operators
 * Supports operators: source:langcode, target:langcode
 * Examples: "source:en hello", "target:vi", "source:en target:zh translation"
 */
export const searchHistory = async (query: string): Promise<HistoryEntry[]> => {
  const entries = await getHistory();

  if (!query.trim()) {
    return entries;
  }

  const { operators, remainingText } = parseSearchOperators(query);
  const searchTerm = remainingText.toLowerCase();

  // First, filter by operators
  let filteredEntries = entries.filter((entry) => {
    const { translation } = entry;

    // Check search operators
    for (const operator of operators) {
      if (operator.type === "source") {
        if (translation.source_language_code.toLowerCase() !== operator.value) {
          return false;
        }
      } else if (operator.type === "target") {
        if (
          translation.translated_language_code.toLowerCase() !== operator.value
        ) {
          return false;
        }
      }
    }

    return true;
  });

  // If there's remaining text, use fuzzy search
  if (searchTerm) {
    const fuse = new Fuse(filteredEntries, {
      keys: [
        {
          name: "searchableText",
          getFn: (entry) => extractSearchableFields(entry as HistoryEntry),
        },
      ],
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
    });

    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }

  // If only operators were used (no text search), return filtered entries
  return filteredEntries;
};
