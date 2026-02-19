const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const cpuLevelSelect = document.getElementById("cpu-level");
const scoreUser = document.getElementById("score-user");
const scorePc = document.getElementById("score-pc");
const scoreDraw = document.getElementById("score-draw");

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let isComputerThinking = false;
let userPoints = 0;
let pcPoints = 0;
let drawPoints = 0;
let computerTimerId = null;

function updateStatus(message) {
  statusText.textContent = message;
}

function updateScoreboard() {
  scoreUser.textContent = userPoints;
  scorePc.textContent = pcPoints;
  scoreDraw.textContent = drawPoints;
}

function getWinner(state) {
  for (const [a, b, c] of winningCombos) {
    if (state[a] && state[a] === state[b] && state[b] === state[c]) {
      return state[a];
    }
  }
  return "";
}

function renderBoard() {
  const disableForTurn = gameOver || isComputerThinking || currentPlayer === "O";
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = disableForTurn || board[index] !== "";
  });
}

function finishGame(winner) {
  gameOver = true;
  if (winner === "X") {
    userPoints += 1;
    updateStatus("Ha vinto User! Nuovo round tra 1 secondo...");
  } else if (winner === "O") {
    pcPoints += 1;
    updateStatus("Ha vinto il computer! Nuovo round tra 1 secondo...");
  } else {
    drawPoints += 1;
    updateStatus("Pareggio! Nuovo round tra 1 secondo...");
  }
  updateScoreboard();
  renderBoard();

  setTimeout(() => {
    if (gameOver) startRound();
  }, 1000);
}

function getEmptyCells(state) {
  return state.map((value, index) => (value === "" ? index : -1)).filter((value) => value !== -1);
}

function findImmediateMove(state, symbol) {
  for (const index of getEmptyCells(state)) {
    const next = [...state];
    next[index] = symbol;
    if (getWinner(next) === symbol) return index;
  }
  return null;
}

function getRandomMove(state) {
  const empty = getEmptyCells(state);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getMediumMove(state) {
  const winningMove = findImmediateMove(state, "O");
  if (winningMove !== null) return winningMove;

  const blockMove = findImmediateMove(state, "X");
  if (blockMove !== null) return blockMove;

  if (state[4] === "") return 4;
  return getRandomMove(state);
}

function minimax(state, isMaximizing, depth) {
  const winner = getWinner(state);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (getEmptyCells(state).length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const index of getEmptyCells(state)) {
      const next = [...state];
      next[index] = "O";
      bestScore = Math.max(bestScore, minimax(next, false, depth + 1));
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const index of getEmptyCells(state)) {
    const next = [...state];
    next[index] = "X";
    bestScore = Math.min(bestScore, minimax(next, true, depth + 1));
  }
  return bestScore;
}

function getAdvancedMove(state) {
  let bestScore = -Infinity;
  let bestMove = getRandomMove(state);

  for (const index of getEmptyCells(state)) {
    const next = [...state];
    next[index] = "O";
    const score = minimax(next, false, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}

function makeMove(index, symbol) {
  board[index] = symbol;
  const winner = getWinner(board);

  if (winner) {
    finishGame(winner);
    return;
  }

  if (board.every((cell) => cell !== "")) {
    finishGame("");
    return;
  }

  currentPlayer = symbol === "X" ? "O" : "X";
  updateStatus(currentPlayer === "X" ? "Turno di User (X)" : "Turno del computer (O)");
  renderBoard();
}

function computerTurn() {
  if (gameOver || currentPlayer !== "O") return;
  isComputerThinking = true;
  updateStatus("Il computer sta giocando...");
  renderBoard();

  computerTimerId = setTimeout(() => {
    if (gameOver || currentPlayer !== "O") return;
    const level = cpuLevelSelect.value;
    const move = level === "advanced" ? getAdvancedMove(board) : getMediumMove(board);
    isComputerThinking = false;
    makeMove(move, "O");
  }, 350);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (gameOver || isComputerThinking || currentPlayer !== "X" || board[index]) return;
  makeMove(index, "X");
  if (!gameOver) computerTurn();
}

function startRound() {
  if (computerTimerId) {
    clearTimeout(computerTimerId);
    computerTimerId = null;
  }
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  isComputerThinking = false;
  updateScoreboard();
  updateStatus("Turno di User (X)");
  renderBoard();
}

function resetMatch() {
  userPoints = 0;
  pcPoints = 0;
  drawPoints = 0;
  startRound();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetMatch);
cpuLevelSelect.addEventListener("change", startRound);

startRound();
