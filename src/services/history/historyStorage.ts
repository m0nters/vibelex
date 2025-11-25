import { HistoryEntry } from "@/types";

export const HISTORY_STORAGE_KEY = "translationHistory";

/**
 * IMPORTANT RULE: EVERY SAVING HISTORY OPERATION HAS TO GO THROUGH THIS SORT FIRST!
 * Meaning we have to ensure the storage always saves the sorted list
 */
export const sortHistoryEntries = (entries: HistoryEntry[]) => {
  return entries.sort((a, b) => {
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
export const saveHistoryToStorage = async (
  entries: HistoryEntry[],
  logUsage = false,
) => {
  try {
    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: sortHistoryEntries(entries),
    });
  } catch (error) {
    console.error("Failed to save history to storage:", error);
  } finally {
    // Optionally log storage usage after saving
    if (logUsage) {
      setTimeout(() => printHistoryStorageUsage(), 100); // Small delay to ensure data is saved
    }
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

/**
 * Get displayed entries count and size usage
 */
export const getDisplayedEntriesUsage = (entries: HistoryEntry[]) => {
  if (entries.length === 0) return null;

  // Convert entries to JSON string to calculate size
  const entriesJson = JSON.stringify(entries);
  const sizeBytes = new Blob([entriesJson]).size;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) {
      return { value: bytes.toFixed(2), unit: "B" };
    } else if (bytes < 1024 * 1024) {
      return { value: (bytes / 1024).toFixed(2), unit: "KB" };
    } else if (bytes < 1024 * 1024 * 1024) {
      return { value: (bytes / (1024 * 1024)).toFixed(2), unit: "MB" }; // maybe? reach this number when the number of entries is about 1000
    } else {
      return { value: (bytes / (1024 * 1024 * 1024)).toFixed(2), unit: "GB" }; // impossible :D
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
 * Get detailed storage usage information for history data
 */
export const getHistoryStorageUsage = async () => {
  try {
    // Get the history data
    const historyData = await getHistory();

    // Convert to JSON string to calculate size in bytes
    const historyJson = JSON.stringify(historyData);
    const historySizeBytes = new Blob([historyJson]).size;

    // Get total local storage usage
    const historyUsage = await chrome.storage.local.getBytesInUse([
      HISTORY_STORAGE_KEY,
    ]);

    const usage = {
      historyEntryCount: historyData.length,
      historySizeBytes: historySizeBytes,
      historySizeKB: (historySizeBytes / 1024).toFixed(2),
      historyUsageBytes: historyUsage,
      historyUsageKB: (historyUsage / 1024).toFixed(2),
    };

    return usage;
  } catch (error) {
    console.error("Failed to get storage usage:", error);
    return null;
  }
};

/**
 * Print storage usage information to console
 */
export const printHistoryStorageUsage = async () => {
  const usage = await getHistoryStorageUsage();

  if (!usage) {
    console.error("❌ Failed to retrieve storage usage information");
    return;
  }

  console.group("🔍 Chrome Storage Sync Usage - History Data");

  console.log("📊 History Data:");
  console.log(`   • Entry Count: ${usage.historyEntryCount}`);
  console.log(
    `   • JSON Size: ${usage.historySizeKB} KB (${usage.historySizeBytes} bytes)`,
  );
  console.log(
    `   • Storage Usage: ${usage.historyUsageKB} KB (${usage.historyUsageBytes} bytes)`,
  );

  console.groupEnd();

  return usage;
};
