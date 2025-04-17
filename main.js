const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const createVideo = require("./src/ffmpeg-handler");

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "src/preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});
	win.loadFile("public/index.html");
}

app.whenReady().then(createWindow);

ipcMain.handle(
	"create-video",
	async (_, { imagePath, audioPath, resolution }) => {
		try {
			const output = await createVideo(imagePath, audioPath, resolution);
			return { success: true, output };
		} catch (e) {
			return { success: false, error: e.message };
		}
	},
);
