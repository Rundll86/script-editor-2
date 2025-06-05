import { ipcRenderer, contextBridge } from "type-electron";
window.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
        ipcRenderer.send("toggleDevTools");
    }
});