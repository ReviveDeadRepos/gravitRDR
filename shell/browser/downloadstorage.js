import { GStorage } from "@gravitrdr/application";
import { IFObject } from "@gravitrdr/infinity-core";

/**
 * The download storage for the browser shell. Prompts are not real dialogs:
 * a save prompt just fabricates a resource url and every save is triggered as
 * a browser download through a temporary anchor element.
 * @class GDownloadStorage
 * @extends GStorage
 * @constructor
 */
export function GDownloadStorage() {}
IFObject.inherit(GDownloadStorage, GStorage);

/** @override */
GDownloadStorage.prototype.isAvailable = function () {
  return true;
};

/** @override */
GDownloadStorage.prototype.isSaving = function () {
  return true;
};

/** @override */
GDownloadStorage.prototype.isPrompting = function () {
  return true;
};

/** @override */
GDownloadStorage.prototype.isDirectory = function () {
  return true;
};

/** @override */
GDownloadStorage.prototype.getProtocol = function () {
  return "download";
};

/** @override */
GDownloadStorage.prototype.getExtensions = function () {
  return null;
};

/** @override */
GDownloadStorage.prototype.getName = function () {
  // TODO : I18N
  return "Download";
};

/** @override */
GDownloadStorage.prototype.saveResourcePrompt = function (
  reference,
  proposedName,
  extension,
  done,
) {
  var ext = Array.isArray(extension)
    ? extension.length
      ? extension[0]
      : null
    : extension;
  var name = proposedName || "download";
  if (ext && name.toLowerCase().indexOf("." + ext.toLowerCase()) < 0) {
    name += "." + ext;
  }
  done(this.getProtocol() + "://" + encodeURIComponent(name));
};

/** @override */
GDownloadStorage.prototype.openDirectoryPrompt = function (reference, done) {
  done(this.getProtocol() + "://");
};

/** @override */
GDownloadStorage.prototype.saveDirectoryPrompt = function (reference, done) {
  done(this.getProtocol() + "://");
};

/** @override */
GDownloadStorage.prototype.save = function (url, data, binary, done) {
  var name = this._extractFileName(url);
  var mimeType = this._getMimeType(name);

  if (!mimeType && !binary) {
    mimeType = "text/plain;charset=utf-8";
  }

  var blob = new Blob([data], { type: mimeType || "application/octet-stream" });

  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // The download must have started before the object url is released
  setTimeout(function () {
    URL.revokeObjectURL(link.href);
  }, 1000);

  if (done) {
    done(name);
  }
};

/** @override */
GDownloadStorage.prototype.resolveUrl = function (url, resolved) {
  // Downloads are never resolved to a readable location
  resolved(url);
};

/**
 * @param {String} url
 * @return {String}
 * @private
 */
GDownloadStorage.prototype._extractFileName = function (url) {
  var prefix = this.getProtocol() + "://";
  var name = url.indexOf(prefix) === 0 ? url.substring(prefix.length) : url;
  try {
    name = decodeURIComponent(name);
  } catch (e) {
    // name was not encoded, keep it as is
  }
  return name;
};

/**
 * @param {String} name
 * @return {String}
 * @private
 */
GDownloadStorage.prototype._getMimeType = function (name) {
  var lastDot = name.lastIndexOf(".");
  var extension = lastDot >= 0 ? name.substring(lastDot + 1).toLowerCase() : "";
  if (extension === "png") {
    return "image/png";
  } else if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }
  return null;
};
