import './style.css';
import { gameState } from './game/state/gameState';
import { createOverlayController, registerOverlayController } from './game/ui/overlay';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root non trovato.');
}

app.innerHTML = `
  <div class="page-shell">
    <aside class="info-panel">
      <p class="eyebrow">Biella, favori minori e grandi opinioni</p>
      <h1>Via Italia Simulator</h1>
      <p class="lede">
        Un prototipo giocabile ambientato nel tratto pedonale piu chiacchierato della citta.
        Passeggia, parla con l'Assessore del Decoro e inaugura il primo micro-dramma civico.
      </p>

      <section class="card">
        <h2>Loop iniziale</h2>
        <ul class="bullet-list">
          <li>Cammina con <strong>WASD</strong> o frecce.</li>
          <li>Interagisci con <strong>E</strong>.</li>
          <li>Attiva una missione e chiudila tornando dal personaggio.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Missioni e stato</h2>
        <div id="quest-log" class="quest-log"></div>
      </section>
    </aside>

    <section class="stage-panel">
      <div id="game-root" class="game-root"></div>
      <div id="prompt-chip" class="prompt-chip hidden"></div>
      <div id="toast-stack" class="toast-stack"></div>

      <div id="dialogue-panel" class="dialogue-panel hidden">
        <div class="dialogue-card">
          <p id="dialogue-speaker" class="dialogue-speaker"></p>
          <p id="dialogue-text" class="dialogue-text"></p>
          <div id="dialogue-choices" class="dialogue-choices"></div>
        </div>
      </div>
    </section>
  </div>
`;

const questLog = document.querySelector<HTMLDivElement>('#quest-log');
const promptChip = document.querySelector<HTMLDivElement>('#prompt-chip');
const toastStack = document.querySelector<HTMLDivElement>('#toast-stack');
const dialoguePanel = document.querySelector<HTMLDivElement>('#dialogue-panel');
const dialogueSpeaker = document.querySelector<HTMLParagraphElement>('#dialogue-speaker');
const dialogueText = document.querySelector<HTMLParagraphElement>('#dialogue-text');
const dialogueChoices = document.querySelector<HTMLDivElement>('#dialogue-choices');

if (
  !questLog ||
  !promptChip ||
  !toastStack ||
  !dialoguePanel ||
  !dialogueSpeaker ||
  !dialogueText ||
  !dialogueChoices
) {
  throw new Error('Overlay UI incompleta.');
}

const overlayController = createOverlayController({
  questLog,
  promptChip,
  toastStack,
  dialoguePanel,
  dialogueSpeaker,
  dialogueText,
  dialogueChoices,
});

registerOverlayController(overlayController);
gameState.subscribe((snapshot) => {
  overlayController.renderSnapshot(snapshot);
});

async function bootGame(): Promise<void> {
  const [{ default: Phaser }, { BootScene }, { StreetScene }] = await Promise.all([
    import('phaser'),
    import('./game/scenes/BootScene'),
    import('./game/scenes/StreetScene'),
  ]);

  const config: import('phaser').Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-root',
    backgroundColor: '#efe0c1',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, StreetScene],
  };

  new Phaser.Game(config);
}

void bootGame();
