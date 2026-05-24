/* Dictionary button — the small floating button that appears when user selects
 * text on a web page. Clicking it opens the dictionary popup iframe.
 */

import {
  getDictionaryButton,
  getDictionaryButtonText,
  getTheme,
  setDictionaryButton,
} from "./state";
import { showDictionaryPopup } from "./dictionaryPopup";

// ---------------------------------------------------------------------------
// Positioning helpers
// ---------------------------------------------------------------------------

/**
 * Collects DOMRects from only the TEXT_NODE segments within `range`.
 *
 * `Range.getClientRects()` by spec also returns rects for element nodes that
 * are fully "contained" inside the range (e.g. a block container whose entire
 * content is selected). Those container rects are much larger than a text line
 * and cause the button to appear in the wrong place.
 *
 * By walking only TEXT_NODEs and slicing each one to the actual selection
 * boundaries, we get purely glyph-level rects — no container leakage,
 * regardless of font size.
 */
function getSelectionTextRects(range: Range): DOMRect[] {
  const rects: DOMRect[] = [];

  // Fast path: entire selection is inside one text node.
  // range.getClientRects() is already tight here — no element rects can leak.
  if (
    range.startContainer.nodeType === Node.TEXT_NODE &&
    range.startContainer === range.endContainer
  ) {
    for (const r of range.getClientRects()) {
      if (r.width > 0 && r.height > 0) rects.push(r);
    }
    return rects;
  }

  // General path: walk every TEXT_NODE under the common ancestor and
  // collect only the portion that intersects the selection.
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
  );

  // The walker's initial currentNode is the root (an element); advance to the
  // first real text node before entering the loop.
  let node = walker.nextNode();
  while (node) {
    if (range.intersectsNode(node)) {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      // Clamp to the actual selection boundaries at the edges.
      if (node === range.startContainer)
        nodeRange.setStart(node, range.startOffset);
      if (node === range.endContainer) nodeRange.setEnd(node, range.endOffset);

      for (const r of nodeRange.getClientRects()) {
        if (r.width > 0 && r.height > 0) rects.push(r);
      }
    }
    node = walker.nextNode();
  }

  return rects;
}

/** Calculate the position for the dictionary button relative to the current text selection. */
export function getButtonPosition() {
  const range = window.getSelection()!.getRangeAt(0);
  const buttonHeight = 26;
  const buttonWidth = 80;

  // Use only text-node rects — immune to container size, font size, etc.
  const textRects = getSelectionTextRects(range);

  if (textRects.length > 0) {
    // Position near the bottom-right of the last text line (classic behavior,
    // works correctly for both single-word and multi-line selections).
    const lastRect = textRects[textRects.length - 1];

    let xPos = lastRect.right + window.scrollX - 20;
    let yPos = lastRect.bottom + window.scrollY + 5;

    // Not enough space below → flip above
    if (lastRect.bottom + buttonHeight + 5 > window.innerHeight) {
      yPos = lastRect.top + window.scrollY - buttonHeight - 5;
    }

    // Clamp horizontally
    if (xPos + buttonWidth > window.innerWidth)
      xPos = window.innerWidth - buttonWidth - 8;
    if (xPos < 8) xPos = 8;

    return { xPos, yPos };
  }

  return { xPos: 0, yPos: 0 };
}

// ---------------------------------------------------------------------------
// Show / Update / Remove
// ---------------------------------------------------------------------------

/** Create and show the dictionary button near the selected text. */
export async function showDictionaryButton(
  selectedText: string,
  x: number,
  y: number,
) {
  try {
    // Remove any existing button, just in case there's a bug
    closeDictionaryButton();

    // Get translated button text
    const buttonText = await getDictionaryButtonText();
    const theme = await getTheme();
    const isDark = theme === "dark";

    const bgNormal = isDark ? "#1e293b" : "white"; // slate-800
    const textNormal = isDark ? "#818cf8" : "#4f46e5"; // indigo-400
    const borderNormal = isDark ? "#6366f1" : "#4f46e5"; // indigo-500
    const shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)";

    const bgHover = "#4f46e5"; // indigo-600
    const textHover = "white";
    const borderHover = isDark ? "#4f46e5" : "white";

    const button = document.createElement("div");
    button.id = "dictionary-button";
    button.textContent = buttonText;
    button.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      background: ${bgNormal};
      color: ${textNormal};
      border: 1px solid ${borderNormal};
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      z-index: 99999;
      box-shadow: 0 2px 8px ${shadowColor};
      user-select: none;
      pointer-events: auto;
      display: inline-block;
      width: auto;
      text-align: center;
      white-space: nowrap;
      line-height: 1.2;
      transition: all 0.2s ease;
    `;

    // Add hover effects to make it more obvious it's clickable
    button.addEventListener("mouseenter", () => {
      button.style.background = bgHover;
      button.style.color = textHover;
      button.style.border = `1px solid ${borderHover}`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = bgNormal;
      button.style.color = textNormal;
      button.style.border = `1px solid ${borderNormal}`;
    });

    // Prevent inspecting element
    button.addEventListener("contextmenu", () => {
      closeDictionaryButton();
    });

    document.body.appendChild(button);
    setDictionaryButton(button);

    // When click, replace dictionary button by dictionary popup
    button.addEventListener("click", async (e) => {
      // Prevent event bubbling
      e.stopPropagation();
      e.preventDefault();
      closeDictionaryButton();
      await showDictionaryPopup(selectedText, x, y);
    });
  } catch (error) {
    console.error("Error creating dictionary button:", error);
  }
}

/**
 * Update the existing dictionary button in-place (text + theme colors) without
 * removing and recreating it. This avoids the visible flicker that occurs, e.g.
 * when App.tsx broadcasts `LANGUAGE_CHANGED` on mount.
 */
export async function updateDictionaryButton() {
  const button = getDictionaryButton();
  if (!button) return;

  try {
    const buttonText = await getDictionaryButtonText();
    const theme = await getTheme();
    const isDark = theme === "dark";

    const bgNormal = isDark ? "#1e293b" : "white";
    const textNormal = isDark ? "#818cf8" : "#4f46e5";
    const borderNormal = isDark ? "#6366f1" : "#4f46e5";

    button.textContent = buttonText;
    button.style.background = bgNormal;
    button.style.color = textNormal;
    button.style.border = `1px solid ${borderNormal}`;
  } catch (error) {
    console.error("Error updating dictionary button:", error);
  }
}

/** Remove the dictionary button from the DOM and clear the state reference. */
export function closeDictionaryButton() {
  const button = getDictionaryButton();
  if (button) {
    button.remove();
    setDictionaryButton(null);
  }
}
