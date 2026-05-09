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

  // ─── jsonrepair cases ──────────────────────────────────────────────────────
  // These tests verify that AI-generated JSON malformations are handled correctly.
  // jsonrepair handles most of them; the custom hotfix handles unescaped " in values.

  it("repairs trailing commas in objects and arrays", () => {
    const malformed = `{"word": "run", "source_language_code": "en", "translated_language_code": "vi", "meanings": [{"pronunciation": "/rʌn/", "part_of_speech": "verb", "definition": "run", "examples": [{"text": "Run!"}],}],}`;
    expect(() => parseTranslationJSON(malformed)).not.toThrow();
  });

  it("repairs markdown fences wrapping the JSON (```json ... ```)", () => {
    // AI models often wrap their output in code fences
    const fenced = `\`\`\`json\n{"source_language_code":"en","translated_language_code":"vi","translation":"she runs"}\n\`\`\``;
    const result = parseTranslationJSON(fenced) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toBe("she runs");
  });

  it("repairs single-quoted strings", () => {
    // AI may use single quotes instead of double quotes
    const singleQuoted = `{'source_language_code': 'en', 'translated_language_code': 'vi', 'translation': 'cô ấy chạy'}`;
    const result = parseTranslationJSON(singleQuoted) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toBe("cô ấy chạy");
  });

  it("repairs unquoted keys (JavaScript object literal syntax)", () => {
    // AI may output JS object syntax with unquoted keys
    const unquotedKeys = `{source_language_code: "en", translated_language_code: "vi", translation: "she runs"}`;
    const result = parseTranslationJSON(unquotedKeys) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toBe("she runs");
  });

  it("repairs curly/smart quotes in string values", () => {
    // AI may use typographic curly quotes \u201c...\u201d inside string values
    const curlyQuotes = `{"source_language_code":"en","translated_language_code":"vi","translation":"She said \u201chello\u201d to him."}`;
    const result = parseTranslationJSON(curlyQuotes) as SentenceTranslation;
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");

    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toContain("hello");
  });

  it("repairs Python boolean constants (True/False/None)", () => {
    // Unlikely but possible when AI output mixes Python and JSON styles
    const pythonBools = `{"source_language_code": "en", "translated_language_code": "vi", "translation": "she runs", "extra": None}`;
    const result = parseTranslationJSON(pythonBools) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toBe("she runs");
  });

  it("repairs JavaScript-style comments in JSON", () => {
    // AI may include // comments inside the JSON
    const withComments = `{
      // this is the source
      "source_language_code": "en",
      "translated_language_code": "vi",
      "translation": "she runs"
    }`;
    const result = parseTranslationJSON(withComments) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toBe("she runs");
  });

  it("repairs unescaped double quotes inside string values (hotfix)", () => {
    // An AI bug: it writes "He said "hi" to me" instead of "He said \"hi\" to me"
    // jsonrepair doesn't handle this yet (https://github.com/josdejong/jsonrepair/issues/161)
    // so we have a custom hotfix applied after jsonrepair
    const unescapedQuotes = `{"source_language_code":"en","translated_language_code":"vi","translation":"He said "hello" to his friend."}`;
    const result = parseTranslationJSON(unescapedQuotes) as SentenceTranslation;
    expect(isSentenceTranslation(result)).toBe(true);
    expect(result.translation).toContain("hello");
  });

  it("repairs mistyped keys using fuzzy search (e.g., phral_verb to phrasal_verb)", () => {
    const malformedJsonWithTypo = `{
  "source_language_code": "en",
  "translated_language_code": "zh",
  "source_language_main_country_code": "us",
  "translated_language_main_country_code": "cn",
  "source_tts_language_code": "en-US",
  "translated_tts_language_code": "zh-CN",
  "word": "build",
  "verb_forms": [
    { "label": "动词原形", "form": "build" }
  ],
  "meanings": [
    {
      "pronunciation": {
        "UK": { "ipa": ["/bɪld/"], "tts_code": "en-GB" },
        "US": { "ipa": ["/bɪld/"], "tts_code": "en-US" },
      },
      "part_of_speech": "动词",
      "definition": "建造；修建；构筑",
      "examples": [
        {
          "text": "They are **building** a new house by the river.",
          "translation": "他们正在河边**建造**一座新房子。"
        }
      ],
      "phrasal_verbs": {
        "label": "短语动词",
        "items": [
          {
            "phral_verb": "build up",
            "meaning": "建立；增进；逐渐增强",
            "examples": [
              {
                "text": "Pressure began to **build up**.",
                "translation": "压力开始**逐渐增大**。"
              }
            ]
          }
        ]
      }
    }
  ]
}`;
    const result = parseTranslationJSON(
      malformedJsonWithTypo,
    ) as DictionaryEntry;
    expect(isDictionaryEntry(result)).toBe(true);
    expect(result.meanings[0].phrasal_verbs?.items[0].phrasal_verb).toBe(
      "build up",
    );
    expect(
      (result.meanings[0].phrasal_verbs?.items[0] as any).phral_verb,
    ).toBeUndefined();
  });

  it("parses successfully when AI outputs null instead of omitting optional fields (nullish)", () => {
    const jsonWithNulls = `{
      "source_language_code": "en",
      "translated_language_code": "vi",
      "word": "apparatus",
      "verb_forms": null,
      "meanings": [
        {
          "pronunciation": "/æp.əˈreɪ.təs/",
          "part_of_speech": "Noun",
          "definition": "A set of equipment.",
          "examples": [{ "text": "The breathing apparatus." }],
          "synonyms": null,
          "idioms": null,
          "phrasal_verbs": null
        }
      ]
    }`;
    const result = parseTranslationJSON(jsonWithNulls) as DictionaryEntry;
    expect(isDictionaryEntry(result)).toBe(true);
    expect(result.verb_forms).toBeNull();
    expect(result.meanings[0].synonyms).toBeNull();
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
