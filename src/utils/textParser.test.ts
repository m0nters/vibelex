import type { DictionaryEntry, SentenceTranslation } from "@/types";
import {
  hasPronunciationVariants,
  isDictionaryEntry,
  isSentenceTranslation,
  isValidDictionaryEntry,
  isValidSentenceTranslation,
  parseTranslationJSON,
} from "./textParser";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const validDictionaryEntry: DictionaryEntry = {
  word: "run",
  source_language_code: "en",
  translated_language_code: "vi",
  meanings: [
    {
      pronunciation: "/rʌn/",
      part_of_speech: "verb",
      definition: "Di chuyển nhanh bằng chân",
      examples: [{ text: "She runs every morning." }],
    },
  ],
};

const validSentenceTranslation: SentenceTranslation = {
  translation: "Cô ấy chạy mỗi sáng.",
  source_language_code: "en",
  translated_language_code: "vi",
  text: "She runs every morning.",
};

// ─── isDictionaryEntry ────────────────────────────────────────────────────────

describe("isDictionaryEntry", () => {
  it("returns true for an object with a `word` field", () => {
    expect(isDictionaryEntry(validDictionaryEntry)).toBe(true);
  });

  it("returns false for a SentenceTranslation (no `word` field)", () => {
    expect(isDictionaryEntry(validSentenceTranslation)).toBe(false);
  });
});

// ─── isSentenceTranslation ────────────────────────────────────────────────────

describe("isSentenceTranslation", () => {
  it("returns true for an object with a `translation` field", () => {
    expect(isSentenceTranslation(validSentenceTranslation)).toBe(true);
  });

  it("returns false for a DictionaryEntry (no `translation` field)", () => {
    expect(isSentenceTranslation(validDictionaryEntry)).toBe(false);
  });
});

// ─── hasPronunciationVariants ─────────────────────────────────────────────────

describe("hasPronunciationVariants", () => {
  it("returns true for an object (UK/US variants)", () => {
    const variants = {
      UK: { ipa: ["/rʌn/"], tts_code: "en-GB" },
    };
    expect(hasPronunciationVariants(variants)).toBe(true);
  });

  it("returns false for a plain string", () => {
    expect(hasPronunciationVariants("/rʌn/")).toBe(false);
  });

  it("returns false for null", () => {
    // null satisfies the union type at runtime via cast
    expect(hasPronunciationVariants(null as any)).toBe(false);
  });
});

// ─── isValidDictionaryEntry ───────────────────────────────────────────────────

describe("isValidDictionaryEntry", () => {
  it("returns true for a complete valid DictionaryEntry", () => {
    expect(isValidDictionaryEntry(validDictionaryEntry)).toBe(true);
  });

  it("returns false when `word` is missing", () => {
    const { word, ...withoutWord } = validDictionaryEntry;
    expect(isValidDictionaryEntry(withoutWord)).toBe(false);
  });

  it("returns false when `meanings` is empty", () => {
    expect(
      isValidDictionaryEntry({ ...validDictionaryEntry, meanings: [] }),
    ).toBe(false);
  });

  it("returns false when source_language_code is missing", () => {
    const { source_language_code, ...rest } = validDictionaryEntry;
    expect(isValidDictionaryEntry(rest)).toBe(false);
  });
});

// ─── isValidSentenceTranslation ───────────────────────────────────────────────

describe("isValidSentenceTranslation", () => {
  it("returns true for a complete valid SentenceTranslation", () => {
    expect(isValidSentenceTranslation(validSentenceTranslation)).toBe(true);
  });

  it("returns false when `translation` field is missing", () => {
    const { translation, ...withoutTranslation } = validSentenceTranslation;
    expect(isValidSentenceTranslation(withoutTranslation)).toBe(false);
  });

  it("returns false when source_language_code is missing", () => {
    const { source_language_code, ...rest } = validSentenceTranslation;
    expect(isValidSentenceTranslation(rest)).toBe(false);
  });
});

// ─── parseTranslationJSON ─────────────────────────────────────────────────────

describe("parseTranslationJSON", () => {
  it("parses a valid DictionaryEntry JSON string", () => {
    const json = JSON.stringify(validDictionaryEntry);
    const result = parseTranslationJSON(json);
    expect(isDictionaryEntry(result)).toBe(true);
    expect((result as DictionaryEntry).word).toBe("run");
  });

  it("parses a valid SentenceTranslation JSON string", () => {
    const json = JSON.stringify(validSentenceTranslation);
    const result = parseTranslationJSON(json);
    expect(isSentenceTranslation(result)).toBe(true);
    expect((result as SentenceTranslation).translation).toBe(
      "Cô ấy chạy mỗi sáng.",
    );
  });

  it("repairs and parses slightly malformed JSON (trailing comma)", () => {
    // jsonrepair handles trailing commas
    const malformed = `{"word": "run", "source_language_code": "en", "translated_language_code": "vi", "meanings": [{"pronunciation": "/rʌn/", "part_of_speech": "verb", "definition": "run", "examples": [{"text": "Run!"}],}],}`;
    expect(() => parseTranslationJSON(malformed)).not.toThrow();
  });

  it("throws for completely invalid / unrecognized JSON structure", () => {
    expect(() => parseTranslationJSON('{"unknown_field": 42}')).toThrow(
      "Failed to parse JSON translation",
    );
  });

  it("throws for non-JSON garbage input", () => {
    expect(() => parseTranslationJSON("not json at all !!!")).toThrow(
      "Failed to parse JSON translation",
    );
  });
});
