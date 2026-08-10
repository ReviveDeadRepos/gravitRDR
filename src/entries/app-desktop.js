// Desktop (electron) application entry
import "./vendor.js";

import "@gravitrdr/infinity-core";
import "@gravitrdr/infinity-editor";
import "@gravitrdr/application";
import "@gravitrdr/application/bootstrap";
import "@gravitrdr/gravitrdr";

// The electron shell must be loaded after bootstrap so that `window.gShell`,
// `window.gApp` and the ready/finished hooks exist before the DOM is ready.
import "../../shell/electron/shell.js";
