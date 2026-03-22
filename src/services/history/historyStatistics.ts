import { HistoryEntry, ParsedTranslation } from "@/types";
import { getHistory } from "./historyStorage";

export interface LanguageStats {
  languageCode: string;
  count: number;
  percentage: number;
}

export interface LanguageStatisticsData {
  sourceLanguages: LanguageStats[];
  targetLanguages: LanguageStats[];
  totalEntries: number;
}

/**
 * Get displayed entries count and storage size usage.
 * Pure calculation — does not call Chrome APIs.
 */
export const getHistoryEntryStatistics = (entries: HistoryEntry[]) => {
  if (entries.length === 0) return null;

  const entriesJson = JSON.stringify(entries);
  const sizeBytes = new Blob([entriesJson]).size;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) {
      return { value: bytes.toFixed(2), unit: "B" };
    } else if (bytes < 1024 * 1024) {
      return { value: (bytes / 1024).toFixed(2), unit: "KB" };
    } else if (bytes < 1024 * 1024 * 1024) {
      return { value: (bytes / (1024 * 1024)).toFixed(2), unit: "MB" };
    } else {
      return { value: (bytes / (1024 * 1024 * 1024)).toFixed(2), unit: "GB" };
    }
  };

  const { value, unit } = formatBytes(sizeBytes);

  return {
    historyEntryCount: entries.length,
    historySize: value,
    historySizeUnit: unit,
  };
};

/**
 * Analyze translation history to get language distribution statistics.
 */
export const getLanguageStatistics =
  async (): Promise<LanguageStatisticsData> => {
    try {
      const entries = await getHistory();
      const totalEntries = entries.length;

      if (totalEntries === 0) {
        return {
          sourceLanguages: [],
          targetLanguages: [],
          totalEntries: 0,
        };
      }

      // Count source and target languages
      const sourceLanguageCount = new Map<string, number>();
      const targetLanguageCount = new Map<string, number>();

      entries.forEach((entry) => {
        const translation = entry.translation as ParsedTranslation;
        const sourceLang = translation.source_language_code;
        const targetLang = translation.translated_language_code;

        sourceLanguageCount.set(
          sourceLang,
          (sourceLanguageCount.get(sourceLang) || 0) + 1,
        );
        targetLanguageCount.set(
          targetLang,
          (targetLanguageCount.get(targetLang) || 0) + 1,
        );
      });

      // Convert to array and calculate percentages
      const sourceLanguages = Array.from(sourceLanguageCount.entries())
        .map(([languageCode, count]) => ({
          languageCode,
          count,
          percentage: (count / totalEntries) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      const targetLanguages = Array.from(targetLanguageCount.entries())
        .map(([languageCode, count]) => ({
          languageCode,
          count,
          percentage: (count / totalEntries) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        sourceLanguages,
        targetLanguages,
        totalEntries,
      };
    } catch (error) {
      console.error("Failed to analyze language distribution:", error);
      return {
        sourceLanguages: [],
        targetLanguages: [],
        totalEntries: 0,
      };
    }
  };
