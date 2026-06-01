const MIN_POPUP_HEIGHT_ALLOWED = 150;
const MAX_POPUP_HEIGHT_ALLOWED = 500;
/**
 * Calculates and updates the popup height based on content.
 *
 * We temporarily remove the classes that inflate the height (`min-h-screen`
 * on the root container and `flex-1` on the content wrapper) to let the
 * browser naturally shrink-wrap around the actual content. We then measure
 * `container.getBoundingClientRect().height` for the precise content height.
 *
 * `overflow-y-auto` is only added to the content wrapper when the natural
 * content height exceeds `maxHeight`, enabling scrolling for long results
 * while keeping short states (loading, error, tips) scroll-free.
 *
 * The iframe and `<html>` both have `overflow: hidden`, so any tiny
 * subpixel overshoot is simply clipped rather than causing a scrollbar.
 */
export const updatePopupHeight = (): void => {
  setTimeout(() => {
    const root = document.getElementById("root");
    const container = root?.firstElementChild as HTMLElement | null;
    const contentWrapper = document.getElementById(
      "dictionary-content-wrapper",
    );
    if (!container || !contentWrapper) return;

    // Temporarily remove classes that stretch the layout
    container.classList.remove("min-h-screen", "max-h-screen");
    contentWrapper.classList.remove("flex-1", "overflow-y-auto");

    // Measure the container's natural height (shrink-wrapped to content).
    // Math.ceil handles fractional pixels so the iframe is never too small.
    let contentHeight = Math.ceil(container.getBoundingClientRect().height);

    // Also check for absolutely-positioned children (e.g. dropdown menus)
    // that overflow beyond the container bounds.
    const containerRect = container.getBoundingClientRect();
    const absElements = container.querySelectorAll<HTMLElement>(
      "[class*='absolute']",
    );
    for (const el of absElements) {
      // Only consider visible absolute elements (opacity > 0 = open dropdown)
      const style = getComputedStyle(el);
      if (style.opacity === "0" || style.display === "none") continue;

      const elRect = el.getBoundingClientRect();
      // Add 20px padding at the bottom for aesthetics (prevents content from touching the border)
      const overflow = elRect.bottom - containerRect.top + 20;
      if (overflow > contentHeight) {
        contentHeight = Math.ceil(overflow);
      }
    }

    // Restore the classes immediately (synchronous — no repaint occurs)
    container.classList.add("min-h-screen", "max-h-screen");
    contentWrapper.classList.add("flex-1");

    const totalHeight = Math.max(
      MIN_POPUP_HEIGHT_ALLOWED,
      Math.min(contentHeight, MAX_POPUP_HEIGHT_ALLOWED),
    );

    // Only enable scrolling when content is taller than maxHeight.
    // Short states (loading, error, tips) stay scroll-free.
    if (contentHeight > MAX_POPUP_HEIGHT_ALLOWED) {
      contentWrapper.classList.add("overflow-y-auto");
    } else {
      contentWrapper.classList.remove("overflow-y-auto");
    }

    window.parent.postMessage(
      {
        type: "UPDATE_POPUP_HEIGHT",
        height: totalHeight,
      },
      "*",
    );
  }, 100);
};
