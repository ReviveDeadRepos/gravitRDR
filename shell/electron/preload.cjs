const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gravit", {
  isDev: Boolean(process.env.VITE_DEV_SERVER_URL),
  platform: process.platform,
  menu: {
    add(message) {
      ipcRenderer.send("menu:add", message);
    },
    update(message) {
      ipcRenderer.send("menu:update", message);
    },
    remove(message) {
      ipcRenderer.send("menu:remove", message);
    },
    onClick(callback) {
      ipcRenderer.on("menu:click", (_event, id) => callback(id));
    },
    onWillShow(callback) {
      ipcRenderer.on("menu:will-show", (_event, id) => callback(id));
    },
  },
  dialog: {
    open(options) {
      return ipcRenderer.invoke("dialog:open", options);
    },
    save(options) {
      return ipcRenderer.invoke("dialog:save", options);
    },
    openDirectory() {
      return ipcRenderer.invoke("dialog:open-directory");
    },
  },
  fs: {
    load(location, binary) {
      return ipcRenderer.invoke("fs:load", location, binary);
    },
    save(location, data, binary) {
      return ipcRenderer.invoke("fs:save", location, data, binary);
    },
  },
  pendingOpens() {
    return ipcRenderer.invoke("app:pending-opens");
  },
  onOpenFile(callback) {
    ipcRenderer.on("app:open-file", (_event, filePath) => callback(filePath));
  },
});
