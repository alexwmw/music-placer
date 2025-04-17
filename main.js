const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { v4: uuidv4 } = require("uuid");
const createVideo = require("./src/ffmpeg-handler");

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		icon: path.join(__dirname, "public/android-chrome-512x512.png"),
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
	async (_, { imageBuffer, audioBuffer, imageName, audioName, resolution }) => {
		try {
			const tempDir = os.tmpdir();
			const imagePath = path.join(tempDir, `${uuidv4()}-${imageName}`);
			const audioPath = path.join(tempDir, `${uuidv4()}-${audioName}`);

			fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
			fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

			const output = await createVideo({
				imagePath,
				audioPath,
				resolution,
				audioName,
			});

			fs.unlinkSync(imagePath);
			fs.unlinkSync(audioPath);

			return { success: true, output };
		} catch (e) {
			return { success: false, error: e.message };
		}
	},
);
