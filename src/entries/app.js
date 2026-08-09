// Application entry that loads all packages in dependency order.
// Vendors first: bootstrap and several packages reference the global
// `$` / `jQuery` / `rangy` at module-evaluation time.
import "./vendor.js";

import "@gravitrdr/infinity-core";
import "@gravitrdr/infinity-editor";
import "@gravitrdr/application";
import "@gravitrdr/application/bootstrap";
import "@gravitrdr/gravitrdr";

// The browser shell must be loaded after bootstrap so that `window.gShell`,
// `window.gApp` and the ready/finished hooks exist before the DOM is ready.
import "../../shell/browser/shell.js";
