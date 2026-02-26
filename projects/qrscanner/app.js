const APP_VERSION = "1.5.0";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const SCAN_INTERVAL_MS = 220;

const els = {
  video: document.getElementById("video"),
  freezeFrame: document.getElementById("freezeFrame"),
  status: document.getElementById("status"),
  startBtn: document.getElementById("startBtn"),
  rescanBtn: document.getElementById("rescanBtn"),
  torchBtn: document.getElementById("torchBtn"),
  installBtn: document.getElementById("installBtn"),
  resultBox: document.getElementById("resultBox"),
  resultValue: document.getElementById("resultValue"),
  openBtn: document.getElementById("openBtn"),
  copyBtn: document.getElementById("copyBtn"),
  appVersion: document.getElementById("appVersion")
};

const scratchCanvas = document.createElement("canvas");
const scratchCtx = scratchCanvas.getContext("2d", { willReadFrequently: true });
const freezeCanvas = document.createElement("canvas");
const freezeCtx = freezeCanvas.getContext("2d");

let mediaStream = null;
let detector = null;
let isScanning = false;
let scanPaused = false;
let lastScanAt = 0;
let torchEnabled = false;
let deferredInstallPrompt = null;

function setStatus(message, type = "ok") {
  els.status.textContent = message;
  els.status.classList.toggle("warn", type === "warn");
}

function setInstallButtonVisibility(visible) {
  if (!els.installBtn) {
    return;
  }
  els.installBtn.hidden = !visible;
  els.installBtn.disabled = !visible;
}

function isStandalonePwa() {
  const standaloneByDisplayMode =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const standaloneByIosFlag = window.navigator.standalone === true;
  const standaloneByReferrer = document.referrer.startsWith("android-app://");
  return standaloneByDisplayMode || standaloneByIosFlag || standaloneByReferrer;
}

function isProbablyUrl(text) {
  try {
    const value = new URL(text);
    return value.protocol === "https:" || value.protocol === "http:";
  } catch {
    return false;
  }
}

function showResult(value) {
  els.resultValue.textContent = value;
  els.resultBox.classList.add("visible", "highlight");
  els.copyBtn.disabled = false;
  els.openBtn.disabled = !isProbablyUrl(value);
  els.rescanBtn.disabled = false;
}

function clearResult() {
  els.resultValue.textContent = "-";
  els.resultBox.classList.remove("visible", "highlight");
  els.copyBtn.disabled = true;
  els.openBtn.disabled = true;
}

function clearFreezeFrame() {
  if (!els.freezeFrame) {
    return;
  }
  els.freezeFrame.classList.remove("visible");
  els.freezeFrame.removeAttribute("src");
}

function captureFreezeFrame() {
  if (!els.freezeFrame || !freezeCtx) {
    return;
  }
  const width = els.video.videoWidth;
  const height = els.video.videoHeight;
  if (!width || !height) {
    return;
  }
  freezeCanvas.width = width;
  freezeCanvas.height = height;
  freezeCtx.drawImage(els.video, 0, 0, width, height);
  els.freezeFrame.src = freezeCanvas.toDataURL("image/jpeg", 0.9);
  els.freezeFrame.classList.add("visible");
}

function setTorchUI(enabled, available) {
  torchEnabled = enabled;
  els.torchBtn.disabled = !available;
  els.torchBtn.textContent = enabled ? "Torcia ON" : "Torcia";
}

function getTorchSupport() {
  if (!mediaStream) {
    return false;
  }
  const [track] = mediaStream.getVideoTracks();
  const capabilities = track && track.getCapabilities ? track.getCapabilities() : {};
  return Boolean(capabilities.torch);
}

async function setTorchState(enabled) {
  if (!mediaStream) {
    return;
  }
  const [track] = mediaStream.getVideoTracks();
  if (!track) {
    return;
  }
  try {
    await track.applyConstraints({
      advanced: [{ torch: enabled }]
    });
    setTorchUI(enabled, true);
  } catch {
    setStatus("Torcia non supportata da questo dispositivo/browser.", "warn");
  }
}

function createBarcodeDetector() {
  if (!("BarcodeDetector" in window)) {
    return null;
  }
  try {
    return new BarcodeDetector({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

async function detectWithBarcodeDetector() {
  if (!detector) {
    return null;
  }
  const barcodes = await detector.detect(els.video);
  if (!barcodes.length) {
    return null;
  }
  return barcodes[0].rawValue || null;
}

function detectWithJsQr() {
  if (!scratchCtx || typeof window.jsQR !== "function") {
    return null;
  }
  const width = els.video.videoWidth;
  const height = els.video.videoHeight;
  if (!width || !height) {
    return null;
  }
  scratchCanvas.width = width;
  scratchCanvas.height = height;
  scratchCtx.drawImage(els.video, 0, 0, width, height);
  const imageData = scratchCtx.getImageData(0, 0, width, height);
  const result = window.jsQR(imageData.data, width, height, { inversionAttempts: "dontInvert" });
  return result ? result.data : null;
}

function stopTracks(stream) {
  if (!stream) {
    return;
  }
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
}

function stopScanner(options = {}) {
  const keepResult = Boolean(options.keepResult);
  const keepFreezeFrame = Boolean(options.keepFreezeFrame);
  const statusMessage = options.statusMessage || "Scanner fermato.";
  const statusType = options.statusType || "ok";

  isScanning = false;
  scanPaused = false;
  detector = null;
  setTorchUI(false, false);

  if (els.video.srcObject) {
    stopTracks(els.video.srcObject);
  }
  els.video.srcObject = null;
  mediaStream = null;

  els.startBtn.disabled = false;
  els.rescanBtn.disabled = !keepResult;

  if (!keepResult) {
    clearResult();
  }
  if (!keepFreezeFrame) {
    clearFreezeFrame();
  }

  setStatus(statusMessage, statusType);
}

function onQrDetected(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return;
  }
  const linkFound = isProbablyUrl(value);

  captureFreezeFrame();
  showResult(value);
  if (linkFound && navigator.vibrate) {
    navigator.vibrate([70, 30, 90]);
  }
  stopScanner({
    keepResult: true,
    keepFreezeFrame: true,
    statusMessage: "QR trovato: fotocamera fermata automaticamente."
  });
}

async function scanLoop(timestamp) {
  if (!isScanning) {
    return;
  }

  if (!scanPaused && timestamp - lastScanAt > SCAN_INTERVAL_MS) {
    lastScanAt = timestamp;
    try {
      const value = detector ? await detectWithBarcodeDetector() : detectWithJsQr();
      if (value) {
        onQrDetected(value);
      }
    } catch {
      const fallback = detectWithJsQr();
      if (fallback) {
        onQrDetected(fallback);
      }
    }
  }

  requestAnimationFrame(scanLoop);
}

async function startScanner() {
  if (isScanning) {
    return;
  }
  if (!window.isSecureContext && !LOCAL_HOSTNAMES.has(window.location.hostname)) {
    setStatus("Serve HTTPS o localhost per usare la fotocamera.", "warn");
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("Browser non compatibile con getUserMedia.", "warn");
    return;
  }

  clearResult();
  clearFreezeFrame();
  scanPaused = false;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  } catch {
    setStatus("Permesso fotocamera negato o non disponibile.", "warn");
    return;
  }

  els.video.srcObject = mediaStream;
  try {
    await els.video.play();
  } catch {
    stopTracks(mediaStream);
    mediaStream = null;
    setStatus("Impossibile avviare la preview della camera.", "warn");
    return;
  }

  isScanning = true;
  lastScanAt = 0;
  detector = createBarcodeDetector();

  if (!detector && typeof window.jsQR !== "function") {
    setStatus("Decoder QR non disponibile (BarcodeDetector/jsQR assenti).", "warn");
  } else if (detector) {
    setStatus("Scanner attivo con BarcodeDetector.");
  } else {
    setStatus("Scanner attivo con fallback jsQR.");
  }

  setTorchUI(false, getTorchSupport());
  els.startBtn.disabled = true;
  els.rescanBtn.disabled = true;

  requestAnimationFrame(scanLoop);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(APP_VERSION)}`, {
      scope: "./"
    });
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

async function tryAutoStartInPwa() {
  if (!isStandalonePwa()) {
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return;
  }
  setStatus("Tentativo apertura camera automatico...");
  await startScanner();
}

function bindInstallPromptForAndroid() {
  if (!els.installBtn) {
    return;
  }

  setInstallButtonVisibility(false);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (!isStandalonePwa()) {
      setInstallButtonVisibility(true);
      setStatus("Installazione disponibile su Android.");
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    setInstallButtonVisibility(false);
    setStatus("App installata.");
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    setInstallButtonVisibility(false);

    promptEvent.prompt();
    try {
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") {
        setStatus("Installazione avviata.");
      }
    } catch {
      setStatus("Installazione non completata.", "warn");
    }
  });
}

els.appVersion.textContent = `v${APP_VERSION}`;

els.startBtn.addEventListener("click", async () => {
  await startScanner();
});

els.rescanBtn.addEventListener("click", async () => {
  if (isScanning) {
    scanPaused = false;
    clearResult();
    setStatus("Ricerca di un nuovo QR in corso...");
    return;
  }
  await startScanner();
});

els.openBtn.addEventListener("click", () => {
  const value = els.resultValue.textContent || "";
  if (isProbablyUrl(value)) {
    window.open(value, "_blank", "noopener,noreferrer");
  }
});

els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.resultValue.textContent || "");
    setStatus("Testo copiato negli appunti.");
  } catch {
    setStatus("Copia non riuscita: permesso clipboard mancante.", "warn");
  }
});

els.torchBtn.addEventListener("click", async () => {
  await setTorchState(!torchEnabled);
});

window.addEventListener("beforeunload", () => {
  stopScanner({
    keepResult: true,
    statusMessage: "Chiusura pagina."
  });
});

window.addEventListener("load", async () => {
  bindInstallPromptForAndroid();
  await registerServiceWorker();
  await tryAutoStartInPwa();
});
