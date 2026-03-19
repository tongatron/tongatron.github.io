import { dialogueNodes } from '../content/dialogues';
import { gameState } from '../state/gameState';
import type { DialogueChoice, DialogueRoot, DialogueView } from '../types';
import { advanceQuest, startQuest } from './questSystem';

interface DialogueResolution {
  close: boolean;
  nextDialogue: DialogueView | null;
  notifications: string[];
}

function buildDialogue(nodeId: string): DialogueView {
  const node = dialogueNodes[nodeId];

  if (!node) {
    throw new Error(`Nodo dialogo sconosciuto: ${nodeId}`);
  }

  return {
    nodeId: node.id,
    speaker: node.speaker,
    text: node.text,
    choices: node.choices
      .filter((choice) => gameState.matchesConditions(choice))
      .map((choice) => ({
        id: choice.id,
        label: choice.label,
      })),
  };
}

function getChoice(nodeId: string, choiceId: string): DialogueChoice {
  const node = dialogueNodes[nodeId];

  if (!node) {
    throw new Error(`Nodo dialogo sconosciuto: ${nodeId}`);
  }

  const choice = node.choices.find((entry) => entry.id === choiceId);

  if (!choice) {
    throw new Error(`Scelta dialogo sconosciuta: ${choiceId}`);
  }

  return choice;
}

function applyEffects(choice: DialogueChoice): string[] {
  const notifications: string[] = [];
  const effects = choice.effects;

  if (!effects) {
    return notifications;
  }

  if (effects.startQuestId) {
    notifications.push(...startQuest(effects.startQuestId));
  }

  if (effects.advanceQuestId) {
    notifications.push(...advanceQuest(effects.advanceQuestId));
  }

  for (const flag of effects.setFlags ?? []) {
    gameState.setFlag(flag);
  }

  if (effects.notification) {
    notifications.push(effects.notification);
  }

  return notifications;
}

export function beginDialogue(roots: DialogueRoot[]): DialogueView {
  const root = roots.find((candidate) => gameState.matchesConditions(candidate)) ?? roots[0];

  if (!root) {
    throw new Error('NPC senza root di dialogo.');
  }

  return buildDialogue(root.nodeId);
}

export function resolveDialogueChoice(nodeId: string, choiceId: string): DialogueResolution {
  const choice = getChoice(nodeId, choiceId);
  const notifications = applyEffects(choice);

  if (!choice.nextNodeId) {
    return {
      close: choice.closeDialogue ?? true,
      nextDialogue: null,
      notifications,
    };
  }

  return {
    close: choice.closeDialogue ?? false,
    nextDialogue: buildDialogue(choice.nextNodeId),
    notifications,
  };
}
