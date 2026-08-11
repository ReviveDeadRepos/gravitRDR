import jQuery from "jquery";

// Legacy app code relies on the global `$` / `jQuery` (and jqtree registers
// its plugin onto the global `jQuery`), so expose them on `window`.
window.$ = window.jQuery = jQuery;

export default jQuery;
