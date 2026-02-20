const APP_VERSION = "1.0.0";

const pads = [...document.querySelectorAll(".pad")];
const roundEl = document.getElementById("round");
const statusEl = document.getElementById("status");
const strictModeEl = document.getElementById("strictMode");
const startBtn = document.getElementById("startBtn");
const repeatBtn = document.getElementById("repeatBtn");
const versionEl = document.getElementById("appVersion");

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const tones = [329.63, 261.63, 392.0, 523.25];

const state = {
  sequence: [],
  userIndex: 0,
  isUserTurn: false,
  isPlayingSequence: false,
  audioCtx: null,
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function setPadsEnabled(enabled) {
  pads.forEach((pad) => {
    pad.disabled = !enabled;
  });
}

function randomPad() {
  return Math.floor(Math.random() * 4);
}

function ensureAudioCtx() {
  if (!AudioContextClass) return null;
  if (!state.audioCtx) {
    state.audioCtx = new AudioContextClass();
  }
  if (state.audioCtx.state === "suspended") {
    state.audioCtx.resume();
  }
  return state.audioCtx;
}

function playTone(freq, duration = 240) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = "triangle";
  gain.gain.value = 0.001;

  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration / 1000);
  osc.start(t);
  osc.stop(t + duration / 1000 + 0.02);
}

async function flashPad(index, duration = 320) {
  const pad = pads[index];
  pad.classList.add("active");
  playTone(tones[index], duration - 40);
  await wait(duration);
  pad.classList.remove("active");
}

async function playSequence() {
  state.isPlayingSequence = true;
  state.isUserTurn = false;
  setPadsEnabled(false);
  repeatBtn.disabled = true;
  setStatus("Watch the sequence...");

  await wait(500);
  for (const step of state.sequence) {
    await flashPad(step);
    await wait(130);
  }

  state.isPlayingSequence = false;
  state.isUserTurn = true;
  state.userIndex = 0;
  setPadsEnabled(true);
  repeatBtn.disabled = false;
  setStatus("Your turn.");
}

async function nextRound() {
  state.sequence.push(randomPad());
  roundEl.textContent = String(state.sequence.length);
  await playSequence();
}

async function startGame() {
  state.sequence = [];
  state.userIndex = 0;
  roundEl.textContent = "0";
  setStatus("Game started.");
  await nextRound();
}

async function failFeedback() {
  setPadsEnabled(false);
  setStatus("Mistake!");

  for (let i = 0; i < 3; i += 1) {
    pads.forEach((pad) => pad.classList.add("active"));
    playTone(110, 130);
    await wait(170);
    pads.forEach((pad) => pad.classList.remove("active"));
    await wait(100);
  }
}

async function handleUserInput(index) {
  if (!state.isUserTurn || state.isPlayingSequence) return;

  await flashPad(index, 220);
  if (index !== state.sequence[state.userIndex]) {
    await failFeedback();

    if (strictModeEl.checked) {
      setStatus("You lost. Strict mode restarts from round 1.");
      await wait(500);
      await startGame();
    } else {
      setStatus("Wrong step. Try the same sequence again.");
      await wait(700);
      await playSequence();
    }
    return;
  }

  state.userIndex += 1;
  if (state.userIndex === state.sequence.length) {
    state.isUserTurn = false;
    setStatus("Great. Next round...");
    await wait(720);
    await nextRound();
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    handleUserInput(Number(pad.dataset.pad));
  });
});

startBtn.addEventListener("click", startGame);

repeatBtn.addEventListener("click", async () => {
  if (state.sequence.length === 0 || state.isPlayingSequence) return;
  await playSequence();
});

document.addEventListener("keydown", (event) => {
  const map = { 1: 0, 2: 1, 3: 2, 4: 3 };
  const key = Number(event.key);
  if (map[key] !== undefined) {
    handleUserInput(map[key]);
  }
});

if (versionEl) {
  versionEl.textContent = APP_VERSION;
}

repeatBtn.disabled = true;
setPadsEnabled(false);
registerServiceWorker();
