/* Dictionary popup — the iframe overlay that shows the translation result
 * after the user clicks the dictionary button.
 */

import {
  getCurrentAppLanguage,
  getDictionaryPopup,
  getTheme,
  POPUP_WIDTH,
  setDictionaryPopup,
} from "./state";

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

/** Calculate position for the popup relative to the text selection. */
function getPopupPosition(x: number, y: number, height: number) {
  // `x` and `y` are the initial positions where the dictionary button was placed.
  let newX = x;
  let newY = y;

  const selection = window.getSelection();
  const rects = selection?.rangeCount
    ? selection.getRangeAt(0).getClientRects()
    : [];
  const lastRect = rects.length > 0 ? rects[rects.length - 1] : null;

  // Calculate available space relative to the viewport
  let spaceAbove = 0;
  let spaceBelow = window.innerHeight;

  if (lastRect) {
    spaceAbove = lastRect.top;
    spaceBelow = window.innerHeight - lastRect.bottom;
  } else {
    // Fallback for native input form case: estimate space based on the passed
    // Y coordinate (viewport Y)
    spaceAbove = y - window.scrollY;
    spaceBelow = window.innerHeight - spaceAbove;
  }

  const MARGIN = 8; // gap between selection and popup

  if (spaceBelow < height && spaceAbove >= height) {
    // Not enough space below but enough above -> position ABOVE selection
    if (lastRect) {
      newY = lastRect.top + window.scrollY - height - MARGIN;
    } else {
      newY = y - height - MARGIN;
    }
  } else if (spaceBelow < height && spaceAbove < height) {
    // Not enough space in either direction -> CENTER vertically
    newY = (window.innerHeight - height) / 2 + window.scrollY;

    // Push the popup slightly away from the cursor horizontally so it doesn't
    // completely cover the text being read. If there's room on the right, push
    // right; otherwise push left.
    if (x + POPUP_WIDTH + MARGIN <= window.innerWidth + window.scrollX) {
      newX = x + MARGIN;
    } else {
      newX = x - POPUP_WIDTH - MARGIN;
    }
  } else {
    // Enough space below (default) -> position BELOW selection
    if (lastRect) {
      newY = lastRect.bottom + window.scrollY + MARGIN;
    } else {
      newY = y + MARGIN;
    }
  }

  // Ensure popup doesn't go off-screen horizontally (right edge)
  if (newX + POPUP_WIDTH > window.innerWidth + window.scrollX) {
    newX = window.innerWidth + window.scrollX - POPUP_WIDTH - MARGIN;
  }

  // Clamp left edge just in case
  if (newX < window.scrollX) {
    newX = window.scrollX + MARGIN;
  }

  return { popupX: newX, popupY: newY };
}

// ---------------------------------------------------------------------------
// Show
// ---------------------------------------------------------------------------

/** Create the dictionary popup iframe and set up its message handlers. */
export async function showDictionaryPopup(
  selectedText: string,
  x: number,
  y: number,
) {
  // Remove existing popup if any
  closeDictionaryPopup();

  // Pre-fetch the current app language
  const currentAppLanguage = await getCurrentAppLanguage();

  try {
    const popup = document.createElement("iframe");
    popup.id = "dictionary-popup";

    const popupURL = chrome.runtime.getURL("dictionary-popup.html");

    popup.src = popupURL;

    // Default popup dimensions (height will be updated dynamically)
    const popupInitialHeight = 200; // Initial height, e.g., for the loading screen, will be updated later by popup content

    const { popupX, popupY } = getPopupPosition(x, y, popupInitialHeight);

    const theme = await getTheme();
    const isDark = theme === "dark";

    popup.style.cssText = `
      position: absolute;
      left: ${popupX}px;
      top: ${popupY}px;
      width: ${POPUP_WIDTH}px;
      height: ${popupInitialHeight}px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 10px 30px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"};
      z-index: 99999;
      background: ${isDark ? "#0f172a" : "white"};
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      color-scheme: ${isDark ? "dark" : "light"};
    `;

    document.body.appendChild(popup);
    setDictionaryPopup(popup);

    // Listen for popup ready message and then send the text
    const handlePopupMessage = (event: MessageEvent) => {
      const currentPopup = getDictionaryPopup();

      // Only handle messages from our popup iframe
      if (currentPopup && event.source !== currentPopup.contentWindow) {
        return;
      }

      if (event.data.type === "POPUP_READY" && currentPopup) {
        currentPopup.contentWindow?.postMessage(
          {
            type: "TRANSLATE_TEXT",
            text: selectedText,
            appLanguage: currentAppLanguage,
          },
          "*",
        );

        // The delay is to hide the position transition when popup height is
        // adjusted from loading screen to actual content, this is just for UI.
        // If you delete it, there will be a weird jumpy effect.
        if (currentPopup) {
          setTimeout(() => {
            // Re-read state in case popup was removed during the timeout
            const p = getDictionaryPopup();
            if (p) {
              p.style.opacity = "1";
              p.style.visibility = "visible";
            }
          }, 200); // this is a minimum delay quantity, lower than this may cause the jumpy effect to be visible
        }
      } else if (event.data.type === "UPDATE_POPUP_HEIGHT" && currentPopup) {
        const newHeight = event.data.height;
        currentPopup.style.height = `${newHeight}px`;
        const { popupX, popupY } = getPopupPosition(x, y, newHeight);
        currentPopup.style.left = `${popupX}px`;
        currentPopup.style.top = `${popupY}px`;
      }
    };
    window.addEventListener("message", handlePopupMessage);
    (popup as any).messageHandler = handlePopupMessage; // save the reference for later removal

    // Add error handling for iframe loading
    popup.onerror = (error) => {
      console.error("Error loading dictionary popup iframe:", error);
    };
  } catch (error) {
    console.error("Error creating dictionary popup:", error);
  }
}

// ---------------------------------------------------------------------------
// Remove
// ---------------------------------------------------------------------------

/**
 * Immediately clean up event listeners and remove the popup iframe from the DOM.
 * This does NOT notify the popup to stop TTS — the caller is responsible for
 * ensuring TTS has already been stopped before calling this function.
 */
export function destroyDictionaryPopup() {
  const popup = getDictionaryPopup();
  if (!popup) return;

  const messageHandler = (popup as any).messageHandler;
  if (messageHandler) {
    window.removeEventListener("message", messageHandler);
  }

  popup.remove();
  setDictionaryPopup(null);
}

/**
 * Gracefully close the popup: first send a `PARENT_CLOSING_POPUP` message so
 * the popup can stop TTS playback, then remove the iframe after a short delay.
 * Use this when the close is initiated from OUTSIDE the popup (e.g. clicking
 * outside, disabling the extension, or opening a new popup).
 */
export function closeDictionaryPopup() {
  const popup = getDictionaryPopup();
  if (!popup) return;

  // Tell the popup to clean up (stop TTS) before we tear it down
  popup.contentWindow?.postMessage({ type: "PARENT_CLOSING_POPUP" }, "*");

  // Give the popup a moment to process the cleanup message, then destroy it
  setTimeout(destroyDictionaryPopup, 50);
}
