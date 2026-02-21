const APP_VERSION = "1.0.0";
const KNOB_COUNT = 6;
const KNOB_MIN = 0;
const KNOB_MAX = 127;
const LFO_FREQS = [0.0131, 0.0181, 0.0239, 0.0421, 0.0557, 0.0673];
const INITIAL_KNOBS = [20, 32, 44, 56, 68, 80];

const PROGRAMS = [
  { id: "blink", label: "blink", audioMode: "none", description: "LED test sketch: no audio generation." },
  { id: "bytebeat_player", label: "bytebeat_player", audioMode: "bytebeat", description: "Bytebeat-style simulation with a gritty digital tone." },
  { id: "drone", label: "drone", audioMode: "drone", description: "6-oscillator drone with PB2-enabled LFO." },
  { id: "fm", label: "fm", audioMode: "fm", description: "Simplified 6-voice FM synthesis driven by knobs." },
  { id: "fourier", label: "fourier", audioMode: "fourier", description: "Additive harmonic engine inspired by the fourier sketch." },
  { id: "hardware_test", label: "hardware_test", audioMode: "none", description: "Hardware diagnostic sketch: no synthesis output." },
  { id: "multimode", label: "multimode", audioMode: "drone", description: "Multimode represented with the drone engine (MIDI excluded)." },
  { id: "squared", label: "squared", audioMode: "squared", description: "Square-wave engine with slight detune." },
];

const state = {
  knobs: [...INITIAL_KNOBS],
  droneOn: false,
  lfoOn: false,
  audioReady: false,
  audioCtx: null,
  master: null,
  analyser: null,
  scopeBuffer: null,
  voices: [],
  phases: new Array(KNOB_COUNT).fill(0),
  fmPhases: new Array(KNOB_COUNT).fill(0),
  seqPhase: 0,
  metroPhase: 0,
  currentProgram: "drone",
  lastTick: performance.now(),
  rafId: 0,
};

const ui = {
  knobs: [],
  knobValueLabels: [],
  knobFreqLabels: [],
  pb1: document.getElementById("pb1"),
  pb2: document.getElementById("pb2"),
  pb1Sub: document.getElementById("pb1-sub"),
  pb2Sub: document.getElementById("pb2-sub"),
  ledPb1: document.getElementById("led-pb1"),
  ledPb2: document.getElementById("led-pb2"),
  ledPb1Label: document.getElementById("led-pb1-label"),
  ledPb2Label: document.getElementById("led-pb2-label"),
  status: document.getElementById("status-text"),
  scope: document.getElementById("scope"),
  programSelect: document.getElementById("program-select"),
  programDescription: document.getElementById("program-description"),
  version: document.getElementById("app-version"),
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + (outMax - outMin) * t;
}

function midiToFrequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function knobToFrequency(knobValue) {
  const midiNote = mapRange(knobValue, KNOB_MIN, KNOB_MAX, 36, 72);
  return midiToFrequency(midiNote);
}

function knobToRotation(knobValue) {
  return mapRange(knobValue, KNOB_MIN, KNOB_MAX, -135, 135);
}

function getCurrentProgram() {
  return PROGRAMS.find((program) => program.id === state.currentProgram) ?? PROGRAMS[0];
}

function hasAudio(program = getCurrentProgram()) {
  return program.audioMode !== "none";
}

function getProgramControls(program = getCurrentProgram()) {
  if (program.audioMode === "metronome") {
    return { pb1: "CLICK", pb2: "SWING", led1: "CLICK", led2: "SWING" };
  }

  if (program.audioMode === "sequencer") {
    return { pb1: "SEQ", pb2: "MOD", led1: "SEQ", led2: "MOD" };
  }

  return { pb1: "DRONE", pb2: "LFO", led1: "DRONE", led2: "LFO" };
}

function setupProgramSelector() {
  PROGRAMS.forEach((program) => {
    const option = document.createElement("option");
    option.value = program.id;
    option.textContent = program.label;
    ui.programSelect.append(option);
  });

  ui.programSelect.value = state.currentProgram;
  ui.programSelect.addEventListener("change", () => {
    applyProgram(ui.programSelect.value);
  });
}

function setupKnobs() {
  ui.knobs = Array.from(document.querySelectorAll(".knob"));
  ui.knobValueLabels = Array.from({ length: KNOB_COUNT }, (_, i) => document.getElementById(`knob-value-${i + 1}`));
  ui.knobFreqLabels = Array.from({ length: KNOB_COUNT }, (_, i) => document.getElementById(`knob-freq-${i + 1}`));

  ui.knobs.forEach((knobEl, index) => {
    let drag = null;

    const onPointerMove = (event) => {
      if (!drag) return;
      const delta = (drag.startY - event.clientY) * 0.55;
      setKnob(index, drag.startValue + delta);
    };

    const onPointerUp = () => {
      if (!drag) return;
      knobEl.releasePointerCapture(drag.pointerId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      drag = null;
    };

    knobEl.addEventListener("pointerdown", (event) => {
      drag = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startValue: state.knobs[index],
      };
      knobEl.setPointerCapture(event.pointerId);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    knobEl.addEventListener("wheel", (event) => {
      event.preventDefault();
      const step = event.deltaY > 0 ? -1.8 : 1.8;
      setKnob(index, state.knobs[index] + step);
    });

    knobEl.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowRight") {
        event.preventDefault();
        setKnob(index, state.knobs[index] + 1);
      } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
        event.preventDefault();
        setKnob(index, state.knobs[index] - 1);
      } else if (event.key === "PageUp") {
        event.preventDefault();
        setKnob(index, state.knobs[index] + 8);
      } else if (event.key === "PageDown") {
        event.preventDefault();
        setKnob(index, state.knobs[index] - 8);
      } else if (event.key === "Home") {
        event.preventDefault();
        setKnob(index, KNOB_MIN);
      } else if (event.key === "End") {
        event.preventDefault();
        setKnob(index, KNOB_MAX);
      }
    });

    renderKnob(index);
  });
}

function getVoiceFrequency(index, dt) {
  const program = getCurrentProgram();
  const base = knobToFrequency(state.knobs[index]);

  switch (program.audioMode) {
    case "fm": {
      const modIndex = (index + 3) % KNOB_COUNT;
      const modFreq = mapRange(state.knobs[modIndex], KNOB_MIN, KNOB_MAX, 0.2, 12);
      const modDepth = mapRange(state.knobs[3], KNOB_MIN, KNOB_MAX, 0, 160);
      state.fmPhases[index] += Math.PI * 2 * modFreq * dt;
      if (state.fmPhases[index] > Math.PI * 2) state.fmPhases[index] -= Math.PI * 2;
      return Math.max(20, base + Math.sin(state.fmPhases[index]) * modDepth);
    }

    case "fourier": {
      if (index < 2) return knobToFrequency(state.knobs[0]) * (index + 1);
      if (index < 4) return knobToFrequency(state.knobs[1]) * (index === 2 ? 1 : 1.5);
      return knobToFrequency(state.knobs[2]) * (index === 4 ? 1 : 2);
    }

    case "bytebeat": {
      const raw = base * (1 + index * 0.11);
      return Math.max(24, Math.round(raw / 14) * 14);
    }

    case "squared": {
      return base * (index % 2 ? 1.011 : 0.989);
    }

    case "sequencer": {
      const pattern = [0, 3, 7, 10, 12, 10, 7, 3, 0, -2, 0, 5, 7, 5, 3, 0];
      const bpm = mapRange(state.knobs[5], KNOB_MIN, KNOB_MAX, 55, 178);
      const stepsPerSecond = (bpm / 60) * 4;
      state.seqPhase += dt * stepsPerSecond;
      const step = Math.floor(state.seqPhase) % pattern.length;
      const root = 36 + Math.round(mapRange(state.knobs[4], KNOB_MIN, KNOB_MAX, -8, 15));
      const chord = [0, 7, 12, 19, 24, 31][index];
      return midiToFrequency(root + pattern[step] + chord * 0.3);
    }

    case "metronome": {
      return index === 0 ? 1800 : 240;
    }

    case "drone":
    default:
      return base;
  }
}

function renderKnob(index) {
  const value = state.knobs[index];
  const freq = knobToFrequency(value);
  const rotation = knobToRotation(value);
  const knobEl = ui.knobs[index];

  knobEl.style.setProperty("--rot", `${rotation.toFixed(2)}deg`);
  knobEl.setAttribute("aria-valuenow", `${Math.round(value)}`);
  ui.knobValueLabels[index].textContent = `${Math.round(value)}`;
  ui.knobFreqLabels[index].textContent = `${freq.toFixed(2)} Hz`;
}

function setKnob(index, nextValue) {
  const value = clamp(nextValue, KNOB_MIN, KNOB_MAX);
  if (Math.abs(value - state.knobs[index]) < 0.01) return;
  state.knobs[index] = value;
  renderKnob(index);
  updateStatus();
}

function setOscillatorProfile(program = getCurrentProgram()) {
  if (!state.audioReady) return;

  const types = {
    drone: "triangle",
    bytebeat: "sawtooth",
    fm: "sine",
    fourier: "triangle",
    squared: "square",
    sequencer: "sawtooth",
    metronome: "square",
  };

  const wave = types[program.audioMode] ?? "triangle";
  const outputGain = {
    drone: 0.72,
    bytebeat: 0.58,
    fm: 0.66,
    fourier: 0.62,
    squared: 0.6,
    sequencer: 0.68,
    metronome: 0.45,
  };

  state.voices.forEach((voice) => {
    voice.oscillator.type = wave;
  });

  state.master.gain.setTargetAtTime(outputGain[program.audioMode] ?? 0.7, state.audioCtx.currentTime, 0.2);
}

function setupAudioGraph() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    ui.status.textContent = "Web Audio API is not supported in this browser";
    return false;
  }

  state.audioCtx = new AudioContextClass();
  state.master = state.audioCtx.createGain();
  const lowpass = state.audioCtx.createBiquadFilter();
  const compressor = state.audioCtx.createDynamicsCompressor();
  state.analyser = state.audioCtx.createAnalyser();

  state.master.gain.value = 0.72;
  lowpass.type = "lowpass";
  lowpass.frequency.value = 3600;
  lowpass.Q.value = 0.6;

  compressor.threshold.value = -20;
  compressor.knee.value = 28;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.2;

  state.analyser.fftSize = 1024;
  state.scopeBuffer = new Uint8Array(state.analyser.fftSize);

  state.master.connect(lowpass);
  lowpass.connect(compressor);
  compressor.connect(state.analyser);
  state.analyser.connect(state.audioCtx.destination);

  state.voices = Array.from({ length: KNOB_COUNT }, (_, i) => {
    const oscillator = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = knobToFrequency(state.knobs[i]);
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(state.master);
    oscillator.start();
    return { oscillator, gain };
  });

  state.audioReady = true;
  setOscillatorProfile();
  state.lastTick = performance.now();
  state.rafId = requestAnimationFrame(audioTick);
  return true;
}

function computeVoiceLevel(index, dt) {
  const program = getCurrentProgram();
  if (!state.droneOn || !hasAudio(program)) return 0;

  if (program.audioMode === "metronome") {
    const bpm = mapRange(state.knobs[0], KNOB_MIN, KNOB_MAX, 45, 190);
    state.metroPhase += dt * (bpm / 60);
    if (state.metroPhase > 1) state.metroPhase -= 1;
    if (index !== 0) return 0;
    return state.metroPhase < 0.04 ? 0.34 : 0;
  }

  let base = 0.1;
  if (program.audioMode === "fourier") {
    const voiceLevel = [state.knobs[3], state.knobs[4], state.knobs[5]];
    const bank = index < 2 ? 0 : index < 4 ? 1 : 2;
    base = mapRange(voiceLevel[bank], KNOB_MIN, KNOB_MAX, 0.03, 0.14);
  }

  if (program.audioMode === "bytebeat") {
    base = mapRange(state.knobs[2], KNOB_MIN, KNOB_MAX, 0.04, 0.12);
  }

  if (program.audioMode === "squared") {
    base = 0.085;
  }

  if (program.audioMode === "fm") {
    base = mapRange(state.knobs[3], KNOB_MIN, KNOB_MAX, 0.03, 0.13);
  }

  if (program.audioMode === "sequencer") {
    const gate = ((Math.floor(state.seqPhase) + index) % 4) < 2;
    base = gate ? 0.1 : 0.03;
  }

  if (!state.lfoOn) return base;

  state.phases[index] += Math.PI * 2 * LFO_FREQS[index] * dt;
  if (state.phases[index] > Math.PI * 2) state.phases[index] -= Math.PI * 2;

  const lfoSample = Math.sin(state.phases[index]);
  const lfoAmount = mapRange(state.knobs[5], KNOB_MIN, KNOB_MAX, 0.2, 1);
  const lfoScale = mapRange(lfoSample, -1, 1, 1 - 0.7 * lfoAmount, 1);
  return base * lfoScale;
}

function drawScope() {
  const canvas = ui.scope;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(8, 22, 29, 0.94)";
  ctx.fillRect(0, 0, width, height);

  state.analyser.getByteTimeDomainData(state.scopeBuffer);

  ctx.strokeStyle = "rgba(83, 255, 211, 0.21)";
  ctx.lineWidth = 1;
  for (let y = 0; y <= height; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.strokeStyle = "#58ffd6";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < state.scopeBuffer.length; i++) {
    const x = (i / (state.scopeBuffer.length - 1)) * width;
    const v = state.scopeBuffer[i] / 255;
    const y = (1 - v) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function audioTick(now) {
  if (!state.audioReady) return;

  const dt = Math.min((now - state.lastTick) / 1000, 0.1);
  state.lastTick = now;

  const currentTime = state.audioCtx.currentTime;
  for (let i = 0; i < KNOB_COUNT; i++) {
    const freq = getVoiceFrequency(i, dt);
    state.voices[i].oscillator.frequency.setTargetAtTime(freq, currentTime, 0.03);
    const level = computeVoiceLevel(i, dt);
    state.voices[i].gain.gain.setTargetAtTime(level, currentTime, 0.045);
  }

  drawScope();
  state.rafId = requestAnimationFrame(audioTick);
}

async function ensureAudio() {
  if (!state.audioReady) {
    const ok = setupAudioGraph();
    if (!ok) return false;
  }

  if (state.audioCtx.state !== "running") {
    await state.audioCtx.resume();
  }

  return true;
}

function refreshButtonsAndLeds() {
  const controls = getProgramControls();
  ui.pb1Sub.textContent = controls.pb1;
  ui.pb2Sub.textContent = controls.pb2;
  ui.ledPb1Label.textContent = controls.led1;
  ui.ledPb2Label.textContent = controls.led2;

  ui.pb1.classList.toggle("is-active", state.droneOn);
  ui.pb1.setAttribute("aria-pressed", String(state.droneOn));
  ui.pb2.classList.toggle("is-active", state.lfoOn);
  ui.pb2.setAttribute("aria-pressed", String(state.lfoOn));
  ui.ledPb1.classList.toggle("on", state.droneOn);
  ui.ledPb2.classList.toggle("on", state.lfoOn);
}

function updateStatus() {
  const program = getCurrentProgram();
  if (!hasAudio(program)) {
    ui.status.textContent = `${program.label} | no audio engine in this simulation`;
    return;
  }

  const minFreq = Math.min(...state.knobs.map(knobToFrequency)).toFixed(1);
  const maxFreq = Math.max(...state.knobs.map(knobToFrequency)).toFixed(1);
  const audioText = state.droneOn ? "ON" : "OFF";
  const lfoText = state.lfoOn ? "ON" : "OFF";
  ui.status.textContent = `${program.label} | PB1 ${audioText} | PB2 ${lfoText} | ${minFreq}-${maxFreq} Hz`;
}

function applyProgram(programId) {
  state.currentProgram = programId;
  const program = getCurrentProgram();
  ui.programDescription.textContent = program.description;

  state.droneOn = false;
  state.lfoOn = false;
  state.seqPhase = 0;
  state.metroPhase = 0;
  state.phases.fill(0);
  state.fmPhases.fill(0);

  if (state.audioReady) {
    setOscillatorProfile(program);
    state.voices.forEach((voice) => {
      voice.gain.gain.setTargetAtTime(0, state.audioCtx.currentTime, 0.05);
    });
  }

  refreshButtonsAndLeds();
  updateStatus();
}

async function toggleDrone() {
  const program = getCurrentProgram();
  if (!hasAudio(program)) {
    ui.status.textContent = `${program.label}: no audio engine in this simulation`;
    return;
  }

  const ok = await ensureAudio();
  if (!ok) return;

  state.droneOn = !state.droneOn;
  refreshButtonsAndLeds();
  updateStatus();
}

async function toggleLfo() {
  const program = getCurrentProgram();
  if (!hasAudio(program)) {
    ui.status.textContent = `${program.label}: PB2 unavailable (non-audio program)`;
    return;
  }

  const ok = await ensureAudio();
  if (!ok) return;

  state.lfoOn = !state.lfoOn;
  refreshButtonsAndLeds();
  updateStatus();
}

function setupButtons() {
  ui.pb1.addEventListener("click", () => {
    toggleDrone().catch(() => {
      ui.status.textContent = "Audio start error";
    });
  });

  ui.pb2.addEventListener("click", () => {
    toggleLfo().catch(() => {
      ui.status.textContent = "LFO start error";
    });
  });
}

function setupVersionBadge() {
  if (!ui.version) return;
  ui.version.textContent = `v${APP_VERSION}`;
}

async function setupPwa() {
  const isSecure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!("serviceWorker" in navigator) || !isSecure) return;

  try {
    await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(APP_VERSION)}`, { scope: "./" });
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

function init() {
  setupVersionBadge();
  setupPwa();
  setupProgramSelector();
  setupKnobs();
  setupButtons();
  applyProgram(state.currentProgram);
}

init();
