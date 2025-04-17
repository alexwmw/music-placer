let imageFile = null;
let audioFile = null;

const imageDrop = document.getElementById("image-drop");
const audioDrop = document.getElementById("audio-drop");
const ytBtn = document.getElementById("yt-btn");
const sqBtn = document.getElementById("sq-btn");

function enableButtons() {
	if (imageFile && audioFile) {
		ytBtn.disabled = false;
		sqBtn.disabled = false;
	}
}

function setupDropZone(el, type) {
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
			imageFile = file;
			el.textContent = `Image loaded: ${file.name}`;
		} else if (type === "audio" && /audio\/.*/.test(file.type)) {
			audioFile = file;
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

async function fileToArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	});
}

async function handleCreate(resolution) {
	try {
		const imageBuffer = await fileToArrayBuffer(imageFile);
		const audioBuffer = await fileToArrayBuffer(audioFile);

		const res = await window.electronAPI.createVideo({
			imageBuffer,
			audioBuffer,
			imageName: imageFile.name,
			audioName: audioFile.name,
			resolution,
		});

		alert(
			res.success ? `Video created at: ${res.output}` : `Error: ${res.error}`,
		);
	} catch (err) {
		alert(`Failed to create video: ${err.message}`);
	}
}

ytBtn.onclick = () => handleCreate("480x360");
sqBtn.onclick = () => handleCreate("480x480");
