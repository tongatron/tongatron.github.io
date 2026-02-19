# Connect Four Web Game

A browser-based Connect Four game inspired by the classic original interface, with a human player vs computer AI.

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
  - Quick restart with “Nuova partita”.
  - Difficulty switch from the top bar (starts a new match).
- Responsive layout:
  - Adapts to desktop and mobile screens.
  - Board scales to fit browser viewport height.

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

- Single-file app: `index.html`
- Vanilla HTML, CSS, and JavaScript (no external dependencies)

## Run Locally

1. Open `index.html` in any modern web browser.
2. Enter your name, choose a difficulty, and press **Gioca**.

## Project Structure

- `index.html`: full UI, game logic, and AI implementation.
- `README.md`: project overview and feature documentation.
