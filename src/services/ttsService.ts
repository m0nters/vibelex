/**
 * Text-to-Speech service using Web Speech API
 */
interface SpeakOptions {
  text: string;
  ttsCode: string;
  isSlow?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent | Error) => void;
}

export class TTSService {
  private static instance: TTSService;
  private activeUtteranceId = 0;

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /** Prefer an exact language match and local voices when available. */
  private pickBestVoice(
    voices: SpeechSynthesisVoice[],
    code: string,
  ): SpeechSynthesisVoice | undefined {
    let local: SpeechSynthesisVoice | undefined;
    let online: SpeechSynthesisVoice | undefined;

    for (const v of voices) {
      if (v.lang !== code) continue;

      if (v.localService) {
        local = v;
        break; // local exact match is the best possible
      }
      if (!online) {
        online = v;
      }
    }

    return local ?? online;
  }

  /**
   * Speaks the given text using the specified TTS language code
   */
  speak(options: SpeakOptions): void {
    const { text, ttsCode, isSlow = false, onStart, onEnd, onError } = options;
    try {
      if (!("speechSynthesis" in window)) {
        onError?.(new Error("Speech synthesis not supported"));
        return;
      }

      const utteranceId = ++this.activeUtteranceId;
      window.speechSynthesis.cancel();
      const voice = this.pickBestVoice(
        window.speechSynthesis.getVoices(),
        ttsCode,
      );

      const play = (selectedVoice?: SpeechSynthesisVoice) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = ttsCode;
        utterance.voice = selectedVoice ?? null;
        utterance.rate = isSlow ? 0.5 : 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onstart = () => onStart?.();
        utterance.onend = () => onEnd?.();
        utterance.onerror = (event) => {
          const canRetry =
            utteranceId === this.activeUtteranceId &&
            selectedVoice &&
            (event.error === "synthesis-failed" ||
              event.error === "voice-unavailable");

          if (canRetry) {
            play();
            return;
          }

          console.error("TTS error:", event);
          onError?.(event);
        };
        window.speechSynthesis.speak(utterance);
      };

      play(voice);
    } catch (error) {
      console.error("TTS failed:", error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    this.activeUtteranceId++;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Export a singleton instance
export const ttsService = TTSService.getInstance();
