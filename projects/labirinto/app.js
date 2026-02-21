const APP_VERSION = "2.1.0";
const DIFFICULTY_LEVELS = {
  rookie: { label: "Rookie", visionRadius: Infinity },
  arcade: { label: "Arcade", visionRadius: 10 },
  hard: { label: "Hard", visionRadius: 7 },
  nightmare: { label: "Nightmare", visionRadius: 4 },
  legend: { label: "Legend", visionRadius: 3 },
};

const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const mazeShellEl = document.querySelector(".maze-shell");
const difficultySelect = document.getElementById("difficulty");
const mazeSizeInput = document.getElementById("mazeSize");
const sizeValueEl = document.getElementById("sizeValue");
const viewModeSelect = document.getElementById("viewMode");
const newMazeButton = document.getElementById("newMaze");
const statusLineEl = document.getElementById("statusLine");
const winBannerEl = document.getElementById("winBanner");
const appVersionEl = document.getElementById("appVersion");
const pwaStatusEl = document.getElementById("pwaStatus");

let cols = 33;
let rows = 33;
let cellWidth = 10;
let cellHeight = 10;
let currentDifficulty = "arcade";
let viewMode = "full";
let visionRadius = DIFFICULTY_LEVELS.arcade.visionRadius;

let maze = [];
let player = { x: 1, y: 1 };
let goal = { x: cols - 2, y: rows - 2 };
let won = false;

appVersionEl.textContent = `v${APP_VERSION}`;

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function toOdd(n) {
  const safe = Math.max(9, Math.min(121, Number(n) || 33));
  return safe % 2 === 0 ? safe + 1 : safe;
}

function updateSizeLabel() {
  const size = toOdd(mazeSizeInput.value);
  sizeValueEl.textContent = `${size}x${size}`;
}

function fitCanvasToViewport() {
  const rect = mazeShellEl.getBoundingClientRect();
  const factor = viewMode === "full" ? 1 : 0.82;
  const targetWidth = Math.max(180, Math.floor((rect.width - 8) * factor));
  const targetHeight = Math.max(180, Math.floor((rect.height - 8) * factor));
  cellWidth = Math.max(2, Math.floor(targetWidth / cols));
  cellHeight = Math.max(2, Math.floor(targetHeight / rows));
  canvas.width = cols * cellWidth;
  canvas.height = rows * cellHeight;
}

function applySettingsFromUI() {
  const difficultyConfig = DIFFICULTY_LEVELS[difficultySelect.value] || DIFFICULTY_LEVELS.arcade;
  currentDifficulty = difficultySelect.value in DIFFICULTY_LEVELS ? difficultySelect.value : "arcade";
  visionRadius = difficultyConfig.visionRadius;
  viewMode = viewModeSelect.value === "fit" ? "fit" : "full";

  const size = toOdd(mazeSizeInput.value);
  cols = size;
  rows = size;

  fitCanvasToViewport();
}

function createGrid(w, h, fill = 1) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function carveMaze() {
  maze = createGrid(cols, rows, 1);
  const stack = [{ x: 1, y: 1 }];
  maze[1][1] = 0;

  const dirs = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    let moved = false;

    for (const d of shuffled) {
      const nx = current.x + d.x;
      const ny = current.y + d.y;
      if (nx <= 0 || ny <= 0 || nx >= cols - 1 || ny >= rows - 1) continue;
      if (maze[ny][nx] === 0) continue;

      maze[ny][nx] = 0;
      maze[current.y + d.y / 2][current.x + d.x / 2] = 0;
      stack.push({ x: nx, y: ny });
      moved = true;
      break;
    }

    if (!moved) stack.pop();
  }

  player = { x: 1, y: 1 };
  goal = { x: cols - 2, y: rows - 2 };
  won = false;
  winBannerEl.classList.remove("show");
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
}

function drawFog() {
  if (!Number.isFinite(visionRadius)) return;
  ctx.fillStyle = "rgba(3, 7, 14, 0.72)";
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const dx = Math.abs(player.x - x);
      const dy = Math.abs(player.y - y);
      const visible = Math.max(dx, dy) <= visionRadius;
      if (!visible) ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
  }
  drawCell(player.x, player.y, cssVar("--player"));
}

function drawMaze() {
  const wallColor = cssVar("--wall");
  const pathColor = cssVar("--path");
  const playerColor = cssVar("--player");
  const goalColor = cssVar("--goal");

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      drawCell(x, y, maze[y][x] === 1 ? wallColor : pathColor);
    }
  }

  drawCell(goal.x, goal.y, goalColor);
  drawCell(player.x, player.y, playerColor);
  drawFog();
}

function setStatus(text) {
  statusLineEl.textContent = text;
}

function generateMazeByDifficulty() {
  applySettingsFromUI();
  carveMaze();
  drawMaze();
  const label = DIFFICULTY_LEVELS[currentDifficulty].label;
  setStatus(`Livello ${label} • Griglia ${cols}x${rows} • Schermo ${viewMode === "full" ? "pieno" : "compatto"}`);
}

function move(dx, dy) {
  if (won) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
  if (maze[ny][nx] === 1) return;

  player.x = nx;
  player.y = ny;

  if (player.x === goal.x && player.y === goal.y) {
    won = true;
    setStatus("Livello completato! Nuovo labirinto in arrivo...");
    winBannerEl.classList.add("show");
    setTimeout(() => {
      winBannerEl.classList.remove("show");
      generateMazeByDifficulty();
    }, 850);
  }

  drawMaze();
}

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") move(0, -1);
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") move(0, 1);
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(-1, 0);
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(1, 0);
});

document.querySelectorAll(".controls button").forEach((btn) => {
  const runMove = () => {
    btn.classList.add("pressed");
    const dir = btn.dataset.dir;
    if (dir === "up") move(0, -1);
    if (dir === "down") move(0, 1);
    if (dir === "left") move(-1, 0);
    if (dir === "right") move(1, 0);
    setTimeout(() => btn.classList.remove("pressed"), 90);
  };

  btn.addEventListener("click", runMove);
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    runMove();
  });
});

mazeSizeInput.addEventListener("input", updateSizeLabel);
mazeSizeInput.addEventListener("change", generateMazeByDifficulty);
difficultySelect.addEventListener("change", generateMazeByDifficulty);
newMazeButton.addEventListener("click", generateMazeByDifficulty);

viewModeSelect.addEventListener("change", () => {
  applySettingsFromUI();
  drawMaze();
  const label = DIFFICULTY_LEVELS[currentDifficulty].label;
  setStatus(`Vista ${viewMode === "full" ? "full page" : "compatta"} • ${label} • ${cols}x${rows}`);
});

window.addEventListener("resize", () => {
  fitCanvasToViewport();
  drawMaze();
});

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    pwaStatusEl.textContent = "PWA not supported";
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("./service-worker.js");
    pwaStatusEl.textContent = "PWA active";
    registration.update();
  } catch (_error) {
    pwaStatusEl.textContent = "PWA registration failed";
  }
}

updateSizeLabel();
generateMazeByDifficulty();
registerServiceWorker();
