import type { HistoryEntry, SentenceTranslation } from "@/types";
import { HISTORY_STORAGE_KEY } from "@/constants";
import {
  getHistory,
  saveHistoryToStorage,
  sortHistoryEntries,
} from "./historyStorage";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const makeSentenceTranslation = (
  overrides: Partial<SentenceTranslation> = {},
): SentenceTranslation => ({
  translation: "Xin chào",
  source_language_code: "en",
  translated_language_code: "vi",
  text: "Hello",
  ...overrides,
});

const makeEntry = (
  overrides: Partial<HistoryEntry> & { id: string; timestamp: number },
): HistoryEntry => ({
  translation: makeSentenceTranslation(),
  ...overrides,
});

// ─── sortHistoryEntries ───────────────────────────────────────────────────────

describe("sortHistoryEntries", () => {
  it("sorts unpinned entries newest-first", () => {
    const entries = [
      makeEntry({ id: "a", timestamp: 1000 }),
      makeEntry({ id: "b", timestamp: 3000 }),
      makeEntry({ id: "c", timestamp: 2000 }),
    ];

    const sorted = sortHistoryEntries([...entries]);
    expect(sorted.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("places a pinned entry before an unpinned entry regardless of timestamp", () => {
    const entries = [
      makeEntry({ id: "newer-unpinned", timestamp: 5000 }),
      makeEntry({ id: "older-pinned", timestamp: 1000, pinnedAt: 2000 }),
    ];

    const sorted = sortHistoryEntries([...entries]);
    expect(sorted[0].id).toBe("older-pinned");
  });

  it("sorts two pinned entries by pinnedAt ascending (earlier pin comes first)", () => {
    const entries = [
      makeEntry({ id: "pinned-later", timestamp: 2000, pinnedAt: 9000 }),
      makeEntry({ id: "pinned-earlier", timestamp: 1000, pinnedAt: 500 }),
    ];

    const sorted = sortHistoryEntries([...entries]);
    expect(sorted.map((e) => e.id)).toEqual(["pinned-earlier", "pinned-later"]);
  });

  it("handles a mix of pinned and unpinned entries correctly", () => {
    const entries = [
      makeEntry({ id: "unpinned-new", timestamp: 8000 }),
      makeEntry({ id: "pinned-b", timestamp: 3000, pinnedAt: 700 }),
      makeEntry({ id: "unpinned-old", timestamp: 1000 }),
      makeEntry({ id: "pinned-a", timestamp: 2000, pinnedAt: 200 }),
    ];

    const sorted = sortHistoryEntries([...entries]);
    const ids = sorted.map((e) => e.id);

    // Pinned entries always come first, in pinnedAt ascending order
    expect(ids[0]).toBe("pinned-a");
    expect(ids[1]).toBe("pinned-b");
    // Unpinned follow, newest first
    expect(ids[2]).toBe("unpinned-new");
    expect(ids[3]).toBe("unpinned-old");
  });

  it("returns an empty array when given an empty array", () => {
    expect(sortHistoryEntries([])).toEqual([]);
  });

  it("returns a single entry unchanged", () => {
    const entry = makeEntry({ id: "solo", timestamp: 1000 });
    expect(sortHistoryEntries([entry])).toHaveLength(1);
  });
});

// ─── getHistory & saveHistoryToStorage ────────────────────────────────────────

describe("Chrome Storage Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHistory", () => {
    it("returns an empty array when storage is missing the key", async () => {
      // Mock chrome.storage.local.get to resolve with empty object
      vi.mocked(chrome.storage.local.get as any).mockResolvedValueOnce({});

      const result = await getHistory();
      expect(result).toEqual([]);
      expect(chrome.storage.local.get).toHaveBeenCalledWith([
        HISTORY_STORAGE_KEY,
      ]);
    });

    it("returns the stored entries when found", async () => {
      const mockEntries = [makeEntry({ id: "stored", timestamp: 123 })];
      vi.mocked(chrome.storage.local.get as any).mockResolvedValueOnce({
        [HISTORY_STORAGE_KEY]: mockEntries,
      });

      const result = await getHistory();
      expect(result).toEqual(mockEntries);
    });

    it("returns an empty array and logs an error if storage.get throws", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(chrome.storage.local.get as any).mockRejectedValueOnce(
        new Error("Storage failed"),
      );

      const result = await getHistory();
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("saveHistoryToStorage", () => {
    it("sorts entries before saving them to storage", async () => {
      const mockEntries = [
        makeEntry({ id: "unpinned-old", timestamp: 100 }),
        makeEntry({ id: "unpinned-new", timestamp: 200 }),
      ];

      await saveHistoryToStorage(mockEntries);

      // It should call storage.set with the correctly SORTED entries
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [HISTORY_STORAGE_KEY]: [
          mockEntries[1], // unpinned-new comes first
          mockEntries[0], // then unpinned-old
        ],
      });
    });

    it("catches and logs errors if storage.set throws", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(chrome.storage.local.set as any).mockRejectedValueOnce(
        new Error("Storage failed"),
      );

      await expect(saveHistoryToStorage([])).resolves.not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
