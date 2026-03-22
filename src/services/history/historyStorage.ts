import { HISTORY_STORAGE_KEY } from "@/constants";
import { HistoryEntry } from "@/types";

/**
 * IMPORTANT RULE: EVERY SAVING HISTORY OPERATION HAS TO GO THROUGH THIS SORT FIRST!
 * Meaning we have to ensure the storage always saves the sorted list
 */
export const sortHistoryEntries = (entries: HistoryEntry[]) => {
  return entries.toSorted((a, b) => {
    // If one is pinned and the other isn't, prioritize pinned
    if (a.pinnedAt && !b.pinnedAt) return -1;
    if (!a.pinnedAt && b.pinnedAt) return 1;

    // If both are pinned, sort by pin timestamp (most recently pinned go latest)
    if (a.pinnedAt && b.pinnedAt) {
      return (a.pinnedAt || 0) - (b.pinnedAt || 0);
    }

    // The rest (unpinned) will go newest first
    return b.timestamp - a.timestamp;
  });
};

/**
 * Save history entries to Chrome storage with proper sorting
 */
export const saveHistoryToStorage = async (entries: HistoryEntry[]) => {
  try {
    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: sortHistoryEntries(entries),
    });
  } catch (error) {
    console.error("Failed to save history to storage:", error);
  }
};

/**
 * Retrieve all history entries
 */
export const getHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const result = await chrome.storage.local.get([HISTORY_STORAGE_KEY]);
    return result[HISTORY_STORAGE_KEY] || [];
  } catch (error) {
    console.error("Failed to retrieve history:", error);
    return [];
  }
};
