import type { SentenceTranslation } from "@/types";
import { HISTORY_STORAGE_KEY } from "@/constants";
import {
  clearHistory,
  removeHistoryEntries,
  removeHistoryEntry,
  saveTranslation,
  togglePinEntry,
} from "./historyManagement";
import { getHistory, saveHistoryToStorage } from "./historyStorage";

// Deep mock of the storage module
vi.mock("./historyStorage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./historyStorage")>();
  return {
    ...actual,
    getHistory: vi.fn(),
    saveHistoryToStorage: vi.fn(),
  };
});

const mockTranslation: SentenceTranslation = {
  text: "Hello",
  translation: "Xin chào",
  source_language_code: "en",
  translated_language_code: "vi",
};

const mockEntries = [
  { id: "1", timestamp: 1000, translation: mockTranslation },
  { id: "2", timestamp: 2000, translation: mockTranslation, pinnedAt: 5000 },
  { id: "3", timestamp: 3000, translation: mockTranslation },
];

describe("History Management Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("saveTranslation", () => {
    it("creates a new entry and saves it at the beginning of the list", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);
      vi.useFakeTimers();
      vi.setSystemTime(9999); // Fixed current time

      await saveTranslation(mockTranslation);

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      const savedIds = saveCallArgs.map((e) => e.id);

      expect(saveCallArgs).toHaveLength(4);
      expect(savedIds[0]).toBe("2"); // Pinned always first
      // The rest are sorted newest first. The new entry has timestamp 9999.
      expect(saveCallArgs[1].timestamp).toBe(9999);
      expect(savedIds[2]).toBe("3");
      expect(savedIds[3]).toBe("1");
    });

    it("respects the 100 item limit by truncating older items", async () => {
      const overflowEntries = Array.from({ length: 150 }, (_, i) => ({
        id: String(i),
        timestamp: i,
        translation: mockTranslation,
      }));

      vi.mocked(getHistory).mockResolvedValue(overflowEntries);

      await saveTranslation(mockTranslation);

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      expect(saveCallArgs).toHaveLength(100);
    });
  });

  describe("clearHistory", () => {
    it("calls chrome.storage.local.remove with the history key", async () => {
      await clearHistory();
      expect(chrome.storage.local.remove).toHaveBeenCalledWith([
        HISTORY_STORAGE_KEY,
      ]);
    });
  });

  describe("removeHistoryEntry", () => {
    it("removes only the specified entry and saves", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);

      await removeHistoryEntry("2");

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      expect(saveCallArgs).toHaveLength(2);
      // saveHistoryToStorage is mocked, so filter order is preserved
      expect(saveCallArgs.map((e) => e.id)).toEqual(["1", "3"]);
    });

    it("does nothing if ID is not found", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);

      await removeHistoryEntry("non_existent_id");

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      expect(saveCallArgs).toHaveLength(3); // Saves original list unchanged
    });
  });

  describe("removeHistoryEntries", () => {
    it("removes multiple specified entries saving one clean list", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);

      await removeHistoryEntries(["1", "3"]);

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      expect(saveCallArgs).toHaveLength(1);
      expect(saveCallArgs[0].id).toBe("2");
    });
  });

  describe("togglePinEntry", () => {
    it("adds a pinnedAt timestamp if currently unpinned", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);
      vi.useFakeTimers();
      vi.setSystemTime(8888);

      await togglePinEntry("1"); // Currently has no pinnedAt

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      const alteredEntry = saveCallArgs.find((e) => e.id === "1");
      expect(alteredEntry?.pinnedAt).toBe(8888);
    });

    it("removes the pinnedAt timestamp if currently pinned", async () => {
      vi.mocked(getHistory).mockResolvedValue([...mockEntries]);

      await togglePinEntry("2"); // Currently has pinnedAt = 5000

      const saveCallArgs = vi.mocked(saveHistoryToStorage).mock.calls[0][0];
      const alteredEntry = saveCallArgs.find((e) => e.id === "2");

      expect(alteredEntry?.pinnedAt).toBeUndefined();
    });
  });
});
