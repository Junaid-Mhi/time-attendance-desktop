const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

// Linux: avoid Wayland/Vulkan issues in packaged builds
if (process.platform === "linux") {
  app.commandLine.appendSwitch("ozone-platform", "x11");
  app.commandLine.appendSwitch("disable-features", "Vulkan");

  if (!app.isPackaged) {
    app.commandLine.appendSwitch("no-sandbox");
    app.commandLine.appendSwitch("disable-dev-shm-usage");
  }
}

app.disableHardwareAcceleration();  // 👈 add this


const store = new Store({
  name: "time-attendance",
  encryptionKey: "ta-desktop-encryption-key-change-me",
  clearInvalidConfig: true,   // 👈 critical: survive corrupted configs
});

let mainWindow = null;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true, 
    icon: path.join(__dirname, "../build/icons/512x512.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle("store:get-token", () => store.get("token", null));
  ipcMain.handle("store:set-token", (_e, t) => { store.set("token", t); return true; });
  ipcMain.handle("store:clear-token", () => { store.delete("token"); return true; });
  ipcMain.handle("store:get-user", () => store.get("user", null));
  ipcMain.handle("store:set-user", (_e, u) => { store.set("user", u); return true; });
  ipcMain.handle('app:hard-reload', () => {
        if (mainWindow) {
            mainWindow.webContents.reloadIgnoringCache()
        }
        return true
    });
  ipcMain.handle("store:get-saved-emails", () => store.get("saved_emails", []));
  ipcMain.handle("store:add-saved-email", (_e, email) => {
    if (!email || typeof email !== "string") return false;

    const normalized = email.trim().toLowerCase();
    if (!normalized) return false;

    let emails = store.get("saved_emails", []);
    emails = emails.filter((e) => e.toLowerCase() !== normalized);
    emails.unshift(normalized);
    emails = emails.slice(0, 5);

    store.set("saved_emails", emails);
    return true;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});