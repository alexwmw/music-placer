const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	createVideo: (data) => ipcRenderer.invoke("create-video", data),
});
