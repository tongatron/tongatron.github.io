const APP_VERSION = "1.2.0";
const BASE_CANVAS_SIZE = 504;
const DIFFICULTY_LEVELS = {
  easy: { cols: 15, rows: 15, label: "Easy" },
  medium: { cols: 21, rows: 21, label: "Medium" },
  hard: { cols: 31, rows: 31, label: "Hard" },
};

const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const difficultySelect = document.getElementById("difficulty");
const newMazeButton = document.getElementById("newMaze");
const appVersionEl = document.getElementById("appVersion");
const pwaStatusEl = document.getElementById("pwaStatus");

let cols = DIFFICULTY_LEVELS.medium.cols;
let rows = DIFFICULTY_LEVELS.medium.rows;
let cellSize = 24;
let currentDifficulty = "medium";

let maze = [];
let player = { x: 1, y: 1 };
let goal = { x: cols - 2, y: rows - 2 };
let won = false;

appVersionEl.textContent = `v${APP_VERSION}`;

function applyDifficulty(level) {
  const config = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS.medium;
  currentDifficulty = level in DIFFICULTY_LEVELS ? level : "medium";
  cols = config.cols;
  rows = config.rows;
  cellSize = Math.max(10, Math.floor(BASE_CANVAS_SIZE / Math.max(cols, rows)));
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
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
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawMaze() {
  const css = getComputedStyle(document.documentElement);
  const wallColor = css.getPropertyValue("--wall");
  const pathColor = css.getPropertyValue("--path");
  const playerColor = css.getPropertyValue("--player");
  const goalColor = css.getPropertyValue("--goal");

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      drawCell(x, y, maze[y][x] === 1 ? wallColor : pathColor);
    }
  }

  drawCell(goal.x, goal.y, goalColor);
  drawCell(player.x, player.y, playerColor);
}

function generateMazeByDifficulty() {
  const selectedLevel = difficultySelect.value;
  applyDifficulty(selectedLevel);
  carveMaze();
  drawMaze();
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
    setTimeout(() => {
      const levelName = DIFFICULTY_LEVELS[currentDifficulty].label;
      alert(`You won (${levelName})! New maze.`);
      generateMazeByDifficulty();
    }, 40);
  }

  drawMaze();
}

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "ArrowUp") move(0, -1);
  if (e.key === "ArrowDown") move(0, 1);
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
});

document.querySelectorAll(".controls button").forEach((btn) => {
  const runMove = () => {
    btn.classList.add("pressed");
    const dir = btn.dataset.dir;
    if (dir === "up") move(0, -1);
    if (dir === "down") move(0, 1);
    if (dir === "left") move(-1, 0);
    if (dir === "right") move(1, 0);
    setTimeout(() => btn.classList.remove("pressed"), 80);
  };

  btn.addEventListener("click", runMove);
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    runMove();
  });
});

difficultySelect.addEventListener("change", generateMazeByDifficulty);
newMazeButton.addEventListener("click", generateMazeByDifficulty);

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

generateMazeByDifficulty();
registerServiceWorker();
