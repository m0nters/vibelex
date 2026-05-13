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
  private voiceCache = new Map<string, SpeechSynthesisVoice>();
  private voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Ensures that voices are loaded before accessing them.
   * Handles the async nature of `getVoices()` — on many browsers,
   * voices aren't available until the `voiceschanged` event fires.
   */
  private ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    if (this.voicesLoadedPromise) return this.voicesLoadedPromise;

    this.voicesLoadedPromise = new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Voices not yet loaded — wait for the voiceschanged event
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          onVoicesChanged,
        );
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    });

    return this.voicesLoadedPromise;
  }

  /**
   * Preloads and caches voices for the given TTS language codes.
   * Call this once when entering a page (e.g. history detail, dictionary popup)
   * with the source and translated language codes.
   */
  async preloadVoices(ttsCodes: string[]): Promise<void> {
    if (!window.speechSynthesis) return;

    const voices = await this.ensureVoicesLoaded();

    for (const code of ttsCodes) {
      // Skip if already cached
      if (this.voiceCache.has(code)) continue;

      const bestVoice = this.pickBestVoice(voices, code);
      if (bestVoice) {
        this.voiceCache.set(code, bestVoice);
      }
    }

    console.log(
      "Preloaded TTS voices:",
      Object.fromEntries(
        ttsCodes.map((code) => [
          code,
          this.voiceCache.get(code)?.name ?? "none",
        ]),
      ),
    );
  }

  /**
   * Picks the best voice for a given TTS code (exact lang match only).
   * Prefers local voices over online ones for the same code, since local
   * voices will save some network requests.
   */
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
   * Resolves the best exact-match voice for a TTS code, loading voices on
   * demand in case preload hasn't populated the cache yet.
   */
  private async getVoiceForCode(
    code: string,
  ): Promise<SpeechSynthesisVoice | undefined> {
    // If preload has populated the cache, then use it and early return.
    // Normally this should always be the case, since the preload will happen
    // very fast when loading the page, while user will take some time to press
    // the speaker button.
    const cachedVoice = this.voiceCache.get(code);
    if (cachedVoice) return cachedVoice;

    // Otherwise, wait for voices to load and try to find the best match.
    // I don't think if the program should ever run this flow.
    const voices = await this.ensureVoicesLoaded();
    const bestVoice = this.pickBestVoice(voices, code);
    if (bestVoice) {
      this.voiceCache.set(code, bestVoice);
    }
    console.log(
      "No cached voice found for",
      code,
      "and had to wait for voices to load! You outspeed the preload!",
    );

    return bestVoice;
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

      // Always set lang so the browser has a fallback
      utterance.lang = ttsCode;

      // Resolve an exact-match voice on demand IN CASE preload is still pending.
      const voice = await this.getVoiceForCode(ttsCode);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = isSlow ? 0.5 : 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        onStart?.();
        console.log(
          `TTS started, voice is: ${utterance.voice?.name}, id: ${utterance.voice?.voiceURI}`,
        );
      };

      utterance.onend = () => {
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
