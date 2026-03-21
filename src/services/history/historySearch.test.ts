import type {
  DictionaryEntry,
  HistoryEntry,
  SentenceTranslation,
} from "@/types";
import { searchHistory } from "./historySearch";
import { getHistory } from "./historyStorage";

vi.mock("./historyStorage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./historyStorage")>();
  return {
    ...actual,
    getHistory: vi.fn(),
  };
});

const mockDictionaryEntry: DictionaryEntry = {
  word: "cat",
  source_language_code: "en",
  translated_language_code: "vi",
  meanings: [
    {
      pronunciation: "/kæt/",
      part_of_speech: "noun",
      definition: "con mèo",
      examples: [{ text: "The cat is sleeping." }],
    },
  ],
};

const mockSentenceEntry: SentenceTranslation = {
  text: "Good morning",
  translation: "Chào buổi sáng",
  source_language_code: "en",
  translated_language_code: "vi",
};

const mockEntries: HistoryEntry[] = [
  { id: "1", timestamp: 100, translation: mockDictionaryEntry },
  { id: "2", timestamp: 200, translation: mockSentenceEntry },
  {
    id: "3",
    timestamp: 300,
    translation: {
      text: "Bonjour le monde",
      translation: "Hello world",
      source_language_code: "fr",
      translated_language_code: "en",
    } as SentenceTranslation,
  },
];

describe("searchHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getHistory).mockResolvedValue(mockEntries);
  });

  it("returns all entries when query is empty", async () => {
    const result = await searchHistory("");
    expect(result).toHaveLength(3);
  });

  it("returns all entries when query is only whitespace", async () => {
    const result = await searchHistory("   ");
    expect(result).toHaveLength(3);
  });

  describe("Fuzzy Text Search", () => {
    it("finds dictionary entries by word", async () => {
      const result = await searchHistory("cat");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("finds dictionary entries by definition", async () => {
      // Use the full phrase to stay above fuse.js threshold for other entries
      const result = await searchHistory("con mèo");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("finds dictionary entries by example text", async () => {
      const result = await searchHistory("sleeping");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("finds sentence translations by source text", async () => {
      const result = await searchHistory("morning");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("finds sentence translations by translated text", async () => {
      const result = await searchHistory("buổi sáng");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("returns empty array when no matches found", async () => {
      const result = await searchHistory("xyz_nomatch_123");
      expect(result).toEqual([]);
    });
  });

  describe("Operator Search", () => {
    it("filters by source operator (source:en)", async () => {
      const result = await searchHistory("source:en");
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["1", "2"]); // Both EN -> VI
    });

    it("filters by target operator (target:en)", async () => {
      const result = await searchHistory("target:en");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3"); // FR -> EN
    });

    it("combines multiple operators (source:fr target:en)", async () => {
      const result = await searchHistory("source:fr target:en");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("3");
    });

    it("combines operators with fuzzy text search", async () => {
      // "source:en morning" -> should only find entry 2
      const result = await searchHistory("source:en morning");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("filters out results if operator matches but text doesn't", async () => {
      // "source:fr cat" -> no FR entry has "cat"
      const result = await searchHistory("source:fr cat");
      expect(result).toHaveLength(0);
    });

    it("filters out results if text matches but operator doesn't", async () => {
      // "source:fr morning" -> morning exists but is EN source
      const result = await searchHistory("source:fr morning");
      expect(result).toHaveLength(0);
    });
  });
});
