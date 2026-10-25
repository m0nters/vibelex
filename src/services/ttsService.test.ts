import { TTSService } from "./ttsService";

function fakeVoice(
  lang: string,
  name = `Voice-${lang}`,
  localService = true,
): SpeechSynthesisVoice {
  return { lang, name, default: false, localService, voiceURI: name };
}

class FakeUtterance {
  text: string;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
  onend: ((event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe("TTSService", () => {
  let service: TTSService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;

  const enUS = fakeVoice("en-US", "US English");
  const viVN = fakeVoice("vi-VN", "Vietnamese");

  function lastUtterance(): FakeUtterance {
    return mockSpeak.mock.calls.at(-1)?.[0] as FakeUtterance;
  }

  beforeEach(() => {
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue([enUS, viVN]);
    vi.stubGlobal("speechSynthesis", {
      getVoices: mockGetVoices,
      speak: mockSpeak,
      cancel: mockCancel,
    });
    // @ts-expect-error reset singleton between tests
    TTSService.instance = undefined;
    service = TTSService.getInstance();
  });

  it("uses an exact language voice and sets utterance settings", () => {
    service.speak({ text: "xin chào", ttsCode: "vi-VN", isSlow: true });

    expect(lastUtterance().voice).toBe(viVN);
    expect(lastUtterance().lang).toBe("vi-VN");
    expect(lastUtterance().rate).toBe(0.5);
    expect(mockCancel).toHaveBeenCalledOnce();
  });

  it("does not use a different regional voice and speaks with the lang fallback", () => {
    mockGetVoices.mockReturnValue([enUS]);
    service.speak({ text: "hello", ttsCode: "en-GB" });

    expect(lastUtterance().voice).toBeNull();
    expect(lastUtterance().lang).toBe("en-GB");
  });

  it("starts immediately with lang fallback when no voices are listed", () => {
    mockGetVoices.mockReturnValue([]);
    service.speak({ text: "xin chào", ttsCode: "vi-VN" });

    expect(mockSpeak).toHaveBeenCalledOnce();
    expect(lastUtterance().lang).toBe("vi-VN");
    expect(lastUtterance().voice).toBeNull();
  });

  it("prefers a local exact-match voice", () => {
    const onlineVoice = fakeVoice("vi-VN", "Online Vietnamese", false);
    mockGetVoices.mockReturnValue([onlineVoice, viVN]);
    service.speak({ text: "xin chào", ttsCode: "vi-VN" });

    expect(lastUtterance().voice).toBe(viVN);
  });

  it("retries once without a selected voice after synthesis failure", () => {
    mockSpeak.mockImplementationOnce((utterance: FakeUtterance) => {
      utterance.onerror?.(
        Object.assign(new Event("error"), {
          error: "synthesis-failed",
        }) as SpeechSynthesisErrorEvent,
      );
    });
    service.speak({ text: "xin chào", ttsCode: "vi-VN" });

    expect(mockSpeak).toHaveBeenCalledTimes(2);
    expect(lastUtterance().voice).toBeNull();
    expect(lastUtterance().lang).toBe("vi-VN");
  });

  it("notifies callers when fallback synthesis also fails", () => {
    const onError = vi.fn();
    mockSpeak.mockImplementation((utterance: FakeUtterance) => {
      utterance.onerror?.(
        Object.assign(new Event("error"), {
          error: "synthesis-failed",
        }) as SpeechSynthesisErrorEvent,
      );
    });
    service.speak({ text: "xin chào", ttsCode: "vi-VN", onError });

    expect(mockSpeak).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("calls speechSynthesis.cancel when stopped", () => {
    service.stop();
    expect(mockCancel).toHaveBeenCalledOnce();
  });
});
