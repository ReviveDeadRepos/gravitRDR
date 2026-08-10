// Electron main process for the GravitRDR desktop shell
const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const APP_NAME = "GravitRDR";

let mainWindow = null;

// Files handed to the app before the renderer finished booting (startup argv
// and macOS `open-file` events).
let pendingOpens = [];

// Native menu

const menuItems = {};
const topLevelIds = [];

let menuDirty = false;

const sendToRenderer = (channel, payload) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
};

const scheduleMenuRebuild = () => {
  if (menuDirty) {
    return;
  }
  menuDirty = true;
  setImmediate(() => {
    menuDirty = false;
    rebuildMenu();
  });
};

const menuItemTemplate = (id) => {
  const node = menuItems[id];
  if (!node) {
    return null;
  }
  if (node.type === "separator") {
    return { type: "separator" };
  }
  if (node.type === "menu") {
    const children = (node.children || [])
      .map(menuItemTemplate)
      .filter(Boolean);
    const submenu = Menu.buildFromTemplate(children);
    submenu.on("menu-will-show", () => {
      sendToRenderer("menu:will-show", id);
    });
    return { label: node.title, submenu };
  }
  if (node.type === "item") {
    return {
      label: node.title,
      type: node.checkable ? "checkbox" : "normal",
      checked: !!node.checked,
      enabled: node.enabled !== false,
      accelerator: node.accelerator || undefined,
      click: () => {
        sendToRenderer("menu:click", id);
      },
    };
  }
  return null;
};

const menuTemplate = () => {
  const template = [];
  if (process.platform === "darwin") {
    // Standard macOS application menu. The app's own menus follow below.
    template.push({
      label: APP_NAME,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }
  for (const id of topLevelIds) {
    const item = menuItemTemplate(id);
    if (item) {
      template.push(item);
    }
  }
  return template;
};

const rebuildMenu = () => {
  if (!mainWindow) {
    return;
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate()));
};

ipcMain.on("menu:add", (event, message) => {
  const node = {
    id: message.id,
    parentId: message.parentId || null,
    type: message.type,
    title: message.title || "",
    checkable: !!message.checkable,
    accelerator: message.accelerator || null,
    enabled: true,
    checked: false,
    children: [],
  };
  menuItems[node.id] = node;
  if (node.parentId) {
    const parent = menuItems[node.parentId];
    if (parent) {
      parent.children.push(node.id);
    }
  } else {
    topLevelIds.push(node.id);
  }
  scheduleMenuRebuild();
});

ipcMain.on("menu:update", (event, message) => {
  const node = menuItems[message.id];
  if (!node) {
    return;
  }
  if (typeof message.title === "string") {
    node.title = message.title;
  }
  if (typeof message.enabled === "boolean") {
    node.enabled = message.enabled;
  }
  if (typeof message.checked === "boolean") {
    node.checked = message.checked;
  }
  scheduleMenuRebuild();
});

ipcMain.on("menu:remove", (event, message) => {
  const node = menuItems[message.id];
  if (!node) {
    return;
  }
  if (node.parentId) {
    const parent = menuItems[node.parentId];
    if (parent) {
      parent.children = (parent.children || []).filter(
        (childId) => childId !== message.id,
      );
    }
  } else {
    topLevelIds.splice(topLevelIds.indexOf(message.id), 1);
  }
  delete menuItems[message.id];
  scheduleMenuRebuild();
});

// Dialogs
ipcMain.handle("dialog:open", async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    defaultPath:
      options && options.defaultPath ? options.defaultPath : undefined,
    filters: options && options.filters ? options.filters : undefined,
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle("dialog:save", async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath:
      options && options.defaultPath ? options.defaultPath : undefined,
    filters: options && options.filters ? options.filters : undefined,
  });
  if (result.canceled || !result.filePath) {
    return null;
  }
  return result.filePath;
});

ipcMain.handle("dialog:open-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// File I/O
ipcMain.handle("fs:load", (event, location, binary) => {
  try {
    return fs.readFileSync(location, binary ? null : "utf8");
  } catch (error) {
    console.error("fs:load failed:", location, error);
    return null;
  }
});

ipcMain.handle("fs:save", (event, location, data, binary) => {
  try {
    fs.writeFileSync(
      location,
      binary ? Buffer.from(data) : data,
      binary ? null : "utf8",
    );
    return true;
  } catch (error) {
    console.error("fs:save failed:", location, error);
    return false;
  }
});

// Window state
const stateFilePath = () =>
  path.join(app.getPath("userData"), "window-state.json");

const loadWindowState = () => {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath(), "utf8"));
  } catch (error) {
    return null;
  }
};

const saveWindowState = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  const bounds = mainWindow.getNormalBounds();
  const state = {
    mode: mainWindow.isMaximized() ? "maximized" : "normal",
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  try {
    fs.writeFileSync(stateFilePath(), JSON.stringify(state));
  } catch (error) {
    console.error("save window state failed:", error);
  }
};

// Window
const createWindow = () => {
  const previousState = loadWindowState();

  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: previousState && previousState.width ? previousState.width : 1200,
    height: previousState && previousState.height ? previousState.height : 800,
    x:
      previousState && previousState.mode !== "maximized"
        ? previousState.x
        : undefined,
    y:
      previousState && previousState.mode !== "maximized"
        ? previousState.y
        : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // The preload exposes `process.env` to the bridge; the page itself
      // still has no Node access thanks to contextIsolation.
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    if (previousState && previousState.mode === "maximized") {
      mainWindow.maximize();
    }
    mainWindow.show();
  });

  let stateTimer = null;
  const debouncedSaveWindowState = () => {
    clearTimeout(stateTimer);
    stateTimer = setTimeout(saveWindowState, 500);
  };
  mainWindow.on("resize", debouncedSaveWindowState);
  mainWindow.on("move", debouncedSaveWindowState);
  mainWindow.on("close", saveWindowState);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        "did-fail-load:",
        errorCode,
        errorDescription,
        validatedURL,
      );
    },
  );

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.error("render-process-gone:", JSON.stringify(details));
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(new URL("desktop.html", devServerUrl).toString());
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../../dist/browser/desktop.html"),
    );
  }
};

// App lifecycle
// Must be registered inside will-finish-launching to receive macOS open-file.
app.on("will-finish-launching", () => {
  app.on("open-file", (event, filePath) => {
    event.preventDefault();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("app:open-file", filePath);
    } else {
      pendingOpens.push(filePath);
    }
  });
});

app.whenReady().then(() => {
  // In dev the first two argv entries are the Electron binary and the app
  // path; in a packaged app only the app path precedes user arguments.
  const argvFiles = process.argv
    .slice(app.isPackaged ? 1 : 2)
    .filter((arg) => arg.charAt(0) !== "-" && fs.existsSync(arg));
  pendingOpens = pendingOpens.concat(argvFiles);

  createWindow();
  rebuildMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("app:pending-opens", () => {
  const files = pendingOpens.slice();
  pendingOpens = [];
  return files;
});
