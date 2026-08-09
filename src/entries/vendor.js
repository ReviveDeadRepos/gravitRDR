// Vendor entry: load the legacy browser-global libraries through real imports
// and re-expose them on `window` for the old-style app code.
//
// Import order matters here, jqtree registers its widget onto the global
// `jQuery`, so `vendor/jquery.js` must evaluate first.
import "./vendor/jquery.js";
import "jqtree";
import "mousetrap";

import * as opentype from "opentype.js";
import Module from "wawoff2/build/decompress_binding.js";
import rangy from "rangy";
import "rangy/lib/rangy-classapplier.js";
import "rangy/lib/rangy-selectionsaverestore.js";
import pako from "pako";
import * as ColorThief from "colorthief";
import URI from "urijs";

window.opentype = opentype;
window.Module = Module;
window.rangy = rangy;
window.pako = pako;
window.ColorThief = ColorThief;
window.URI = URI;
