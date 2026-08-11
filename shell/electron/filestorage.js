import { GStorage } from "@gravitrdr/application";
import { IFObject } from "@gravitrdr/infinity-core";

/**
 * The file storage for the electron shell. All file I/O and all dialogs run
 * in the main process; this class only translates between the url-space of
 * the app (file:// urls) and the renderer bridge.
 * @class GFileStorage
 * @extends GStorage
 * @constructor
 */
export function GFileStorage() {}
IFObject.inherit(GFileStorage, GStorage);

/** @override */
GFileStorage.prototype.isAvailable = function () {
  return true;
};

/** @override */
GFileStorage.prototype.isSaving = function () {
  return true;
};

/** @override */
GFileStorage.prototype.isPrompting = function () {
  return true;
};

/** @override */
GFileStorage.prototype.isDirectory = function () {
  return true;
};

/** @override */
GFileStorage.prototype.getProtocol = function () {
  return "file";
};

/** @override */
GFileStorage.prototype.getExtensions = function () {
  return null;
};

/** @override */
GFileStorage.prototype.getName = function () {
  // TODO : I18N
  return "File";
};

/** @override */
GFileStorage.prototype.openResourcePrompt = function (
  reference,
  extensions,
  done,
) {
  window.gravit.dialog
    .open({
      defaultPath: this._workingDirectory(reference),
      filters: this._filters(extensions),
    })
    .then(
      function (filePath) {
        if (filePath) {
          done(this._toUrl(filePath));
        }
      }.bind(this),
    );
};

/** @override */
GFileStorage.prototype.saveResourcePrompt = function (
  reference,
  proposedName,
  extension,
  done,
) {
  var defaultPath = null;
  if (proposedName) {
    var directory = this._workingDirectory(reference);
    var ext = Array.isArray(extension)
      ? extension.length
        ? extension[0]
        : null
      : extension;
    defaultPath = directory ? directory + proposedName : proposedName;
    if (ext && defaultPath.toLowerCase().indexOf("." + ext.toLowerCase()) < 0) {
      defaultPath += "." + ext;
    }
  }

  window.gravit.dialog
    .save({
      defaultPath: defaultPath,
      filters: this._filters(extension),
    })
    .then(
      function (filePath) {
        if (filePath) {
          done(this._toUrl(filePath));
        }
      }.bind(this),
    );
};

/** @override */
GFileStorage.prototype.openDirectoryPrompt = function (reference, done) {
  this._directoryPrompt(reference, done);
};

/** @override */
GFileStorage.prototype.saveDirectoryPrompt = function (reference, done) {
  this._directoryPrompt(reference, done);
};

/** @override */
GFileStorage.prototype.load = function (url, binary, done) {
  var location = this._urlToPath(url);
  window.gravit.fs.load(location, binary).then(
    function (data) {
      if (data === null) {
        console.error("load failed: " + location);
        return;
      }
      done(data, this._extractFileName(location));
    }.bind(this),
  );
};

/** @override */
GFileStorage.prototype.save = function (url, data, binary, done) {
  var location = this._urlToPath(url);
  window.gravit.fs.save(location, data, binary).then(
    function (success) {
      if (!success) {
        console.error("save failed: " + location);
        return;
      }
      if (done) {
        done(this._extractFileName(location));
      }
    }.bind(this),
  );
};

/** @override */
GFileStorage.prototype.resolveUrl = function (url, resolved) {
  // Our file:/// protocol is understandable by the browser
  // so just use the source url
  resolved(url);
};

/**
 * Prompt for a directory and report it as a file:// url with a trailing slash
 * @param {String} reference a reference url to set the working directory from
 * @param {Function} done called with the directory url
 * @private
 */
GFileStorage.prototype._directoryPrompt = function (reference, done) {
  window.gravit.dialog.openDirectory().then(
    function (directory) {
      if (directory) {
        done(this._toDirectoryUrl(directory));
      }
    }.bind(this),
  );
};

/**
 * Convert the dialog filters into electron filters
 * @param {Array<String>|String} extensions may be null for any file
 * @return {Array<{name: String, extensions: Array<String>}>|undefined}
 * @private
 */
GFileStorage.prototype._filters = function (extensions) {
  if (!extensions) {
    return undefined;
  }

  var list = Array.isArray(extensions) ? extensions : [extensions];
  var normalized = [];
  for (var i = 0; i < list.length; ++i) {
    var extension = String(list[i]).replace(/^\./, "").toLowerCase();
    if (extension) {
      normalized.push(extension);
    }
  }

  if (normalized.length === 0) {
    return undefined;
  }

  return [{ name: "Files", extensions: normalized }];
};

/**
 * Extract the directory of a file:// reference url or null
 * @param {String} reference may be null
 * @return {String} directory path with trailing slash or null
 * @private
 */
GFileStorage.prototype._workingDirectory = function (reference) {
  if (!reference) {
    return null;
  }
  var location = this._urlToPath(reference);
  var lastSlash = location.lastIndexOf("/");
  if (lastSlash >= 0) {
    return location.substring(0, lastSlash + 1);
  }
  return null;
};

/**
 * Convert an absolute filesystem path into a file:// url
 * @param {String} path
 * @return {String}
 * @private
 */
GFileStorage.prototype._toUrl = function (path) {
  return this.getProtocol() + "://" + path.replace(/\\/g, "/");
};

/**
 * Convert a directory path into a file:// url with a trailing slash
 * @param {String} path
 * @return {String}
 * @private
 */
GFileStorage.prototype._toDirectoryUrl = function (path) {
  var location = path.replace(/\\/g, "/");
  if (location.charAt(location.length - 1) !== "/") {
    location += "/";
  }
  return this.getProtocol() + "://" + location;
};

/**
 * Convert a file:// url into an absolute filesystem path
 * @param {String} url
 * @return {String}
 * @private
 */
GFileStorage.prototype._urlToPath = function (url) {
  var prefix = this.getProtocol() + "://";
  var location = url.indexOf(prefix) === 0 ? url.substring(prefix.length) : url;
  // On windows, file://C:/... keeps its drive letter without a leading slash
  location = location.replace(/^\/([A-Za-z]:)/, "$1");
  return location;
};

/**
 * @param {String} path
 * @return {String}
 * @private
 */
GFileStorage.prototype._extractFileName = function (path) {
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash < 0) {
    lastSlash = path.lastIndexOf("\\");
  }
  if (lastSlash >= 0) {
    var lastDot = path.lastIndexOf(".");
    if (lastDot > 0) {
      return path.substr(lastSlash + 1, lastDot - lastSlash - 1);
    } else {
      return path.substr(lastSlash + 1);
    }
  }
};
