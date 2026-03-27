import "./styles.css";

const video = document.querySelector("#video");
const freezeCanvas = document.querySelector("#freezeCanvas");
const freezeCtx = freezeCanvas.getContext("2d");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const startButtonLabel = document.querySelector("#startButtonLabel");
const captureButton = document.querySelector("#captureButton");
const downloadButton = document.querySelector("#downloadButton");
const newPhotoButton = document.querySelector("#newPhotoButton");
const saveButton = document.querySelector("#saveButton");
const telegramButton = document.querySelector("#telegramButton");
const whatsappButton = document.querySelector("#whatsappButton");
const shareActions = document.querySelector("#shareActions");
const flipButton = document.querySelector("#flipButton");
const permissionButton = document.querySelector("#permissionButton");
const permissionLabel = document.querySelector("#permissionLabel");
const mobileStartButton = document.querySelector("#mobileStartButton");
const mobileStartLabel = document.querySelector("#mobileStartLabel");
const mobileCaptureButton = document.querySelector("#mobileCaptureButton");
const mobileFlipButton = document.querySelector("#mobileFlipButton");
const message = document.querySelector("#message");
const cameraStatus = document.querySelector("#cameraStatus");
const faceCount = document.querySelector("#faceCount");
const cameraOverlay = document.querySelector("#cameraOverlay");
const appShell = document.querySelector(".app-shell");
const baseUrl = import.meta.env.BASE_URL;

let stream;
let modelPromise;
let currentFacingMode = "user";
let audioContext;

function setShareActionsVisible(visible) {
  shareActions.hidden = !visible;
  downloadButton.disabled = !visible;
  saveButton.disabled = !visible;
  telegramButton.disabled = !visible;
  whatsappButton.disabled = !visible;
}

function setResultMode(active) {
  appShell.classList.toggle("is-result-mode", active);
}

function setFreezeFrameVisible(visible) {
  freezeCanvas.hidden = !visible;
}

function setButtonState(button, active) {
  button.classList.toggle("status-on", active);
  button.classList.toggle("status-off", !active);
}

function updateCameraUi(active) {
  setButtonState(permissionButton, active);
  setButtonState(startButton, active);
  setButtonState(mobileStartButton, active);

  permissionLabel.textContent = active ? "Camera attiva" : "Attiva fotocamera";
  startButtonLabel.textContent = active ? "Camera attiva" : "Avvia camera";
  mobileStartLabel.textContent = active ? "Attiva" : "Avvia";
}

function stopStream() {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
  stream = undefined;
  updateCameraUi(false);
  setFreezeFrameVisible(false);
}

function syncCaptureControls(enabled) {
  captureButton.disabled = !enabled;
  mobileCaptureButton.disabled = !enabled;
}

function syncFlipControls(enabled) {
  flipButton.disabled = !enabled;
  mobileFlipButton.disabled = !enabled;
}

function updateCameraModeLabels() {
  const usingFrontCamera = currentFacingMode === "user";
  const label = usingFrontCamera ? "Camera posteriore" : "Camera frontale";

  flipButton.textContent = label;
  mobileFlipButton.textContent = usingFrontCamera ? "Retro" : "Selfie";
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register(`${baseUrl}sw.js`, {
      scope: baseUrl,
    });
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}

async function ensureModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      const blazeface = await import("@tensorflow-models/blazeface");

      await tf.ready();
      return blazeface.load();
    })();
  }

  return modelPromise;
}

function playCaptureSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtx) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(1200, now);
  oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.06);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.09);
}

function freezePreviewFrame() {
  freezeCanvas.width = video.videoWidth;
  freezeCanvas.height = video.videoHeight;
  freezeCtx.drawImage(video, 0, 0, freezeCanvas.width, freezeCanvas.height);
  setFreezeFrameVisible(true);
}

async function startCamera(forceRestart = false) {
  if (stream && !forceRestart) {
    return;
  }

  if (forceRestart) {
    stopStream();
  }

  syncCaptureControls(false);
  syncFlipControls(false);
  setResultMode(false);
  setShareActionsVisible(false);
  message.textContent = "Richiesta accesso alla camera in corso...";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    await video.play();
    syncCaptureControls(true);
    syncFlipControls(true);
    updateCameraUi(true);
    updateCameraModeLabels();
    cameraStatus.textContent =
      currentFacingMode === "user" ? "Camera frontale attiva" : "Camera posteriore attiva";
    cameraOverlay.hidden = true;
    setFreezeFrameVisible(false);
    message.textContent = "Camera pronta. Puoi scattare la foto.";
    video.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error(error);
    stopStream();
    syncCaptureControls(false);
    syncFlipControls(false);
    cameraStatus.textContent = "Accesso negato";
    message.textContent =
      "Impossibile accedere alla camera. Verifica i permessi del browser e usa HTTPS o localhost.";
  }
}

function clampRect(x, y, width, height) {
  const safeX = Math.max(0, Math.floor(x));
  const safeY = Math.max(0, Math.floor(y));
  const safeWidth = Math.min(canvas.width - safeX, Math.ceil(width));
  const safeHeight = Math.min(canvas.height - safeY, Math.ceil(height));

  return {
    x: safeX,
    y: safeY,
    width: Math.max(0, safeWidth),
    height: Math.max(0, safeHeight),
  };
}

function pixelateRegion(rect, pixelSize = 14) {
  if (!rect.width || !rect.height) {
    return;
  }

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const scaledWidth = Math.max(1, Math.round(rect.width / pixelSize));
  const scaledHeight = Math.max(1, Math.round(rect.height / pixelSize));

  tempCanvas.width = scaledWidth;
  tempCanvas.height = scaledHeight;

  tempCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  tempCtx.drawImage(
    canvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    scaledWidth,
    scaledHeight,
  );

  ctx.drawImage(
    tempCanvas,
    0,
    0,
    scaledWidth,
    scaledHeight,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );
}

function drawEyeBar(landmarks, faceRect) {
  if (!Array.isArray(landmarks) || landmarks.length < 2) {
    return;
  }

  const [firstEye, secondEye] = landmarks;

  if (!Array.isArray(firstEye) || !Array.isArray(secondEye)) {
    return;
  }

  const eyeCenterX = (firstEye[0] + secondEye[0]) / 2;
  const eyeCenterY = (firstEye[1] + secondEye[1]) / 2;
  const eyeDistance = Math.hypot(secondEye[0] - firstEye[0], secondEye[1] - firstEye[1]);
  const barWidth = Math.max(faceRect.width * 0.6, eyeDistance * 1.9);
  const barHeight = Math.max(faceRect.height * 0.16, 18);
  const barRect = clampRect(
    eyeCenterX - barWidth / 2,
    eyeCenterY - barHeight / 2,
    barWidth,
    barHeight,
  );

  if (!barRect.width || !barRect.height) {
    return;
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(barRect.x, barRect.y, barRect.width, barRect.height);
}

function triggerCaptureFeedback() {
  if (!("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(35);
}

async function captureAndAnonymize() {
  if (!stream) {
    await startCamera();
  }

  syncCaptureControls(false);
  flipButton.disabled = true;
  mobileFlipButton.disabled = true;
  setShareActionsVisible(false);
  message.textContent = "Caricamento del modello e anonimizzazione in corso...";

  try {
    const model = await ensureModel();

    freezePreviewFrame();
    playCaptureSound();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    triggerCaptureFeedback();

    const predictions = await model.estimateFaces(video, false);

    predictions.forEach((prediction) => {
      const [x1, y1] = prediction.topLeft;
      const [x2, y2] = prediction.bottomRight;
      const width = x2 - x1;
      const height = y2 - y1;
      const marginX = width * 0.18;
      const marginY = height * 0.22;
      const rect = clampRect(
        x1 - marginX,
        y1 - marginY,
        width + marginX * 2,
        height + marginY * 2,
      );

      pixelateRegion(rect, 18);
      drawEyeBar(prediction.landmarks, rect);
    });

    faceCount.textContent = `Volti rilevati: ${predictions.length}`;
    setResultMode(true);
    setShareActionsVisible(true);
    message.textContent =
      predictions.length > 0
        ? "Foto anonimizzata pronta per il salvataggio."
        : "Nessun volto rilevato. L'immagine è comunque pronta per il salvataggio.";
  } catch (error) {
    console.error(error);
    setFreezeFrameVisible(false);
    message.textContent =
      "Si è verificato un errore durante l'elaborazione. Riprova con una nuova foto.";
  } finally {
    syncCaptureControls(Boolean(stream));
    syncFlipControls(Boolean(stream));
  }
}

async function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  updateCameraModeLabels();

  await startCamera(true);
}

function downloadImage() {
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  link.href = canvas.toDataURL("image/png");
  link.download = `anonymous-pics-${timestamp}.png`;
  link.click();
}

function resetApp() {
  stopStream();
  setResultMode(false);
  setShareActionsVisible(false);
  syncCaptureControls(false);
  syncFlipControls(false);
  cameraOverlay.hidden = false;
  cameraStatus.textContent = "Camera non avviata";
  faceCount.textContent = "Volti rilevati: 0";
  message.textContent = "L’immagine anonimizzata comparirà qui dopo lo scatto.";
  canvas.width = 0;
  canvas.height = 0;
  freezeCanvas.width = 0;
  freezeCanvas.height = 0;
  setFreezeFrameVisible(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function canvasToFile() {
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Image export failed");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return new File([blob], `anonymous-pics-${timestamp}.png`, {
    type: "image/png",
  });
}

async function shareImage(target) {
  try {
    const file = await canvasToFile();
    const sharePayload = {
      files: [file],
      title: "Anonymous Pics",
      text:
        target === "telegram"
          ? "Invia la foto anonimizzata con Telegram."
          : "Invia la foto anonimizzata con WhatsApp.",
    };

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share(sharePayload);
      return;
    }

    message.textContent =
      "La condivisione diretta del file non e supportata qui. Usa 'Salva in galleria' e condividi la foto dall'app.";
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }

    console.error(error);
    message.textContent =
      "Condivisione non riuscita. Salva prima la foto e inviala manualmente.";
  }
}

startButton.addEventListener("click", () => startCamera(true));
captureButton.addEventListener("click", captureAndAnonymize);
downloadButton.addEventListener("click", downloadImage);
newPhotoButton.addEventListener("click", resetApp);
saveButton.addEventListener("click", downloadImage);
telegramButton.addEventListener("click", () => shareImage("telegram"));
whatsappButton.addEventListener("click", () => shareImage("whatsapp"));
flipButton.addEventListener("click", switchCamera);
permissionButton.addEventListener("click", () => startCamera(true));
mobileStartButton.addEventListener("click", () => startCamera(true));
mobileCaptureButton.addEventListener("click", captureAndAnonymize);
mobileFlipButton.addEventListener("click", switchCamera);
updateCameraUi(false);
updateCameraModeLabels();
setResultMode(false);
setShareActionsVisible(false);
registerServiceWorker();

window.addEventListener("beforeunload", () => {
  stopStream();
});
