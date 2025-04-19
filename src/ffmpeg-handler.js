const path = require("node:path");
const fs = require("node:fs");
const { app } = require("electron");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const ffmpeg = require("fluent-ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");

// Set paths
let ffmpegPath = require("ffmpeg-static");
let ffprobePath = ffprobeInstaller.path;
if (app.isPackaged) {
	ffmpegPath = path.join(process.resourcesPath, "ffmpeg", "ffmpeg.exe");
	ffprobePath = path.join(process.resourcesPath, "ffprobe", "ffprobe.exe");
}
// Set paths globally
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function decideOutputPath(outputDir, fileName) {
	let outputPath = path.join(outputDir, `${fileName}.mp4`);
	let copy_number = 0;
	while (fs.existsSync(outputPath)) {
		copy_number++;
		outputPath = path.join(outputDir, `${fileName} (${copy_number}).mp4`);
	}
	return outputPath;
}

function createVideo({
	imagePath,
	audioPath,
	resolution,
	audioName,
	destination,
	onProgress,
}) {
	return new Promise((resolve, reject) => {
		try {
			getAudioDurationInSeconds(audioPath, ffprobePath).then((duration) => {
				const outputDir = destination || app.getPath("desktop");
				const baseName = audioName.replace(/\.[^/.]+$/, "");
				const outputPath = decideOutputPath(outputDir, baseName);

				ffmpeg()
					.input(imagePath)
					.inputOptions(["-loop 1"])
					.input(audioPath)
					.videoCodec("libx264")
					.audioCodec("aac")
					.audioBitrate("320k")
					.outputOptions([
						"-tune stillimage",
						"-pix_fmt yuv420p",
						"-movflags +faststart",
					])
					.duration(duration)
					.size(resolution)
					.save(outputPath)
					.on("end", () => resolve(outputPath))
					.on("error", reject)
					.on("progress", (progress) =>
						onProgress(progress, duration, outputPath),
					);
			});
		} catch (err) {
			console.error("createVideo crashed:", err);
			reject(err); // handle sync errors
		}
	});
}

module.exports = createVideo;
