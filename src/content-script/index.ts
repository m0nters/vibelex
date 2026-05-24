/* Content script entry point.
 *
 * This file is the Vite/Rollup input for the content script bundle. Importing
 * `./eventListeners` triggers all side-effect registrations (DOM listeners,
 * Chrome runtime listeners, etc.), which in turn pull in the other modules.
 *
 * Vite bundles everything into a single IIFE script — no ES module loading
 * happens at runtime in the browser, so there are no Chrome content-script
 * ES module restrictions to worry about.
 */

import "./eventListeners";
