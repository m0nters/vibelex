import { TTSService } from "./ttsService";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fakeVoice(
  lang: string,
  name = `Voice-${lang}`,
): SpeechSynthesisVoice {
  return {
    lang,
    name,
    default: false,
    localService: true,
    voiceURI: name,
  };
}

/**
 * Minimal SpeechSynthesisUtterance stub for jsdom (which doesn't implement it).
 * Stores all assigned properties so tests can read them back.
 */
class FakeUtterance {
  text: string;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((ev: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// ─── Test suite ─────────────────────────────────────────────────────────────

describe("TTSService", () => {
  let service: TTSService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;

  const enUS = fakeVoice("en-US", "Google US English");
  const viVN = fakeVoice("vi-VN", "Google Vietnamese");
  const enGB = fakeVoice("en-GB", "Google UK English");
  const zhCN = fakeVoice("zh-CN", "Google Chinese");
  const allVoices = [enUS, viVN, enGB, zhCN];

  function getLastUtterance(): FakeUtterance {
    const calls = mockSpeak.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[calls.length - 1][0] as FakeUtterance;
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Stub SpeechSynthesisUtterance (jsdom doesn't have it)
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    // Stub speechSynthesis
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue(allVoices);

    vi.stubGlobal("speechSynthesis", {
      getVoices: mockGetVoices,
      speak: mockSpeak,
      cancel: mockCancel,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Reset singleton
    // @ts-expect-error — accessing private static for test reset
    TTSService.instance = undefined;
    service = TTSService.getInstance();
  });

  // ─── preloadVoices ──────────────────────────────────────────────────────

  describe("preloadVoices", () => {
    it("caches voices for the requested language codes", async () => {
      await service.preloadVoices(["en-US", "vi-VN"]);

      await service.speak({ text: "hello", ttsCode: "en-US" });
      expect(getLastUtterance().voice).toBe(enUS);
    });

    it("does not use prefix matching (en-GB must not resolve to en-US)", async () => {
      // Only en-US available as local, no en-GB voice at all
      mockGetVoices.mockReturnValue([enUS, viVN]);

      await service.preloadVoices(["en-GB"]);
      await service.speak({ text: "hello", ttsCode: "en-GB" });

      // en-GB not cached → falls back to utterance.lang
      const utterance = getLastUtterance();
      expect(utterance.voice).toBeNull();
      expect(utterance.lang).toBe("en-GB");
    });

    it("does not overwrite an already-cached voice", async () => {
      await service.preloadVoices(["en-US"]);

      // Swap available voices and reset voicesLoadedPromise
      const enUS2 = fakeVoice("en-US", "Another US English");
      mockGetVoices.mockReturnValue([enUS2, viVN, enGB, zhCN]);
      // @ts-expect-error — accessing private for test
      service.voicesLoadedPromise = null;

      await service.preloadVoices(["en-US"]);

      await service.speak({ text: "hello", ttsCode: "en-US" });
      expect(getLastUtterance().voice).toBe(enUS); // original kept
    });

    it("prefers local voices over online ones", async () => {
      const onlineGB = {
        ...fakeVoice("en-GB", "Online GB Voice"),
        localService: false,
      };
      const localGB = fakeVoice("en-GB", "Local GB Voice"); // localService: true

      // Online voice appears first in the list
      mockGetVoices.mockReturnValue([onlineGB, localGB, enUS, viVN]);

      await service.preloadVoices(["en-GB"]);
      await service.speak({ text: "hello", ttsCode: "en-GB" });
      expect(getLastUtterance().voice).toBe(localGB);
    });

    it("caches online voice when no local voice exists for that code", async () => {
      const onlineGB = {
        ...fakeVoice("en-GB", "Online GB Voice"),
        localService: false,
      };

      // Only online voice for en-GB, no local
      mockGetVoices.mockReturnValue([onlineGB, enUS, viVN]);

      await service.preloadVoices(["en-GB"]);
      await service.speak({ text: "hello", ttsCode: "en-GB" });

      const utterance = getLastUtterance();
      expect(utterance.voice).toBe(onlineGB);
      expect(utterance.lang).toBe("en-GB"); // lang always set
    });

    it("is a no-op when speechSynthesis is not available", async () => {
      vi.stubGlobal("speechSynthesis", undefined);

      // Should not throw
      await service.preloadVoices(["en-US"]);
    });
  });

  // ─── speak with cached voice ────────────────────────────────────────────

  describe("speak (with cached voice)", () => {
    it("assigns cached voice to utterance.voice", async () => {
      await service.preloadVoices(["vi-VN"]);

      await service.speak({ text: "xin chào", ttsCode: "vi-VN" });

      expect(getLastUtterance().voice).toBe(viVN);
      expect(mockSpeak).toHaveBeenCalledTimes(1);
    });

    it("always sets utterance.lang even when cached voice exists", async () => {
      await service.preloadVoices(["en-US"]);
      await service.speak({ text: "hello", ttsCode: "en-US" });

      const utterance = getLastUtterance();
      expect(utterance.voice).toBe(enUS);
      expect(utterance.lang).toBe("en-US"); // always set as fallback
    });

    it("sets utterance.lang when no cached voice exists", async () => {
      // Don't preload — cache is empty
      await service.speak({ text: "hola", ttsCode: "es-ES" });

      const utterance = getLastUtterance();
      expect(utterance.voice).toBeNull();
      expect(utterance.lang).toBe("es-ES");
    });

    it("loads and caches an exact voice on demand when not preloaded", async () => {
      await service.speak({ text: "hello", ttsCode: "en-US" });

      let utterance = getLastUtterance();
      expect(utterance.voice).toBe(enUS);
      expect(utterance.lang).toBe("en-US");

      mockGetVoices.mockClear();
      await service.speak({ text: "hello again", ttsCode: "en-US" });

      utterance = getLastUtterance();
      expect(utterance.voice).toBe(enUS);
      expect(mockGetVoices).not.toHaveBeenCalled();
    });

    it("applies slow rate when isSlow is true", async () => {
      await service.speak({
        text: "hello",
        ttsCode: "en-US",
        isSlow: true,
      });

      expect(getLastUtterance().rate).toBeCloseTo(0.5, 1);
    });

    it("applies normal rate when isSlow is false", async () => {
      await service.speak({
        text: "hello",
        ttsCode: "en-US",
        isSlow: false,
      });

      expect(getLastUtterance().rate).toBeCloseTo(0.8, 1);
    });

    it("calls onStart when speech begins", async () => {
      const onStart = vi.fn();
      mockSpeak.mockImplementation((u: FakeUtterance) => {
        u.onstart?.(new Event("start") as SpeechSynthesisEvent);
      });

      await service.speak({ text: "hello", ttsCode: "en-US", onStart });

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("calls onEnd when speech finishes", async () => {
      const onEnd = vi.fn();
      mockSpeak.mockImplementation((u: FakeUtterance) => {
        u.onend?.(new Event("end") as SpeechSynthesisEvent);
      });

      await service.speak({ text: "hello", ttsCode: "en-US", onEnd });

      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it("calls onError on speech error", async () => {
      const onError = vi.fn();
      mockSpeak.mockImplementation((u: FakeUtterance) => {
        u.onerror?.(new Event("error") as SpeechSynthesisErrorEvent);
      });

      await service.speak({ text: "hello", ttsCode: "en-US", onError });

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("cancels any currently playing speech first", async () => {
      await service.speak({ text: "hello", ttsCode: "en-US" });
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ─── ensureVoicesLoaded ─────────────────────────────────────────────────

  describe("ensureVoicesLoaded (voiceschanged event)", () => {
    it("waits for voiceschanged event when getVoices initially returns empty", async () => {
      const lazyGetVoices = vi
        .fn()
        .mockReturnValueOnce([])
        .mockReturnValue(allVoices);

      const captured: { cb: (() => void) | null } = { cb: null };
      const lazyAddListener = vi.fn((_event: string, cb: () => void) => {
        captured.cb = cb;
      });

      const lazySpeak = vi.fn();

      vi.stubGlobal("speechSynthesis", {
        getVoices: lazyGetVoices,
        speak: lazySpeak,
        cancel: vi.fn(),
        addEventListener: lazyAddListener,
        removeEventListener: vi.fn(),
      });

      // @ts-expect-error — reset singleton
      TTSService.instance = undefined;
      service = TTSService.getInstance();

      const preloadPromise = service.preloadVoices(["en-US"]);

      // Simulate voices becoming available
      captured.cb?.();
      await preloadPromise;

      // Speak should use the now-cached voice
      await service.speak({ text: "hello", ttsCode: "en-US" });
      const calls = lazySpeak.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect((calls[calls.length - 1][0] as FakeUtterance).voice).toBe(enUS);
    });

    it("speak waits for voiceschanged on cache miss before speaking", async () => {
      const lazyGetVoices = vi
        .fn()
        .mockReturnValueOnce([])
        .mockReturnValue(allVoices);

      const captured: { cb: (() => void) | null } = { cb: null };
      const lazyAddListener = vi.fn((_event: string, cb: () => void) => {
        captured.cb = cb;
      });

      const lazySpeak = vi.fn();

      vi.stubGlobal("speechSynthesis", {
        getVoices: lazyGetVoices,
        speak: lazySpeak,
        cancel: vi.fn(),
        addEventListener: lazyAddListener,
        removeEventListener: vi.fn(),
      });

      // @ts-expect-error — reset singleton
      TTSService.instance = undefined;
      service = TTSService.getInstance();

      const speakPromise = service.speak({ text: "hello", ttsCode: "en-US" });
      expect(lazySpeak).not.toHaveBeenCalled();

      // Simulate voices becoming available
      captured.cb?.();
      await speakPromise;

      const calls = lazySpeak.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const utterance = calls[calls.length - 1][0] as FakeUtterance;
      expect(utterance.voice).toBe(enUS);
      expect(utterance.lang).toBe("en-US");
    });
  });

  // ─── stop ───────────────────────────────────────────────────────────────

  describe("stop", () => {
    it("calls speechSynthesis.cancel", () => {
      service.stop();
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });
  });
});
