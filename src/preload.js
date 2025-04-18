const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	createVideo: (data) => ipcRenderer.invoke("create-video", data),
	selectFolder: () => ipcRenderer.invoke("select-folder"),
	onVideoProgress: (callback) =>
		ipcRenderer.on("video-progress", (_, data) => callback(data)),
});
