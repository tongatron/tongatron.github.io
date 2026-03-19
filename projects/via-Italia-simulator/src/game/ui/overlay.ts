import type { DialogueView, GameSnapshot } from '../types';

interface OverlayElements {
  questLog: HTMLDivElement;
  promptChip: HTMLDivElement;
  toastStack: HTMLDivElement;
  dialoguePanel: HTMLDivElement;
  dialogueSpeaker: HTMLParagraphElement;
  dialogueText: HTMLParagraphElement;
  dialogueChoices: HTMLDivElement;
}

export interface OverlayController {
  renderSnapshot(snapshot: GameSnapshot): void;
  setPrompt(prompt: string | null): void;
  showDialogue(dialogue: DialogueView, onChoice: (choiceId: string) => void): void;
  hideDialogue(): void;
  pushToast(message: string): void;
}

let overlayController: OverlayController | null = null;

function createQuestMarkup(snapshot: GameSnapshot): string {
  if (snapshot.quests.length === 0) {
    return `
      <p class="quest-empty">
        Nessuna missione attiva. Avvicinati all'Assessore del Decoro e ascolta la sua emergenza amministrativa.
      </p>
    `;
  }

  return snapshot.quests
    .map((quest) => {
      const statusLabel = quest.completed ? 'Chiusa' : 'Attiva';
      const stepMarkup = quest.steps
        .map((step, index) => {
          const isDone = quest.completed || index < quest.currentStep;
          const isActive = !quest.completed && index === quest.currentStep;
          const className = [
            'quest-step',
            isDone ? 'is-done' : '',
            isActive ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `<li class="${className}">${step}</li>`;
        })
        .join('');

      return `
        <article class="quest-card">
          <div class="quest-card-header">
            <h3>${quest.title}</h3>
            <span class="quest-status ${quest.completed ? 'is-complete' : ''}">${statusLabel}</span>
          </div>
          <p class="quest-summary">${quest.summary}</p>
          <ol class="quest-steps">${stepMarkup}</ol>
          <p class="quest-reward">${quest.rewardText}</p>
        </article>
      `;
    })
    .join('');
}

export function createOverlayController(elements: OverlayElements): OverlayController {
  return {
    renderSnapshot(snapshot) {
      elements.questLog.innerHTML = createQuestMarkup(snapshot);
    },

    setPrompt(prompt) {
      if (!prompt) {
        elements.promptChip.classList.add('hidden');
        elements.promptChip.textContent = '';
        return;
      }

      elements.promptChip.textContent = `E - ${prompt}`;
      elements.promptChip.classList.remove('hidden');
    },

    showDialogue(dialogue, onChoice) {
      elements.dialogueSpeaker.textContent = dialogue.speaker;
      elements.dialogueText.textContent = dialogue.text;
      elements.dialogueChoices.replaceChildren();

      dialogue.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = choice.label;
        button.addEventListener('click', () => {
          onChoice(choice.id);
        });
        elements.dialogueChoices.append(button);
      });

      elements.dialoguePanel.classList.remove('hidden');
    },

    hideDialogue() {
      elements.dialoguePanel.classList.add('hidden');
      elements.dialogueChoices.replaceChildren();
    },

    pushToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      elements.toastStack.prepend(toast);

      window.setTimeout(() => {
        toast.remove();
      }, 3200);
    },
  };
}

export function registerOverlayController(controller: OverlayController): void {
  overlayController = controller;
}

export function getOverlayController(): OverlayController {
  if (!overlayController) {
    throw new Error('Overlay controller non registrato.');
  }

  return overlayController;
}
