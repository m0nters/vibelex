/**
 * Text-to-Speech service using Web Speech API
 */
interface SpeakOptions {
  text: string;
  ttsCode: string;
  isSlow?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

export class TTSService {
  private static instance: TTSService;

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Speaks the given text using the specified TTS language code
   */
  async speak(options: SpeakOptions): Promise<void> {
    const { text, ttsCode, isSlow = false, onStart, onEnd, onError } = options;
    try {
      // Try Web Speech API
      if (!("speechSynthesis" in window)) {
        console.error("Speech synthesis not supported");
        onError?.(new Error("Speech synthesis not supported") as any);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any current speech

      const utterance = new SpeechSynthesisUtterance(text);

      // Set speech parameters
      utterance.lang = ttsCode; // by writing like this, browser will always pick the first voice
      utterance.rate = isSlow ? 0.5 : 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        const voice = window.speechSynthesis
          .getVoices()
          .find((v) => v.lang === ttsCode);
        console.log("TTS started, voice:", voice?.name ?? "unknown");
        onStart?.();
      };

      utterance.onend = () => {
        console.log("TTS ended");
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.error("TTS error:", e);
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS failed:", error);
      onError?.(error as SpeechSynthesisErrorEvent);
    }
  }

  /**
   * Stop any current speech
   */
  stop(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Export a singleton instance
export const ttsService = TTSService.getInstance();
