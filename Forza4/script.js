    (() => {
      const APP_VERSION = "0.2.0";
      const COLS = 7;
      const ROWS = 6;
      const HUMAN = 1;
      const AI = 2;
      const EMPTY = 0;

      const statusEl = document.getElementById("status");
      const boardEl = document.getElementById("board");
      const colButtonsEl = document.getElementById("columnButtons");
      const appEl = document.querySelector(".app");
      const topbarEl = document.querySelector(".topbar");
      const gameWrapEl = document.querySelector(".game-wrap");
      const boardShellEl = document.querySelector(".board-shell");
      const restartBtn = document.getElementById("restartBtn");
      const difficultyTop = document.getElementById("difficultyTop");
      const versionTagEl = document.getElementById("versionTag");

      let grid = [];
      let cells = [];
      let gameOver = false;
      let currentPlayer = HUMAN;
      let playerName = "Player";
      let aiLevel = "middle";
      let winningCoords = [];
      let aiThinking = false;

      function createEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
      }

      function buildBoardUI() {
        boardEl.innerHTML = "";
        colButtonsEl.innerHTML = "";
        cells = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

        for (let c = 0; c < COLS; c += 1) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "col-btn";
          btn.textContent = String(c + 1);
          btn.setAttribute("aria-label", `Column ${c + 1}`);
          btn.addEventListener("click", () => handleMove(c));
          colButtonsEl.appendChild(btn);
        }

        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS; c += 1) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);

            const disc = document.createElement("div");
            disc.className = "disc";
            cell.appendChild(disc);

            cells[r][c] = disc;
            boardEl.appendChild(cell);
          }
        }

        fitBoardToViewport();
      }

      function fitBoardToViewport() {
        const appStyle = getComputedStyle(appEl);
        const appPadY = (parseFloat(appStyle.paddingTop) || 0) + (parseFloat(appStyle.paddingBottom) || 0);
        const appGap = parseFloat(appStyle.gap) || 0;
        const gameWrapStyle = getComputedStyle(gameWrapEl);
        const gameWrapPadY =
          (parseFloat(gameWrapStyle.paddingTop) || 0) + (parseFloat(gameWrapStyle.paddingBottom) || 0);
        const boardStyle = getComputedStyle(boardEl);
        const boardGap = parseFloat(boardStyle.gap) || 0;
        const boardPadX = (parseFloat(boardStyle.paddingLeft) || 0) + (parseFloat(boardStyle.paddingRight) || 0);
        const boardPadY = (parseFloat(boardStyle.paddingTop) || 0) + (parseFloat(boardStyle.paddingBottom) || 0);
        const boardBorders = 4;
        const colButtonsHeight = colButtonsEl.offsetHeight;
        const availableHeight =
          window.innerHeight - appPadY - topbarEl.offsetHeight - appGap - gameWrapPadY - colButtonsHeight - 8;
        const usableHeight = Math.max(210, availableHeight);
        const cellSize = (usableHeight - boardPadY - boardBorders - boardGap * (ROWS - 1)) / ROWS;
        const boardWidthByHeight = cellSize * COLS + boardGap * (COLS - 1) + boardPadX + boardBorders;
        const widthFromViewport = window.innerWidth * 0.95;
        const finalWidth = Math.max(280, Math.min(760, widthFromViewport, boardWidthByHeight));
        boardShellEl.style.width = `${finalWidth}px`;
      }

      function resetGame() {
        grid = createEmptyBoard();
        gameOver = false;
        currentPlayer = HUMAN;
        winningCoords = [];
        aiThinking = false;
        renderGrid();
        updateColumnButtons();
        setStatus(`${playerName}, your turn.`);
      }

      function setStatus(msg) {
        statusEl.textContent = msg;
      }

      function updateColumnButtons() {
        const buttons = Array.from(colButtonsEl.querySelectorAll(".col-btn"));
        for (let c = 0; c < COLS; c += 1) {
          const full = grid[0][c] !== EMPTY;
          buttons[c].disabled = gameOver || full || currentPlayer !== HUMAN || aiThinking;
        }
      }

      function renderGrid() {
        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS; c += 1) {
            const disc = cells[r][c];
            disc.className = "disc";
            if (grid[r][c] === HUMAN) {
              disc.classList.add("player", "show");
            } else if (grid[r][c] === AI) {
              disc.classList.add("ai", "show");
            }
          }
        }

        for (const [r, c] of winningCoords) {
          cells[r][c].classList.add("win");
        }
      }

      function getAvailableRow(board, col) {
        for (let r = ROWS - 1; r >= 0; r -= 1) {
          if (board[r][col] === EMPTY) return r;
        }
        return -1;
      }

      function getValidColumns(board) {
        const cols = [];
        for (let c = 0; c < COLS; c += 1) {
          if (board[0][c] === EMPTY) cols.push(c);
        }
        return cols;
      }

      function dropPiece(board, col, piece) {
        const row = getAvailableRow(board, col);
        if (row === -1) return -1;
        board[row][col] = piece;
        return row;
      }

      function cloneBoard(board) {
        return board.map((row) => row.slice());
      }

      function findWin(board, piece) {
        const dirs = [
          [0, 1],
          [1, 0],
          [1, 1],
          [1, -1],
        ];

        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS; c += 1) {
            if (board[r][c] !== piece) continue;
            for (const [dr, dc] of dirs) {
              const coords = [[r, c]];
              let ok = true;
              for (let i = 1; i < 4; i += 1) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== piece) {
                  ok = false;
                  break;
                }
                coords.push([nr, nc]);
              }
              if (ok) return coords;
            }
          }
        }
        return null;
      }

      function isTerminal(board) {
        return Boolean(findWin(board, HUMAN) || findWin(board, AI) || getValidColumns(board).length === 0);
      }

      function evaluateWindow(window) {
        let score = 0;
        const aiCount = window.filter((x) => x === AI).length;
        const humanCount = window.filter((x) => x === HUMAN).length;
        const emptyCount = window.filter((x) => x === EMPTY).length;

        if (aiCount === 4) score += 100000;
        else if (aiCount === 3 && emptyCount === 1) score += 120;
        else if (aiCount === 2 && emptyCount === 2) score += 12;

        if (humanCount === 3 && emptyCount === 1) score -= 140;
        else if (humanCount === 2 && emptyCount === 2) score -= 10;

        return score;
      }

      function scorePosition(board) {
        let score = 0;

        const center = Math.floor(COLS / 2);
        let centerCount = 0;
        for (let r = 0; r < ROWS; r += 1) {
          if (board[r][center] === AI) centerCount += 1;
        }
        score += centerCount * 7;

        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS - 3; c += 1) {
            score += evaluateWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
          }
        }

        for (let c = 0; c < COLS; c += 1) {
          for (let r = 0; r < ROWS - 3; r += 1) {
            score += evaluateWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
          }
        }

        for (let r = 0; r < ROWS - 3; r += 1) {
          for (let c = 0; c < COLS - 3; c += 1) {
            score += evaluateWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
          }
        }

        for (let r = 0; r < ROWS - 3; r += 1) {
          for (let c = 3; c < COLS; c += 1) {
            score += evaluateWindow([board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]]);
          }
        }

        return score;
      }

      function minimax(board, depth, alpha, beta, maximizing) {
        const validCols = getValidColumns(board);
        const aiWin = findWin(board, AI);
        const humanWin = findWin(board, HUMAN);
        const terminal = aiWin || humanWin || validCols.length === 0;

        if (depth === 0 || terminal) {
          if (aiWin) return { col: null, score: 1_000_000 + depth };
          if (humanWin) return { col: null, score: -1_000_000 - depth };
          if (validCols.length === 0) return { col: null, score: 0 };
          return { col: null, score: scorePosition(board) };
        }

        let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

        if (maximizing) {
          let value = -Infinity;
          for (const col of validCols) {
            const next = cloneBoard(board);
            dropPiece(next, col, AI);
            const newScore = minimax(next, depth - 1, alpha, beta, false).score;
            if (newScore > value) {
              value = newScore;
              bestCol = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
          }
          return { col: bestCol, score: value };
        }

        let value = Infinity;
        for (const col of validCols) {
          const next = cloneBoard(board);
          dropPiece(next, col, HUMAN);
          const newScore = minimax(next, depth - 1, alpha, beta, true).score;
          if (newScore < value) {
            value = newScore;
            bestCol = col;
          }
          beta = Math.min(beta, value);
          if (alpha >= beta) break;
        }
        return { col: bestCol, score: value };
      }

      function pickAIMove(board, level) {
        const validCols = getValidColumns(board);
        if (validCols.length === 0) return -1;

        if (level === "low") {
          return validCols[Math.floor(Math.random() * validCols.length)];
        }

        for (const col of validCols) {
          const test = cloneBoard(board);
          dropPiece(test, col, AI);
          if (findWin(test, AI)) return col;
        }

        for (const col of validCols) {
          const test = cloneBoard(board);
          dropPiece(test, col, HUMAN);
          if (findWin(test, HUMAN)) return col;
        }

        if (level === "middle") {
          const centerPref = [3, 2, 4, 1, 5, 0, 6].filter((c) => validCols.includes(c));
          if (Math.random() < 0.68) {
            return centerPref[Math.floor(Math.random() * Math.min(3, centerPref.length))];
          }
          return validCols[Math.floor(Math.random() * validCols.length)];
        }

        const { col } = minimax(board, 5, -Infinity, Infinity, true);
        if (col === null || col === undefined) {
          return validCols[Math.floor(Math.random() * validCols.length)];
        }
        return col;
      }

      function finishIfEnded(lastPiece) {
        const winCoords = findWin(grid, lastPiece);
        if (winCoords) {
          gameOver = true;
          winningCoords = winCoords;
          renderGrid();
          updateColumnButtons();
          if (lastPiece === HUMAN) {
            setStatus(`${playerName} wins!`);
          } else {
            setStatus("Computer wins.");
          }
          return true;
        }

        if (getValidColumns(grid).length === 0) {
          gameOver = true;
          setStatus("Draw.");
          updateColumnButtons();
          return true;
        }

        return false;
      }

      function placeAndRender(col, piece) {
        const row = dropPiece(grid, col, piece);
        if (row === -1) return false;
        renderGrid();
        return true;
      }

      function handleMove(col) {
        if (gameOver || currentPlayer !== HUMAN || aiThinking) return;

        const moved = placeAndRender(col, HUMAN);
        if (!moved) return;

        if (finishIfEnded(HUMAN)) return;

        currentPlayer = AI;
        aiThinking = true;
        updateColumnButtons();
        setStatus("Computer is thinking...");

        window.setTimeout(() => {
          const aiCol = pickAIMove(grid, aiLevel);
          if (aiCol !== -1) {
            placeAndRender(aiCol, AI);
            if (!finishIfEnded(AI)) {
              currentPlayer = HUMAN;
              setStatus(`${playerName}, your turn.`);
            }
          }
          aiThinking = false;
          updateColumnButtons();
        }, 320);
      }

      function syncDifficultyFrom(selectEl) {
        aiLevel = selectEl.value;
        difficultyTop.value = aiLevel;
      }

      difficultyTop.addEventListener("change", () => {
        syncDifficultyFrom(difficultyTop);
        setStatus(`Difficulty set to ${aiLevel}. ${playerName}, your turn.`);
        resetGame();
      });

      restartBtn.addEventListener("click", () => {
        resetGame();
      });

      window.addEventListener("resize", fitBoardToViewport);

      buildBoardUI();
      grid = createEmptyBoard();
      renderGrid();
      updateColumnButtons();
      fitBoardToViewport();
      difficultyTop.value = "middle";
      resetGame();

      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("./sw.js").catch(() => {});
        });
      }

      document.documentElement.setAttribute("data-version", APP_VERSION);
      if (versionTagEl) {
        versionTagEl.textContent = `Version: ${APP_VERSION}`;
      }
    })();
