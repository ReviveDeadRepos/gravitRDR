// Vendor entry: load the legacy browser-global libraries through real imports
// and re-expose them on `window` for the old-style app code.
//
// Import order matters here, jqtree registers its widget onto the global
// `jQuery`, so `vendor/jquery.js` must evaluate first.
import "./vendor/jquery.js";
import "jqtree";
import "mousetrap";

import * as opentype from "opentype.js";
import wawoff2Source from "wawoff2/build/decompress_binding.js?raw";
import rangy from "rangy";
import "rangy/lib/rangy-classapplier.js";
import "rangy/lib/rangy-selectionsaverestore.js";
import pako from "pako";
import * as ColorThief from "colorthief";
import URI from "urijs";

// The wawoff2 Emscripten binding only assigns its Module object to
// `module.exports` when running under Node. In a browser it expects to be a
// classic-script global, so evaluate the raw source in global scope to expose
// the populated Module (with `decompress` after the wasm initializes) as
// `window.Module`.
(0, eval)(wawoff2Source);

window.opentype = opentype;
window.rangy = rangy;
window.pako = pako;
window.ColorThief = ColorThief;
window.URI = URI;
