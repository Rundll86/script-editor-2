import { app, BrowserWindow, Menu } from "type-electron";
import path from "path";
import process from "process";
app.addListener("window-all-closed", () => app.quit());
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        title: "Loading",
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.resolve("generated", "favicon.ico")
    });
    if (process.env.isPackaged) {
        mainWindow.loadFile(path.resolve("generated", "index.html"));
    } else {
        mainWindow.loadURL("http://localhost:25565");
    }
    mainWindow.webContents.openDevTools();
    Menu.setApplicationMenu(null);
});