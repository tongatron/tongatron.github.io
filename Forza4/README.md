# Connect Four Web Game

A browser-based Connect Four game inspired by the classic original interface, with a human player vs computer AI.
Current version: `0.1.0`.

## Features

- Classic 7x6 Connect Four board.
- Visual style inspired by the original game:
  - Blue board with circular slots.
  - Red discs for the player and yellow discs for the computer.
  - Winning discs highlight animation.
- Player setup before starting:
  - Name input.
  - Selectable AI difficulty: `low`, `middle`, `high`.
- In-game controls:
  - Column buttons to drop discs.
  - Quick restart with “New Game”.
  - Difficulty switch from the top bar (starts a new match).
- Responsive layout:
  - Adapts to desktop and mobile screens.
  - Board scales to fit browser viewport height.
- PWA support:
  - Installable web app (manifest + service worker).
  - Offline fallback page.
  - Versioned cache (`connect-four-0.1.0`).

## Game Rules

- The player (red) moves first.
- The computer (yellow) responds after each player move.
- Win condition: connect 4 discs in a row:
  - Horizontally
  - Vertically
  - Diagonally
- If the board fills with no winner, the match ends in a draw.

## AI Difficulty Levels

- `low`:
  - Random valid moves.
- `middle`:
  - Tries immediate win moves.
  - Tries to block the player's immediate winning move.
  - Otherwise uses semi-random center-weighted choices.
- `high`:
  - Tries immediate win/block first.
  - Then uses Minimax with Alpha-Beta pruning (depth 5).
  - Evaluates board patterns (center control and line potential).

## Tech Stack

- Vanilla HTML, CSS, and JavaScript (no external dependencies)

## Run Locally

1. Run a local web server in the project folder (for example: `python3 -m http.server 8080`).
2. Open [http://localhost:8080](http://localhost:8080) in a modern browser.
3. Enter your name, choose a difficulty, and press **Play**.

Note: PWA installation and service workers require `https` or `localhost` (not `file://`).

## Project Structure

- `index.html`: main HTML layout and PWA meta.
- `style.css`: game and layout styles.
- `script.js`: game logic, AI, and service worker registration.
- `manifest.webmanifest`: PWA manifest (v0.1.0).
- `sw.js`: service worker with versioned caching.
- `offline.html`: fallback page for offline navigation.
- `assets/icons/icon.svg`: app icon.
- `README.md`: project overview and feature documentation.
