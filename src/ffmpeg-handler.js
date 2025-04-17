const path = require("node:path");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { app } = require("electron");
const { v4: uuidv4 } = require("uuid");

ffmpeg.setFfmpegPath(ffmpegPath);

function createVideo(imagePath, audioPath, resolution) {
	return new Promise((resolve, reject) => {
		const outputDir = app.getPath("desktop");
		const outputPath = path.join(outputDir, `video-${uuidv4()}.mp4`);

		ffmpeg()
			.input(imagePath)
			.loop(1)
			.input(audioPath)
			.videoCodec("libx264")
			.audioCodec("aac")
			.outputOptions("-tune stillimage")
			.outputOptions("-shortest")
			.size(resolution)
			.save(outputPath)
			.on("end", () => resolve(outputPath))
			.on("error", reject);
	});
}

module.exports = createVideo;
