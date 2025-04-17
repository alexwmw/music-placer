let imagePath = null;
let audioPath = null;

const imageDrop = document.getElementById("image-drop");
const audioDrop = document.getElementById("audio-drop");
const ytBtn = document.getElementById("yt-btn");
const sqBtn = document.getElementById("sq-btn");

function enableButtons() {
	if (imagePath && audioPath) {
		ytBtn.disabled = false;
		sqBtn.disabled = false;
	}
}

function setupDropZone(el, type, callback) {
	el.ondragover = (e) => {
		e.preventDefault();
		el.style.borderColor = "green";
	};
	el.ondragleave = () => {
		el.style.borderColor = "#ccc";
	};
	el.ondrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (type === "image" && /image\/.*/.test(file.type)) {
			imagePath = file.path;
			el.textContent = `Image loaded: ${file.name}`;
		} else if (type === "audio" && /audio\/.*/.test(file.type)) {
			audioPath = file.path;
			el.textContent = `Audio loaded: ${file.name}`;
		} else {
			alert(`Please drop a valid ${type} file.`);
		}
		el.style.borderColor = "#ccc";
		enableButtons();
	};
}

setupDropZone(imageDrop, "image");
setupDropZone(audioDrop, "audio");

ytBtn.onclick = async () => {
	const res = await window.electronAPI.createVideo({
		imagePath,
		audioPath,
		resolution: "480x360",
	});
	alert(
		res.success ? `Video created at: ${res.output}` : `Error: ${res.error}`,
	);
};

sqBtn.onclick = async () => {
	const res = await window.electronAPI.createVideo({
		imagePath,
		audioPath,
		resolution: "480x480",
	});
	alert(
		res.success ? `Video created at: ${res.output}` : `Error: ${res.error}`,
	);
};
