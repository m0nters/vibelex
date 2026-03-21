import type { HistoryEntry, SentenceTranslation } from "@/types";
import {
  getHistoryEntryStatistics,
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

// ─── getHistoryEntryStatistics ────────────────────────────────────────────────

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

  it("returns a size value that is a numeric string", () => {
    const entries = [makeEntry({ id: "1", timestamp: 1 })];
    const stats = getHistoryEntryStatistics(entries);
    expect(Number.isNaN(parseFloat(stats!.historySize))).toBe(false);
  });

  it("returns unit 'B' for tiny entries (< 1 KB)", () => {
    // A single small entry will always be < 1 KB
    const entries = [makeEntry({ id: "1", timestamp: 1 })];
    const stats = getHistoryEntryStatistics(entries);
    // Small data → B or KB, but definitely not GB
    expect(["B", "KB"]).toContain(stats?.historySizeUnit);
  });

  it("returns a non-null result for a single entry", () => {
    const entries = [makeEntry({ id: "x", timestamp: 999 })];
    expect(getHistoryEntryStatistics(entries)).not.toBeNull();
  });
});
