import { app, BrowserWindow, ipcMain, Menu } from "type-electron";
import process from "process";
import { isDevelopment, resolveFilePath } from "./utils";
app.addListener("window-all-closed", () => app.quit());
app.whenReady().then(() => {
    if (!isDevelopment) {
        process.chdir("./generated")
    }
    const mainWindow = new BrowserWindow({
        title: "Loading",
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            preload: resolveFilePath("preload.js")
        },
        icon: resolveFilePath("favicon.ico")
    });
    if (isDevelopment) {
        mainWindow.loadURL("http://localhost:25565");
    } else {
        mainWindow.loadFile(resolveFilePath("index.html"));
    }
    Menu.setApplicationMenu(null);
    ipcMain.on("toggleDevTools", () => {
        mainWindow.webContents.toggleDevTools();
    });
});