import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useTranslation } from "./useTranslation";
import { translateWithGemini, saveTranslation } from "@/services";
import { updatePopupHeight } from "@/utils";
import { AppException } from "@/types";

// ─── Module Mocks ─────────────────────────────────────────────────────────────

vi.mock("@/services", () => ({
  translateWithGemini: vi.fn(),
  saveTranslation: vi.fn(),
}));

vi.mock("@/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils")>();
  return {
    ...actual,
    // Side-effect only — just silence it in tests
    updatePopupHeight: vi.fn(),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SENTENCE_JSON = JSON.stringify({
  translation: "Xin chào thế giới",
  source_language_code: "en",
  translated_language_code: "vi",
});

const DICTIONARY_JSON = JSON.stringify({
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
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Makes chrome.storage.sync.get behave as a no-op callback for mount effect.
 * The hook calls it as: chrome.storage.sync.get([...keys], callback)
 */
const mockSyncGetCallback = (data: Record<string, string> = {}) => {
  vi.mocked(chrome.storage.sync.get as any).mockImplementation(
    (_keys: string[], callback?: (data: Record<string, string>) => void) => {
      // If called as a Promise (no callback arg), resolve normally
      if (!callback) return Promise.resolve(data);
      // If called with a callback (useEffect), invoke it synchronously
      callback(data);
    },
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useTranslation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: storage returns nothing (no saved language prefs)
    mockSyncGetCallback({});
    vi.mocked(saveTranslation).mockResolvedValue(undefined);
  });

  // ─── Initial State ────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("initializes with empty text, no translation, not loading, no error", () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.result).toEqual({
        text: "",
        translation: undefined,
        loading: false,
        error: undefined,
      });
    });

    it("initializes with the default language codes", () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.translatedLangCode).toBe("en");
      expect(result.current.sourceLangCode).toBe("auto");
    });
  });

  // ─── Language Loading ─────────────────────────────────────────────────────

  describe("language loading from storage", () => {
    it("loads saved language codes from chrome.storage.sync on mount", async () => {
      mockSyncGetCallback({
        translatedLangCode: "vi",
        sourceLangCode: "en",
      });

      const { result } = renderHook(() => useTranslation());

      await waitFor(() => {
        expect(result.current.translatedLangCode).toBe("vi");
        expect(result.current.sourceLangCode).toBe("en");
      });
    });

    it("keeps default codes if storage has no saved prefs", async () => {
      mockSyncGetCallback({}); // No data

      const { result } = renderHook(() => useTranslation());

      await waitFor(() => {
        expect(result.current.translatedLangCode).toBe("en");
        expect(result.current.sourceLangCode).toBe("auto");
      });
    });
  });

  // ─── translateText: loading state ─────────────────────────────────────────

  describe("translateText — loading state", () => {
    it("sets loading: true and stores text when translation starts", async () => {
      // Make translateWithGemini never resolve (hang) so we can inspect mid-flight
      vi.mocked(translateWithGemini).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useTranslation());

      act(() => {
        result.current.translateText("Hello world");
      });

      expect(result.current.result.loading).toBe(true);
      expect(result.current.result.text).toBe("Hello world");
      expect(result.current.result.error).toBeUndefined();
    });
  });

  // ─── translateText: success ───────────────────────────────────────────────

  describe("translateText — success", () => {
    it("sets translation and clears loading on sentence translation", async () => {
      vi.mocked(translateWithGemini).mockResolvedValue(SENTENCE_JSON);

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeUndefined();

      const translation = result.current.result.translation as any;
      expect(translation.translation).toBe("Xin chào thế giới");
      // Hook injects `text` field into sentence translations
      expect(translation.text).toBe("Hello world");
    });

    it("sets translation and clears loading on dictionary entry", async () => {
      vi.mocked(translateWithGemini).mockResolvedValue(DICTIONARY_JSON);

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("cat");
      });

      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeUndefined();

      const translation = result.current.result.translation as any;
      expect(translation.word).toBe("cat");
    });

    it("calls saveTranslation after a successful translation", async () => {
      vi.mocked(translateWithGemini).mockResolvedValue(SENTENCE_JSON);

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(saveTranslation).toHaveBeenCalledTimes(1);
    });

    it("calls updatePopupHeight after a successful translation", async () => {
      vi.mocked(translateWithGemini).mockResolvedValue(SENTENCE_JSON);

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(updatePopupHeight).toHaveBeenCalled();
    });

    it("does NOT fail the result if saveTranslation throws", async () => {
      vi.mocked(translateWithGemini).mockResolvedValue(SENTENCE_JSON);
      vi.mocked(saveTranslation).mockRejectedValue(new Error("Storage full"));

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      // Should still succeed even though history saving failed
      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeUndefined();
      expect(result.current.result.translation).toBeDefined();
    });
  });

  // ─── translateText: errors ────────────────────────────────────────────────

  describe("translateText — error handling", () => {
    it("sets error and clears loading when translateWithGemini throws an AppException", async () => {
      const appError = new AppException({
        code: "API_KEY_INVALID",
        data: { message: "Bad key" },
      });
      vi.mocked(translateWithGemini).mockRejectedValue(appError);

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeInstanceOf(AppException);
      expect(result.current.result.error?.code).toBe("API_KEY_INVALID");
      expect(result.current.result.translation).toBeUndefined();
    });

    it("wraps a generic Error as GENERAL_ERROR AppException", async () => {
      vi.mocked(translateWithGemini).mockRejectedValue(
        new Error("Network timeout"),
      );

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeInstanceOf(AppException);
      expect(result.current.result.error?.code).toBe("GENERAL_ERROR");
      expect(result.current.result.error?.data?.message).toBe(
        "Network timeout",
      );
    });

    it("calls updatePopupHeight even after an error", async () => {
      vi.mocked(translateWithGemini).mockRejectedValue(new Error("timeout"));

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(updatePopupHeight).toHaveBeenCalled();
    });

    it("sets error and clears loading when JSON parsing fails", async () => {
      // Return something that cannot be parsed as any valid translation structure
      vi.mocked(translateWithGemini).mockResolvedValue('{"garbage": true}');

      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.translateText("Hello world");
      });

      expect(result.current.result.loading).toBe(false);
      expect(result.current.result.error).toBeDefined();
    });
  });
});
