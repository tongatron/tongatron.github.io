const APP_VERSION = window.APP_VERSION || "0.0.0-dev";

const ui = {
  volume: document.getElementById("volume"),
  volumeValue: document.getElementById("volumeValue"),
  filterType: document.getElementById("filterType"),
  cutoff: document.getElementById("cutoff"),
  cutoffValue: document.getElementById("cutoffValue"),
  resonance: document.getElementById("resonance"),
  resonanceValue: document.getElementById("resonanceValue"),
  pan: document.getElementById("pan"),
  panValue: document.getElementById("panValue"),
  timer: document.getElementById("timer"),
  timerValue: document.getElementById("timerValue"),
  presetSelect: document.getElementById("presetSelect"),
  presetValue: document.getElementById("presetValue"),
  applyPresetBtn: document.getElementById("applyPresetBtn"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  statusTag: document.getElementById("statusTag"),
  hintText: document.getElementById("hintText"),
  meterFill: document.getElementById("meterFill"),
  meterValue: document.getElementById("meterValue"),
  appVersion: document.getElementById("appVersion")
};

const PRESETS = {
  relax: { label: "Relax", volume: 30, filterType: "lowpass", cutoff: 7000, resonance: 0.8, pan: 0, timer: 20 },
  focus: { label: "Focus", volume: 38, filterType: "bandpass", cutoff: 2500, resonance: 1.6, pan: 0, timer: 45 },
  sleep: { label: "Sleep", volume: 24, filterType: "lowpass", cutoff: 4200, resonance: 0.7, pan: -0.02, timer: 60 },
  masking: { label: "Masking", volume: 45, filterType: "highpass", cutoff: 1100, resonance: 0.9, pan: 0, timer: 0 }
};

let audioCtx;
let gainNode;
let filterNode;
let pannerNode;
let analyserNode;
let sourceNode;
let meterFrame;
let autoStopTimer;

function formatPan(value) {
  if (value > 0.05) return `Destra ${Math.round(value * 100)}%`;
  if (value < -0.05) return `Sinistra ${Math.round(Math.abs(value) * 100)}%`;
  return "Centro";
}

function initAudio() {
  if (audioCtx) return;

  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();

  gainNode = audioCtx.createGain();
  filterNode = audioCtx.createBiquadFilter();
  pannerNode = audioCtx.createStereoPanner();
  analyserNode = audioCtx.createAnalyser();

  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.84;

  filterNode.type = "allpass";

  filterNode.connect(gainNode);
  gainNode.connect(pannerNode);
  pannerNode.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

  applyParams();
}

function createWhiteNoiseBuffer() {
  const duration = 2;
  const channels = 2;
  const sampleRate = audioCtx.sampleRate;
  const frameCount = duration * sampleRate;
  const buffer = audioCtx.createBuffer(channels, frameCount, sampleRate);

  for (let channel = 0; channel < channels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  return buffer;
}

function applyParams() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const volume = Number(ui.volume.value) / 100;
  const cutoff = Number(ui.cutoff.value);
  const resonance = Number(ui.resonance.value);
  const pan = Number(ui.pan.value);

  gainNode.gain.setTargetAtTime(volume, now, 0.01);
  filterNode.type = ui.filterType.value;
  filterNode.frequency.setTargetAtTime(cutoff, now, 0.01);
  filterNode.Q.setTargetAtTime(resonance, now, 0.01);
  pannerNode.pan.setTargetAtTime(pan, now, 0.01);
}

function updateUIReadouts() {
  ui.volumeValue.textContent = `${ui.volume.value}%`;
  ui.cutoffValue.textContent = `${Number(ui.cutoff.value).toLocaleString("it-IT")} Hz`;
  ui.resonanceValue.textContent = Number(ui.resonance.value).toFixed(1);
  ui.panValue.textContent = formatPan(Number(ui.pan.value));
  ui.timerValue.textContent = ui.timer.value === "0" ? "0 (off)" : `${ui.timer.value} min`;
}

function refreshAutoStop() {
  clearTimeout(autoStopTimer);
  const minutes = Number(ui.timer.value);

  if (!ui.stopBtn.disabled && minutes > 0) {
    autoStopTimer = setTimeout(stopNoise, minutes * 60 * 1000);
    ui.hintText.textContent = `Riproduzione attiva. Arresto automatico tra ${minutes} minuti.`;
    return;
  }

  if (!ui.stopBtn.disabled) {
    ui.hintText.textContent = "Riproduzione attiva. I parametri possono essere modificati senza interrompere il suono.";
  }
}

function markCustomPreset() {
  ui.presetSelect.value = "custom";
  ui.presetValue.textContent = "Custom";
}

function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) return;

  ui.volume.value = String(preset.volume);
  ui.filterType.value = preset.filterType;
  ui.cutoff.value = String(preset.cutoff);
  ui.resonance.value = String(preset.resonance);
  ui.pan.value = String(preset.pan);
  ui.timer.value = String(preset.timer);
  ui.presetSelect.value = presetName;
  ui.presetValue.textContent = preset.label;

  updateUIReadouts();
  applyParams();
  refreshAutoStop();
}

function updateMeter() {
  if (!analyserNode) return;

  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i += 1) {
    const normalized = (dataArray[i] - 128) / 128;
    sum += normalized * normalized;
  }

  const rms = Math.sqrt(sum / dataArray.length);
  const level = Math.min(100, Math.round(rms * 180));

  ui.meterFill.style.width = `${level}%`;
  ui.meterValue.textContent = `${level}%`;
  meterFrame = requestAnimationFrame(updateMeter);
}

function setRunningState(isRunning) {
  ui.startBtn.disabled = isRunning;
  ui.stopBtn.disabled = !isRunning;
  ui.statusTag.textContent = isRunning ? "STATO: ATTIVO" : "STATO: FERMO";
  ui.statusTag.style.color = isRunning ? "#5eead4" : "#94b9b3";
}

async function startNoise() {
  initAudio();
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  if (sourceNode) {
    sourceNode.stop();
    sourceNode.disconnect();
  }

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = createWhiteNoiseBuffer();
  sourceNode.loop = true;
  sourceNode.connect(filterNode);

  sourceNode.onended = () => {
    sourceNode = undefined;
  };

  sourceNode.start();
  applyParams();
  setRunningState(true);

  ui.hintText.textContent = "Riproduzione attiva. I parametri possono essere modificati senza interrompere il suono.";

  cancelAnimationFrame(meterFrame);
  meterFrame = requestAnimationFrame(updateMeter);
  refreshAutoStop();
}

function stopNoise() {
  if (sourceNode) {
    sourceNode.stop();
    sourceNode.disconnect();
    sourceNode = undefined;
  }

  clearTimeout(autoStopTimer);
  cancelAnimationFrame(meterFrame);
  ui.meterFill.style.width = "0%";
  ui.meterValue.textContent = "0%";

  setRunningState(false);
  ui.hintText.textContent = "Premi Avvia per iniziare la riproduzione continua.";
}

function handleParamChange(el) {
  markCustomPreset();
  updateUIReadouts();
  applyParams();
  if (el === ui.timer) {
    refreshAutoStop();
  }
}

async function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const swUrl = `./service-worker.js?v=${encodeURIComponent(APP_VERSION)}`;
    const registration = await navigator.serviceWorker.register(swUrl, { scope: "./" });
    registration.update();
  } catch (error) {
    console.error("Registrazione service worker fallita:", error);
  }
}

[ui.volume, ui.cutoff, ui.resonance, ui.pan, ui.timer].forEach((el) => {
  el.addEventListener("input", () => handleParamChange(el));
});

ui.filterType.addEventListener("change", () => handleParamChange(ui.filterType));

ui.presetSelect.addEventListener("change", () => {
  const presetName = ui.presetSelect.value;
  if (presetName === "custom") {
    markCustomPreset();
    return;
  }
  applyPreset(presetName);
});

ui.applyPresetBtn.addEventListener("click", () => {
  const presetName = ui.presetSelect.value;
  if (presetName === "custom") {
    markCustomPreset();
    return;
  }
  applyPreset(presetName);
});

ui.startBtn.addEventListener("click", () => {
  startNoise().catch((err) => {
    console.error(err);
    ui.hintText.textContent = "Errore audio: verifica i permessi del browser e riprova.";
  });
});

ui.stopBtn.addEventListener("click", stopNoise);

if (ui.appVersion) {
  ui.appVersion.textContent = `v${APP_VERSION}`;
}

updateUIReadouts();
registerPwaServiceWorker();
