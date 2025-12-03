import { HistoryEntry } from "@/types";
import { isDictionaryEntry, isSentenceTranslation } from "@/utils";

/**
 * Get display text for history entry (for list view)
 */
export const getDisplayText = (
  entry: HistoryEntry,
): {
  primaryText: string;
  secondaryText: string;
} => {
  const { translation } = entry;

  if (isDictionaryEntry(translation)) {
    const pronunciation = translation.meanings[0]?.pronunciation; // take the first meaning as an example for displaying only

    let ipa = "";
    if (typeof pronunciation === "string") {
      ipa = pronunciation;
    } else if (pronunciation) {
      // take one variant as an example for displaying only
      const firstVariant = Object.values(pronunciation).find((value) => value);
      // take the first IPA if multiple
      ipa = firstVariant?.ipa[0] || "";
    }

    return {
      primaryText: translation.word,
      secondaryText: ipa ? `${ipa}` : "",
    };
  } else if (isSentenceTranslation(translation)) {
    return {
      primaryText: translation.text,
      secondaryText: "",
    };
  }

  return {
    primaryText: "Unknown translation",
    secondaryText: "",
  };
};
