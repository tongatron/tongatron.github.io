const APP_VERSION = "1.0.0";

const els = {
  video: document.getElementById("camera"),
  preview: document.getElementById("processedPreview"),
  workCanvas: document.getElementById("workCanvas"),
  language: document.getElementById("language"),
  interval: document.getElementById("interval"),
  intervalValue: document.getElementById("intervalValue"),
  lowLight: document.getElementById("lowLight"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  copyBtn: document.getElementById("copyBtn"),
  clearBtn: document.getElementById("clearBtn"),
  statusLine: document.getElementById("statusLine"),
  statsLine: document.getElementById("statsLine"),
  liveText: document.getElementById("liveText"),
  stableText: document.getElementById("stableText"),
  appVersion: document.getElementById("appVersion"),
  pwaStatus: document.getElementById("pwaStatus"),
};

const state = {
  stream: null,
  worker: null,
  workerLang: null,
  scanning: false,
  processing: false,
  loopTimer: null,
  frameCount: 0,
  successfulFrames: 0,
  lineScores: new Map(),
};

const workCtx = els.workCanvas.getContext("2d", { willReadFrequently: true });
const previewCtx = els.preview.getContext("2d");

els.appVersion.textContent = `v${APP_VERSION}`;
els.intervalValue.textContent = `${els.interval.value} ms`;

function setStatus(message) {
  els.statusLine.textContent = message;
}

function updateStats() {
  els.statsLine.textContent = `Frame OCR: ${state.frameCount} · Testi utili: ${state.successfulFrames}`;
}

function normalizeLine(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s.,:;!?()\-]/gu, "")
    .trim();
}

function updateStableText(rawText, confidence) {
  const lines = rawText.split(/\n+/).map(normalizeLine).filter((line) => line.length >= 3);
  const score = Math.max(0.2, (confidence || 0) / 100);

  lines.forEach((line) => {
    const prev = state.lineScores.get(line) || 0;
    state.lineScores.set(line, prev + score);
  });

  const ranked = Array.from(state.lineScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([line]) => line);

  els.stableText.textContent = ranked.length > 0 ? ranked.join("\n") : "-";
}

function preprocessFrame() {
  const w = els.video.videoWidth;
  const h = els.video.videoHeight;
  if (!w || !h) return false;

  els.workCanvas.width = w;
  els.workCanvas.height = h;
  workCtx.drawImage(els.video, 0, 0, w, h);

  const img = workCtx.getImageData(0, 0, w, h);
  const data = img.data;

  let min = 255;
  let max = 0;
  let sum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < min) min = lum;
    if (lum > max) max = lum;
    sum += lum;
  }

  const avg = sum / (data.length / 4);
  const range = Math.max(1, max - min);
  const boost = els.lowLight.checked;
  const darkScene = avg < 110;

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    let value = ((lum - min) / range) * 255;

    if (boost) {
      const gamma = darkScene ? 0.72 : 0.9;
      value = Math.pow(value / 255, gamma) * 255;
      if (darkScene) value = value > 122 ? 255 : 0;
    }

    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  workCtx.putImageData(img, 0, 0);

  const previewWidth = 800;
  const previewHeight = Math.round((h / w) * previewWidth);
  els.preview.width = previewWidth;
  els.preview.height = previewHeight;
  previewCtx.drawImage(els.workCanvas, 0, 0, previewWidth, previewHeight);

  return true;
}

async function ensureWorker() {
  const wantedLang = els.language.value;

  if (state.worker && state.workerLang === wantedLang) return;

  if (state.worker) {
    await state.worker.terminate();
    state.worker = null;
    state.workerLang = null;
  }

  setStatus(`Carico OCR (${wantedLang})...`);

  state.worker = await Tesseract.createWorker(wantedLang, 1, {
    logger: (msg) => {
      if (msg.status === "recognizing text") {
        const pct = Math.round((msg.progress || 0) * 100);
        setStatus(`OCR in corso... ${pct}%`);
      }
    },
  });
  state.workerLang = wantedLang;
}

async function recognizeFrame() {
  if (!state.scanning || state.processing) return;
  if (!preprocessFrame()) return;

  state.processing = true;

  try {
    await ensureWorker();
    const result = await state.worker.recognize(els.workCanvas);

    state.frameCount += 1;
    updateStats();

    const text = (result?.data?.text || "").trim();
    const confidence = result?.data?.confidence || 0;

    els.liveText.textContent = text || "(nessun testo rilevato)";

    if (text.length > 0) {
      state.successfulFrames += 1;
      updateStats();
      updateStableText(text, confidence);
      setStatus(`OCR ok · confidenza ${confidence.toFixed(1)}%`);
    } else {
      setStatus("Nessun testo leggibile in questo frame");
    }
  } catch (error) {
    const reason = error?.message || "errore OCR";
    setStatus(`Errore OCR: ${reason}`);
  } finally {
    state.processing = false;
  }
}

function scheduleNextLoop() {
  if (!state.scanning) return;
  const delay = Number(els.interval.value) || 1400;
  state.loopTimer = window.setTimeout(async () => {
    await recognizeFrame();
    scheduleNextLoop();
  }, delay);
}

async function startCamera() {
  if (state.stream) return;

  const constraints = {
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };

  state.stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.video.srcObject = state.stream;
  await els.video.play();
}

function stopCamera() {
  if (!state.stream) return;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  els.video.srcObject = null;
}

async function start() {
  if (state.scanning) return;

  try {
    await startCamera();
    state.scanning = true;
    setStatus("Camera attiva. Avvio OCR...");
    scheduleNextLoop();
  } catch (error) {
    const reason = error?.message || "permessi camera negati";
    setStatus(`Impossibile avviare: ${reason}`);
  }
}

function stop() {
  state.scanning = false;
  if (state.loopTimer) {
    clearTimeout(state.loopTimer);
    state.loopTimer = null;
  }
  stopCamera();
  setStatus("Acquisizione fermata");
}

async function cleanupWorker() {
  if (!state.worker) return;
  await state.worker.terminate();
  state.worker = null;
  state.workerLang = null;
}

async function resetSession() {
  state.lineScores.clear();
  state.frameCount = 0;
  state.successfulFrames = 0;
  els.liveText.textContent = "-";
  els.stableText.textContent = "-";
  updateStats();
  await cleanupWorker();
  setStatus("Sessione pulita");
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    els.pwaStatus.textContent = "PWA not supported";
    return;
  }

  const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const isSecureOrigin = window.location.protocol === "https:" || isLocalhost;
  if (!isSecureOrigin) {
    els.pwaStatus.textContent = "PWA requires HTTPS";
    return;
  }

  try {
    const swUrl = `./sw.js?v=${encodeURIComponent(APP_VERSION)}`;
    const registration = await navigator.serviceWorker.register(swUrl, { scope: "./" });
    await registration.update();
    els.pwaStatus.textContent = "PWA active";
  } catch (error) {
    const reason = error?.message || "registration error";
    els.pwaStatus.textContent = `PWA failed (${reason})`;
  }
}

els.interval.addEventListener("input", () => {
  els.intervalValue.textContent = `${els.interval.value} ms`;
});

els.language.addEventListener("change", async () => {
  await cleanupWorker();
  setStatus("Lingua OCR aggiornata");
});

els.startBtn.addEventListener("click", start);
els.stopBtn.addEventListener("click", stop);
els.copyBtn.addEventListener("click", async () => {
  const text = els.stableText.textContent && els.stableText.textContent !== "-"
    ? els.stableText.textContent
    : els.liveText.textContent;
  if (!text || text === "-") {
    setStatus("Nessun testo da copiare");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Testo copiato");
  } catch (_error) {
    setStatus("Clipboard non disponibile");
  }
});

els.clearBtn.addEventListener("click", () => {
  resetSession();
});

window.addEventListener("beforeunload", () => {
  stop();
  cleanupWorker();
});

updateStats();
registerServiceWorker();
