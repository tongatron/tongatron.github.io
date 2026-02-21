const WIN_SCORE = 5;

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const roundCountEl = document.getElementById("roundCount");
const roundResultEl = document.getElementById("roundResult");
const roundDetailsEl = document.getElementById("roundDetails");

const fingersEl = document.getElementById("fingers");
const callEl = document.getElementById("call");
const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");

let playerScore = 0;
let cpuScore = 0;
let round = 1;
let gameOver = false;

function fillOptions(selectEl, min, max) {
  for (let i = min; i <= max; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = String(i);
    selectEl.append(option);
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setStatus(message, details = "", winner = false) {
  roundResultEl.textContent = message;
  roundDetailsEl.textContent = details;
  roundResultEl.classList.toggle("winner", winner);
}

function updateScoreboard() {
  playerScoreEl.textContent = String(playerScore);
  cpuScoreEl.textContent = String(cpuScore);
  roundCountEl.textContent = String(round);
}

function endGame(winner) {
  gameOver = true;
  playBtn.disabled = true;
  const text = winner === "player" ? "Hai vinto la partita!" : "La CPU ha vinto la partita.";
  setStatus(text, "Premi Nuova partita per ricominciare.", true);
}

function playRound() {
  if (gameOver) return;

  const playerFingers = Number(fingersEl.value);
  const playerCall = Number(callEl.value);
  const cpuFingers = randInt(1, 5);
  const cpuCall = randInt(2, 10);
  const total = playerFingers + cpuFingers;

  const playerHits = playerCall === total;
  const cpuHits = cpuCall === total;

  if (playerHits && !cpuHits) {
    playerScore += 1;
    setStatus("Punto per te.", `Totale ${total}. Tu ${playerFingers}/${playerCall} - CPU ${cpuFingers}/${cpuCall}`);
  } else if (!playerHits && cpuHits) {
    cpuScore += 1;
    setStatus("Punto per la CPU.", `Totale ${total}. Tu ${playerFingers}/${playerCall} - CPU ${cpuFingers}/${cpuCall}`);
  } else if (playerHits && cpuHits) {
    setStatus("Entrambi indovinano: round nullo.", `Totale ${total}. Tu ${playerFingers}/${playerCall} - CPU ${cpuFingers}/${cpuCall}`);
  } else {
    setStatus("Nessuno indovina: round nullo.", `Totale ${total}. Tu ${playerFingers}/${playerCall} - CPU ${cpuFingers}/${cpuCall}`);
  }

  if (playerScore >= WIN_SCORE) {
    endGame("player");
  } else if (cpuScore >= WIN_SCORE) {
    endGame("cpu");
  } else {
    round += 1;
  }

  updateScoreboard();
}

function resetGame() {
  playerScore = 0;
  cpuScore = 0;
  round = 1;
  gameOver = false;
  playBtn.disabled = false;
  setStatus("Partita resettata.", "Pronto a iniziare.");
  updateScoreboard();
}

fillOptions(fingersEl, 1, 5);
fillOptions(callEl, 2, 10);
fingersEl.value = "1";
callEl.value = "2";

playBtn.addEventListener("click", playRound);
resetBtn.addEventListener("click", resetGame);

updateScoreboard();
