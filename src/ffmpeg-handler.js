const path = require("node:path");
const { app } = require("electron");
const isDev = !app.isPackaged;
const ffmpegPath = isDev
	? require("ffmpeg-static")
	: path.join(process.resourcesPath, "ffmpeg.exe");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");

ffmpeg.setFfmpegPath(ffmpegPath);

console.log("FFmpeg path:", ffmpegPath);

function sanitizeFileName(name) {
	return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function createVideo({ imagePath, audioPath, resolution, audioName }) {
	return new Promise((resolve, reject) => {
		const outputDir = app.getPath("desktop");
		const baseName = sanitizeFileName(audioName.replace(/\.[^/.]+$/, ""));
		const outputPath = path.join(outputDir, `${baseName}-${uuidv4()}.mp4`);

		ffmpeg()
			.input(imagePath)
			.loop(1)
			.input(audioPath)
			.videoCodec("libx264")
			.audioCodec("aac")
			.audioBitrate("320k")
			.outputOptions("-tune stillimage")
			.outputOptions("-shortest")
			.size(resolution)
			.save(outputPath)
			.on("end", () => resolve(outputPath))
			.on("error", reject);
	});
}

module.exports = createVideo;
