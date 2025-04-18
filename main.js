const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const log = require("electron-log");
const { v4: uuidv4 } = require("uuid");
const createVideo = require("./src/ffmpeg-handler");

let win;

function createWindow() {
	win = new BrowserWindow({
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

ipcMain.handle("select-folder", async () => {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	if (result.canceled) return null;
	return result.filePaths[0];
});

function calculatePercent(timeMark, totalDuration) {
	const parts = timeMark.split(":").map(Number.parseFloat);
	if (parts.length !== 3) return 0;
	const [hours, minutes, seconds] = parts;
	const currentSeconds = hours * 3600 + minutes * 60 + seconds;
	return Math.min((currentSeconds / totalDuration) * 100, 100);
}

ipcMain.handle(
	"create-video",
	async (
		_,
		{ imageBuffer, audioBuffer, imageName, audioName, resolution, destination },
	) => {
		try {
			const tempDir = os.tmpdir();
			const imagePath = path.join(tempDir, `${uuidv4()}-${imageName}`);
			const audioPath = path.join(tempDir, `${uuidv4()}-${audioName}`);

			fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
			fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

			const onProgress = (progress, totalDuration) => {
				const percent = calculatePercent(progress.timemark, totalDuration);
				win.webContents.send("video-progress", percent);
			};

			const output = await createVideo({
				imagePath,
				audioPath,
				resolution,
				audioName,
				destination,
				onProgress,
			});

			fs.unlinkSync(imagePath);
			fs.unlinkSync(audioPath);

			return { success: true, output };
		} catch (e) {
			log.error("create-video error:", e);
			return { success: false, error: e.message };
		}
	},
);
