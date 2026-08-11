import { IFObject, IFKey, ifKey } from "@gravitrdr/infinity-core";
import { GShell } from "@gravitrdr/application";
import { gShellReady, gShellFinished } from "@gravitrdr/application/bootstrap";
import { GFileStorage } from "./filestorage.js";

/**
 * The electron shell. Menus live in the native application menu of the main
 * process; the renderer only mirrors the logical menu tree and forwards every
 * mutation to it through the preload bridge. Item clicks and menu-open events
 * round-trip back over the same bridge.
 * @class GElectronShell
 * @extends GShell
 * @constructor
 */
function GElectronShell() {
  this._nextId = 1;
  this._nodes = {};
  this._menuCallbacks = {};
  this._itemCallbacks = {};
  this._clipboardMimeTypes = {};

  window.gravit.menu.onClick(
    function (id) {
      var callback = this._itemCallbacks[id];
      if (callback) {
        callback();
      }
    }.bind(this),
  );

  window.gravit.menu.onWillShow(
    function (id) {
      var callback = this._menuCallbacks[id];
      if (callback) {
        callback();
      }
    }.bind(this),
  );

  window.gravit.onOpenFile(
    function (filePath) {
      gApp.openDocument(this._pathToUrl(filePath));
    }.bind(this),
  );
}
IFObject.inherit(GElectronShell, GShell);

/**
 * @type {Number}
 * @private
 */
GElectronShell.prototype._nextId = null;

/**
 * Map of menu node id to its metadata
 * @type {*}
 * @private
 */
GElectronShell.prototype._nodes = null;

/**
 * Map of menu id to the callback to refresh the menu right before it opens
 * @type {*}
 * @private
 */
GElectronShell.prototype._menuCallbacks = null;

/**
 * Map of menu item id to its activate callback
 * @type {*}
 * @private
 */
GElectronShell.prototype._itemCallbacks = null;

/**
 * @type {*}
 * @private
 */
GElectronShell.prototype._clipboardMimeTypes = null;

/** @override */
GElectronShell.prototype.isDevelopment = function () {
  return window.gravit.isDev;
};

/** @override */
GElectronShell.prototype.start = function () {
  var self = this;
  window.gravit.pendingOpens().then(function (files) {
    var hasOpenedDocuments = false;
    for (var i = 0; i < files.length; ++i) {
      gApp.openDocument(self._pathToUrl(files[i]));
      hasOpenedDocuments = true;
    }
    if (!hasOpenedDocuments) {
      GShell.prototype.start.call(self);
    }
  });
};

/** @override */
GElectronShell.prototype.addMenu = function (parentMenu, title, callback) {
  var id = this._newId();
  this._registerNode(id, parentMenu, "menu", title);
  if (callback) {
    this._menuCallbacks[id] = callback;
  }
  return this._nodes[id];
};

/** @override */
GElectronShell.prototype.addMenuSeparator = function (parentMenu) {
  var id = this._newId();
  this._registerNode(id, parentMenu, "separator");
  return this._nodes[id];
};

/** @override */
GElectronShell.prototype.addMenuItem = function (
  parentMenu,
  title,
  checkable,
  shortcut,
  callback,
) {
  var id = this._newId();
  this._registerNode(id, parentMenu, "item", title);
  this._nodes[id].checkable = !!checkable;
  this._nodes[id].accelerator = this._shortcutToAccelerator(shortcut);
  if (callback) {
    this._itemCallbacks[id] = callback;
  }
  return this._nodes[id];
};

/** @override */
GElectronShell.prototype.updateMenuItem = function (
  item,
  title,
  enabled,
  checked,
) {
  if (!item || !this._nodes[item.id]) {
    return;
  }
  var message = { id: item.id };
  if (typeof title === "string") {
    message.title = title;
  }
  if (typeof enabled === "boolean") {
    message.enabled = enabled;
  }
  if (typeof checked === "boolean") {
    message.checked = checked;
  }
  window.gravit.menu.update(message);
};

/** @override */
GElectronShell.prototype.removeMenuItem = function (parentMenu, child) {
  if (!child || !this._nodes[child.id]) {
    return;
  }
  window.gravit.menu.remove({ id: child.id });
  delete this._nodes[child.id];
  delete this._menuCallbacks[child.id];
  delete this._itemCallbacks[child.id];
};

/** @override */
GElectronShell.prototype.getClipboardMimeTypes = function () {
  return this._clipboardMimeTypes
    ? Object.keys(this._clipboardMimeTypes)
    : null;
};

/** @override */
GElectronShell.prototype.getClipboardContent = function (mimeType) {
  if (
    this._clipboardMimeTypes &&
    this._clipboardMimeTypes.hasOwnProperty(mimeType)
  ) {
    return this._clipboardMimeTypes[mimeType];
  }
  return null;
};

/** @override */
GElectronShell.prototype.setClipboardContent = function (mimeType, content) {
  this._clipboardMimeTypes[mimeType] = content;
};

/**
 * Register a menu node locally and forward it to the main process
 * @param {Number} id
 * @param {*} parentMenu the menu node or null for a top-level menu
 * @param {String} type "menu", "item" or "separator"
 * @param {String} [title]
 * @private
 */
GElectronShell.prototype._registerNode = function (
  id,
  parentMenu,
  type,
  title,
) {
  var parentId = parentMenu ? parentMenu.id : null;
  this._nodes[id] = {
    id: id,
    type: type,
    checkable: false,
    accelerator: null,
  };
  window.gravit.menu.add({
    id: id,
    parentId: parentId,
    type: type,
    title: typeof title === "string" ? title : "",
  });
};

/**
 * Convert the internal shortcut array into an electron accelerator
 * @param {Array<*>} shortcut may be null
 * @return {String} accelerator string or null if none
 * @private
 */
GElectronShell.prototype._shortcutToAccelerator = function (shortcut) {
  if (!shortcut) {
    return null;
  }

  var modifiers = [];
  var key = null;

  for (var i = 0; i < shortcut.length; ++i) {
    var entry = shortcut[i];

    if (typeof entry === "number") {
      var code = ifKey.transformKey(entry);
      switch (code) {
        case IFKey.Constant.CONTROL:
          modifiers.push("Ctrl");
          break;
        case IFKey.Constant.SHIFT:
          modifiers.push("Shift");
          break;
        case IFKey.Constant.ALT:
          modifiers.push("Alt");
          break;
        case IFKey.Constant.COMMAND:
          modifiers.push("Cmd");
          break;

        case IFKey.Constant.SPACE:
          key = "Space";
          break;
        case IFKey.Constant.ENTER:
          key = "Enter";
          break;
        case IFKey.Constant.TAB:
          key = "Tab";
          break;
        case IFKey.Constant.BACKSPACE:
          key = "Backspace";
          break;
        case IFKey.Constant.LEFT:
          key = "Left";
          break;
        case IFKey.Constant.UP:
          key = "Up";
          break;
        case IFKey.Constant.RIGHT:
          key = "Right";
          break;
        case IFKey.Constant.DOWN:
          key = "Down";
          break;
        case IFKey.Constant.PAGE_UP:
          key = "PageUp";
          break;
        case IFKey.Constant.PAGE_DOWN:
          key = "PageDown";
          break;
        case IFKey.Constant.HOME:
          key = "Home";
          break;
        case IFKey.Constant.END:
          key = "End";
          break;
        case IFKey.Constant.INSERT:
          key = "Insert";
          break;
        case IFKey.Constant.DELETE:
          key = "Delete";
          break;
        case IFKey.Constant.F1:
        case IFKey.Constant.F2:
        case IFKey.Constant.F3:
        case IFKey.Constant.F4:
        case IFKey.Constant.F5:
        case IFKey.Constant.F6:
        case IFKey.Constant.F7:
        case IFKey.Constant.F8:
        case IFKey.Constant.F9:
        case IFKey.Constant.F10:
        case IFKey.Constant.F11:
        case IFKey.Constant.F12:
          key = "F" + (code - IFKey.Constant.F1 + 1);
          break;
        default:
          throw new Error("Unknown key code");
      }
    } else {
      key = entry;
    }
  }

  if (key === null) {
    return null;
  }

  return modifiers.length > 0 ? modifiers.concat([key]).join("+") : key;
};

/**
 * @return {Number} a fresh, unique menu node id
 * @private
 */
GElectronShell.prototype._newId = function () {
  return this._nextId++;
};

/**
 * Convert an absolute filesystem path into a file:// url
 * @param {String} path
 * @return {String}
 * @private
 */
GElectronShell.prototype._pathToUrl = function (path) {
  var location = path.replace(/\\/g, "/");
  return "file://" + location;
};

window.gShell = new GElectronShell();

var gReadyDone = false;
var gLoadDone = false;

var gRunWhenBooted = function () {
  if (gReadyDone && gLoadDone) {
    gShellFinished();
  }
};

$(document).ready(function () {
  gShellReady();
  gReadyDone = true;
  gRunWhenBooted();
});

$(window).on("load", function () {
  gravitrdr.storages.push(new GFileStorage());
  gLoadDone = true;
  gRunWhenBooted();
});
