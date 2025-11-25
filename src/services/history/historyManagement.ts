import { HistoryEntry, ParsedTranslation } from "@/types";
import {
  getHistory,
  HISTORY_STORAGE_KEY,
  saveHistoryToStorage,
  sortHistoryEntries,
} from "./historyStorage";

/**
 * Save a new translation to history
 */
export const saveTranslation = async (
  translation: ParsedTranslation,
): Promise<void> => {
  try {
    const entries = await getHistory();

    // Create new entry
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      translation,
    };

    // Add new entry at the beginning (most recent first)
    const updatedEntries = sortHistoryEntries([newEntry, ...entries]);

    // Save to chrome storage
    await saveHistoryToStorage(updatedEntries);
  } catch (error) {
    console.error("Failed to save translation to history:", error);
  }
};

/**
 * Clear all history
 */
export const clearHistory = async (): Promise<void> => {
  try {
    await chrome.storage.local.remove([HISTORY_STORAGE_KEY]);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

/**
 * Remove a specific history entry
 */
export const removeHistoryEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getHistory();
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    await saveHistoryToStorage(updatedEntries);
  } catch (error) {
    console.error("Failed to remove history entry:", error);
  }
};

/**
 * Remove multiple history entries in a single operation
 */
export const removeHistoryEntries = async (ids: string[]): Promise<void> => {
  try {
    const entries = await getHistory();
    const idsSet = new Set(ids);
    const updatedEntries = entries.filter((entry) => !idsSet.has(entry.id));
    await saveHistoryToStorage(updatedEntries);
  } catch (error) {
    console.error("Failed to remove history entries:", error);
  }
};

/**
 * Toggle pin status of a history entry
 */
export const togglePinEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getHistory();
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          pinnedAt: !entry.pinnedAt ? Date.now() : undefined,
        };
      }
      return entry;
    });
    await saveHistoryToStorage(updatedEntries);
  } catch (error) {
    console.error("Failed to toggle pin status:", error);
  }
};
