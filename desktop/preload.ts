import { ipcRenderer, contextBridge } from "type-electron";
window.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
        ipcRenderer.send("toggleDevTools");
    } else if (e.key === "F5") {
        window.location.reload();
    }
});
contextBridge.exposeInMainWorld("isDesktop", true);