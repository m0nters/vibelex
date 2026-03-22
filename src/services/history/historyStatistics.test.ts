import type { HistoryEntry, SentenceTranslation } from "@/types";
import {
  getHistoryEntryStatistics,
  getLanguageStatistics,
} from "./historyStatistics";
import { getHistory } from "./historyStorage";

// Mock the internal getHistory dependency (we don't need to test storage twice)
vi.mock("./historyStorage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./historyStorage")>();
  return {
    ...actual,
    getHistory: vi.fn(),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

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

// ─── getHistoryEntryStatistics  ───────────────────────────────────────────────

describe("getHistoryEntryStatistics", () => {
  it("returns null for an empty entries array", () => {
    expect(getHistoryEntryStatistics([])).toBeNull();
  });

  it("returns the correct entry count", () => {
    const entries = [
      makeEntry({ id: "1", timestamp: 1 }),
      makeEntry({ id: "2", timestamp: 2 }),
      makeEntry({ id: "3", timestamp: 3 }),
    ];
    const stats = getHistoryEntryStatistics(entries);
    expect(stats?.historyEntryCount).toBe(3);
  });

  it("returns a numeric size value", () => {
    const entries = [makeEntry({ id: "1", timestamp: 1 })];
    const stats = getHistoryEntryStatistics(entries);
    expect(Number.isNaN(parseFloat(stats!.historySize))).toBe(false);
  });

  it("returns 'B' or 'KB' for a tiny single entry", () => {
    const entries = [makeEntry({ id: "1", timestamp: 1 })];
    const stats = getHistoryEntryStatistics(entries);
    expect(["B", "KB"]).toContain(stats?.historySizeUnit);
  });

  it("returns a non-null result for a single entry", () => {
    const entries = [makeEntry({ id: "x", timestamp: 999 })];
    expect(getHistoryEntryStatistics(entries)).not.toBeNull();
  });
});

// ─── getLanguageStatistics ────────────────────────────────────────────────────

describe("getLanguageStatistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero totals when history is empty", async () => {
    vi.mocked(getHistory).mockResolvedValueOnce([]);

    const result = await getLanguageStatistics();
    expect(result).toEqual({
      sourceLanguages: [],
      targetLanguages: [],
      totalEntries: 0,
    });
  });

  it("calculates accurate statistics for multiple entries", async () => {
    // 3 entries: 2 from EN->VI, 1 from FR->EN
    const mockEntries: HistoryEntry[] = [
      {
        id: "1",
        timestamp: 100,
        translation: {
          text: "hello",
          translation: "xin chao",
          source_language_code: "en",
          translated_language_code: "vi",
        },
      },
      {
        id: "2",
        timestamp: 200,
        translation: {
          text: "world",
          translation: "the gioi",
          source_language_code: "en",
          translated_language_code: "vi",
        },
      },
      {
        id: "3",
        timestamp: 300,
        translation: {
          text: "bonjour",
          translation: "hello",
          source_language_code: "fr",
          translated_language_code: "en",
        },
      },
    ];

    vi.mocked(getHistory).mockResolvedValueOnce(mockEntries);

    const result = await getLanguageStatistics();

    expect(result.totalEntries).toBe(3);

    // Source languages should be sorted by count (en: 2, fr: 1)
    expect(result.sourceLanguages[0]).toEqual(
      expect.objectContaining({ languageCode: "en", count: 2 }),
    );
    expect(result.sourceLanguages[0].percentage).toBeCloseTo(66.67, 1);
    expect(result.sourceLanguages[1]).toEqual(
      expect.objectContaining({ languageCode: "fr", count: 1 }),
    );
    expect(result.sourceLanguages[1].percentage).toBeCloseTo(33.33, 1);

    // Target languages should be sorted by count (vi: 2, en: 1)
    expect(result.targetLanguages[0]).toEqual(
      expect.objectContaining({ languageCode: "vi", count: 2 }),
    );
    expect(result.targetLanguages[0].percentage).toBeCloseTo(66.67, 1);
    expect(result.targetLanguages[1]).toEqual(
      expect.objectContaining({ languageCode: "en", count: 1 }),
    );
    expect(result.targetLanguages[1].percentage).toBeCloseTo(33.33, 1);
  });

  it("returns zero totals when an error occurs", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(getHistory).mockRejectedValueOnce(new Error("Database failed"));

    const result = await getLanguageStatistics();

    expect(result).toEqual({
      sourceLanguages: [],
      targetLanguages: [],
      totalEntries: 0,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
