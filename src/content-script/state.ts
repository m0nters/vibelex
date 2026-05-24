/* Shared mutable state and Chrome storage helpers for the content script.
 *
 * Both `dictionaryButton.ts` and `dictionaryPopup.ts` need to read/write these
 * variables. Centralizing them here avoids circular imports.
 *
 * ES module `export let` bindings are read-only from the importer's side, so we
 * use getter/setter functions for all mutable state.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Width of the dictionary popup iframe (px). */
export const POPUP_WIDTH = 300;

// Hardcoded translations for the dictionary button label.
// These cannot use the i18n system (`react-i18next`) because the content script
// runs in the host page context, not the extension popup context.
const DICTIONARY = {
  en: "dictionary",
  vi: "tra từ điển",
  zh: "词典",
  ja: "辞書",
  ko: "사전",
  fr: "dictionnaire",
  es: "diccionario",
  de: "wörterbuch",
} as const;

// ---------------------------------------------------------------------------
// Mutable state (getter / setter pattern)
// ---------------------------------------------------------------------------

let _dictionaryButton: HTMLElement | null = null;
let _dictionaryPopup: HTMLIFrameElement | null = null;
let _extensionEnabled: boolean = true; // Default to enabled
let _lastSelectedText: string | null = null; // Prevents re-showing the button after clicking it

export function getDictionaryButton(): HTMLElement | null {
  return _dictionaryButton;
}
export function setDictionaryButton(el: HTMLElement | null): void {
  _dictionaryButton = el;
}

export function getDictionaryPopup(): HTMLIFrameElement | null {
  return _dictionaryPopup;
}
export function setDictionaryPopup(el: HTMLIFrameElement | null): void {
  _dictionaryPopup = el;
}

export function getExtensionEnabled(): boolean {
  return _extensionEnabled;
}
export function setExtensionEnabled(enabled: boolean): void {
  _extensionEnabled = enabled;
}

export function getLastSelectedText(): string | null {
  return _lastSelectedText;
}
export function setLastSelectedText(text: string | null): void {
  _lastSelectedText = text;
}

// ---------------------------------------------------------------------------
// Chrome storage helpers
// ---------------------------------------------------------------------------

/** Read the user's chosen app language from Chrome sync storage. */
export async function getCurrentAppLanguage(): Promise<string> {
  try {
    const data = await chrome.storage.sync.get(["appLangCode"]);
    return data.appLangCode || "en";
  } catch (error) {
    console.error("Error getting current app language:", error);
    return "en"; // Fallback language
  }
}

/** Return the translated label for the dictionary button. */
export async function getDictionaryButtonText(): Promise<string> {
  try {
    const currentLang =
      (await getCurrentAppLanguage()) as keyof typeof DICTIONARY;
    const translation = DICTIONARY[currentLang];
    return translation;
  } catch (error) {
    console.error("Error getting dictionary button text:", error);
    return "dictionary"; // Fallback text
  }
}

/** Read the current theme from Chrome local storage, falling back to the OS preference. */
export async function getTheme(): Promise<"dark" | "light"> {
  try {
    const data = await chrome.storage.local.get(["theme"]);
    if (data.theme) return data.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (error) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
}

/** Check whether the extension is enabled in Chrome sync storage. */
export async function isExtensionEnabled(): Promise<boolean> {
  try {
    const data = await chrome.storage.sync.get(["extensionEnabled"]);
    // Default to true if not set, for first time installing the extension
    return data.extensionEnabled !== false;
  } catch (error) {
    // Default to enabled on error
    return true;
  }
}
