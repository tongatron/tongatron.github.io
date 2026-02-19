# Memory PWA

A lightweight, mobile-friendly Memory game built as a Progressive Web App (PWA).

Test: https://tongatron.github.io/memory-pwa/

## Game Features

- Classic card-matching gameplay with animated card flips.
- Matrix size selector (dropdown):
  - `4x4`
  - `4x5`
  - `4x6`
  - `4x7`
- Responsive grid behavior:
  - Desktop: horizontal layout
  - Mobile: vertical layout
- Live game stats:
  - Move counter
  - Timer
- End-of-game popup with:
  - Selected matrix
  - Number of moves
  - Elapsed time
  - "New record!" badge when a matrix record is beaten
- Celebration effect on win (confetti animation).

## Records System

- Local best records are stored per matrix (`4x4`, `4x5`, `4x6`, `4x7`).
- Record logic:
  - Lower move count is better.
  - If moves are equal, lower time is better.
- Records can be viewed and reset from the in-app modal.

## PWA Features

- Installable on supported devices/browsers.
- Service Worker caching for offline support.
- Versioned cache strategy for controlled updates.
- In-app update prompt when a new service worker is available.

## Tech Notes

- Vanilla HTML, CSS, and JavaScript.
- No external framework required.
- Optimized for quick loading and simple deployment.
