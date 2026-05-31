/* Top-level event listener registrations for the content script.
 *
 * This module is imported (as a side-effect) by `index.ts` to wire up all
 * DOM and Chrome runtime listeners that drive the dictionary feature.
 */

import {
  getButtonPosition,
  closeDictionaryButton,
  showDictionaryButton,
  updateDictionaryButton,
} from "./dictionaryButton";
import {
  closeDictionaryPopup,
  destroyDictionaryPopup,
} from "./dictionaryPopup";
import {
  getDictionaryButton,
  getDictionaryPopup,
  getLastSelectedText,
  isExtensionEnabled,
  setExtensionEnabled,
  setLastSelectedText,
} from "./state";

// ---------------------------------------------------------------------------
// Initialize extension state on load
// ---------------------------------------------------------------------------

(async () => {
  setExtensionEnabled(await isExtensionEnabled());
})();

// ---------------------------------------------------------------------------
// Chrome runtime messages (from App.tsx / extension popup)
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === "EXTENSION_TOGGLE") {
    setExtensionEnabled(message.enabled);

    // If extension is disabled, remove any existing button/popup
    if (!message.enabled) {
      closeDictionaryButton();
      closeDictionaryPopup();
    }

    sendResponse({ success: true });
  }

  // Listen for language or theme change messages and forward to dictionary popup
  if (message.type === "LANGUAGE_CHANGED" || message.type === "THEME_CHANGED") {
    if (getDictionaryButton()) {
      await updateDictionaryButton();
    }

    // If there's a dictionary popup, send the message to it
    // so that it can update its UI language or theme
    const popup = getDictionaryPopup();
    if (popup && popup.contentWindow) {
      popup.contentWindow.postMessage(message, "*");
    }

    sendResponse({ success: true });
  }
});

// ---------------------------------------------------------------------------
// Text selection → show dictionary button
// ---------------------------------------------------------------------------

// The event is not "selectionchange" because for example, we are typing
// something and select all using Ctrl+A
document.addEventListener("mouseup", async (e) => {
  // Check if extension is enabled
  const enabled = await isExtensionEnabled();
  if (!enabled) {
    return;
  }

  // // Don't show the button when the user is interacting with an editable element
  // // (input, textarea, select, or contenteditable). This prevents the button
  // // from popping up during normal text editing / double-click-to-select actions.
  // const target = e.target as HTMLElement | null;
  // if (target) {
  //   const tagName = target.tagName;
  //   if (
  //     tagName === "INPUT" ||
  //     tagName === "TEXTAREA" ||
  //     tagName === "SELECT" ||
  //     target.isContentEditable
  //   ) {
  //     return;
  //   }
  // }

  const selection = window.getSelection();
  const selectedText = selection?.toString().replace(/ +/g, " ").trim(); // Normalize spaces

  if (
    selectedText &&
    selectedText.length > 0 &&
    selectedText !== getLastSelectedText() // prevent showing button after clicking it
  ) {
    setLastSelectedText(selectedText);
    const { xPos, yPos } = getButtonPosition(e.clientX, e.clientY);

    // Show dictionary button and popup at the bottom right of the selection
    // by default
    await showDictionaryButton(selectedText, xPos, yPos);
  }
  // This case only happens when select no text, or in the middle between
  // selecting 2 different texts
  else if (!selectedText || selectedText.length === 0) {
    setLastSelectedText(null);
    closeDictionaryButton();
  }
});

// ---------------------------------------------------------------------------
// Popup close-button click (popup → content script)
// ---------------------------------------------------------------------------

// Listen for the popup's own close-button click. When the user clicks the X
// button inside the popup, the popup stops TTS itself and then sends this
// message to request iframe removal. Since TTS is already stopped, we can
// destroy immediately without the dismiss delay.
// Listen for messages from the popup
window.addEventListener("message", (event) => {
  if (
    event.data.type === "POPUP_CLOSE_BUTTON_CLICKED" ||
    event.data.type === "POPUP_BLURRED"
  ) {
    destroyDictionaryPopup();
  }
});

// ---------------------------------------------------------------------------
// Click outside → dismiss button / popup
// ---------------------------------------------------------------------------

// Increasing UX, when select a different text, or click outside, the old button
// and popup should disappear right away, not waiting for the mouseup event
document.addEventListener("mousedown", (e) => {
  const button = getDictionaryButton();
  if (button && !button.contains(e.target as Node)) {
    closeDictionaryButton();
  }

  const popup = getDictionaryPopup();
  if (popup && !popup.contains(e.target as Node)) {
    closeDictionaryPopup();
  }
});

// When user click on the extension popup in the browser toolbar
// (or switch tabs/windows), mousedown event will NOT occur on the page,
// but the page will lose focus (blur).
window.addEventListener("blur", () => {
  closeDictionaryButton();

  // If focus shifted to the popup iframe itself (user clicked inside it),
  // document.hasFocus() will still be true. If the user clicked the extension
  // popup or switched tabs, document.hasFocus() will be false.
  // We use setTimeout because focus states might be transitioning during the blur event.
  setTimeout(() => {
    if (!document.hasFocus()) {
      closeDictionaryPopup();
    }
  }, 10);
});
