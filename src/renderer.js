let imageFile = null;
let audioFile = null;
let destination = localStorage.getItem("destination");
const percentElem = document.getElementById("percent");
const imageDrop = document.getElementById("image-drop");
const audioDrop = document.getElementById("audio-drop");
const ytBtn = document.getElementById("yt-btn");
const sqBtn = document.getElementById("sq-btn");
const progressbar = document.getElementById("progressbar");
const chooseFolderBtn = document.getElementById("choose-folder");
const chooseFolderContainer = document.getElementById(
	"choose-folder-container",
);
const progressMessage = document.getElementById("progress-message");
const destinationInput = document.getElementById("destination");
destinationInput.value = destination ?? "";

async function cropImage(file, aspectRatio) {
	const arrayBuffer = await fileToArrayBuffer(file);
	const blob = new Blob([arrayBuffer]);
	const imageBitmap = await createImageBitmap(blob);

	const { width, height } = imageBitmap;
	const inputAspect = width / height;
	let cropWidth = width;
	let cropHeight = height;

	if (inputAspect > aspectRatio) {
		// Image is too wide
		cropWidth = height * aspectRatio;
	} else {
		// Image is too tall
		cropHeight = width / aspectRatio;
	}

	const cropX = (width - cropWidth) / 2;
	const cropY = (height - cropHeight) / 2;

	// Create canvas with cropped dimensions
	const canvas = document.createElement("canvas");
	canvas.width = cropWidth;
	canvas.height = cropHeight;

	const ctx = canvas.getContext("2d");
	ctx.drawImage(
		imageBitmap,
		cropX,
		cropY,
		cropWidth,
		cropHeight,
		0,
		0,
		cropWidth,
		cropHeight,
	);

	return await new Promise((resolve) => {
		canvas.toBlob((blob) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.readAsArrayBuffer(blob);
		}, "image/png");
	});
}

function enableButtons() {
	if (imageFile && audioFile && destination) {
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
			el.classList.add("checked");
			el.innerHTML = `<i class="fas fa-image"><i class="fas fa-circle-check"></i></i><span>Image loaded: ${file.name}</span>`;
		} else if (type === "audio" && /audio\/.*/.test(file.type)) {
			audioFile = file;
			el.classList.add("checked");
			el.innerHTML = `<i class="fas fa-music"><i class="fas fa-circle-check"></i></i><span>Audio loaded: ${file.name}</span>`;
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

// Choose new folder
chooseFolderBtn.onclick = async () => {
	const selected = await window.electronAPI.selectFolder(); // You’ll add this in preload
	if (selected) {
		destination = selected;
		destinationInput.value = selected;
		localStorage.setItem("destination", selected);
	}
	enableButtons();
};

async function handleCreate(resolution, aspectRatio) {
	try {
		showProgressBar();
		const croppedImageBuffer = await cropImage(imageFile, aspectRatio);
		const audioBuffer = await fileToArrayBuffer(audioFile);

		const res = await window.electronAPI.createVideo({
			imageBuffer: croppedImageBuffer,
			audioBuffer,
			imageName: imageFile.name,
			audioName: audioFile.name,
			resolution,
			destination,
		});
		alert(
			res.success
				? `♡ ❛‿❛ Video created at: ${res.output}`
				: `Error: ${res.error}`,
		);
	} catch (err) {
		alert(`Failed to create video: ${err.message}`);
	} finally {
		hideProgressBar();
	}
}

ytBtn.onclick = () => handleCreate("480x360", 4 / 3);
sqBtn.onclick = () => handleCreate("480x480", 1);

function showProgressBar() {
	progressbar.classList.remove("hidden");
	progressMessage.classList.remove("hidden");
	ytBtn.classList.add("hidden");
	sqBtn.classList.add("hidden");
	chooseFolderContainer.classList.add("hidden");
	progressMessage.innerHTML = "<b>Initialising...</b>";
}

function hideProgressBar() {
	progressbar.classList.add("hidden");
	progressMessage.classList.add("hidden");
	ytBtn.classList.remove("hidden");
	sqBtn.classList.remove("hidden");
	chooseFolderContainer.classList.remove("hidden");
	percentElem.style.flexBasis = "0";
	percentElem.textContent = "";
	progressMessage.textContent = "";
}

window.electronAPI.onVideoProgress(({ percent, outputPath }) => {
	progressMessage.innerHTML = `<b>Creating video:</b> ${outputPath.split("\\").pop()}`;
	const percent_truncated = Math.max(0, Math.trunc(percent));
	percentElem.style.flexBasis = `${percent_truncated + 1}%`;
	percentElem.textContent = `${percent_truncated + 1}%`;
});
