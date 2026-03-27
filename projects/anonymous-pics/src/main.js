import "./styles.css";

const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const captureButton = document.querySelector("#captureButton");
const downloadButton = document.querySelector("#downloadButton");
const message = document.querySelector("#message");
const cameraStatus = document.querySelector("#cameraStatus");
const faceCount = document.querySelector("#faceCount");
const cameraOverlay = document.querySelector("#cameraOverlay");

let stream;
let modelPromise;

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

async function startCamera() {
  if (stream) {
    return;
  }

  message.textContent = "Richiesta accesso alla camera in corso...";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
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
    captureButton.disabled = false;
    cameraStatus.textContent = "Camera attiva";
    cameraOverlay.hidden = true;
    message.textContent = "Camera pronta. Puoi scattare la foto.";
  } catch (error) {
    console.error(error);
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

async function captureAndAnonymize() {
  if (!stream) {
    await startCamera();
  }

  captureButton.disabled = true;
  downloadButton.disabled = true;
  message.textContent = "Caricamento del modello e anonimizzazione in corso...";

  try {
    const model = await ensureModel();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

      pixelateRegion(rect, 12);
    });

    faceCount.textContent = `Volti rilevati: ${predictions.length}`;
    downloadButton.disabled = false;
    message.textContent =
      predictions.length > 0
        ? "Foto anonimizzata pronta per il salvataggio."
        : "Nessun volto rilevato. L'immagine è comunque pronta per il salvataggio.";
  } catch (error) {
    console.error(error);
    message.textContent =
      "Si è verificato un errore durante l'elaborazione. Riprova con una nuova foto.";
  } finally {
    captureButton.disabled = false;
  }
}

function downloadImage() {
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  link.href = canvas.toDataURL("image/png");
  link.download = `anonymous-pics-${timestamp}.png`;
  link.click();
}

startButton.addEventListener("click", startCamera);
captureButton.addEventListener("click", captureAndAnonymize);
downloadButton.addEventListener("click", downloadImage);

window.addEventListener("beforeunload", () => {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
});
