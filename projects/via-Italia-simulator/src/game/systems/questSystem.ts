import { questDefinitions } from '../content/quests';
import { gameState } from '../state/gameState';

export function startQuest(questId: string): string[] {
  const quest = questDefinitions[questId];

  if (!quest) {
    throw new Error(`Quest sconosciuta: ${questId}`);
  }

  if (!gameState.startQuest(quest)) {
    return [];
  }

  return [`Missione attivata: ${quest.title}.`];
}

export function advanceQuest(questId: string): string[] {
  const quest = questDefinitions[questId];

  if (!quest) {
    throw new Error(`Quest sconosciuta: ${questId}`);
  }

  if (!gameState.advanceQuest(questId)) {
    return [];
  }

  const snapshot = gameState.getQuest(questId);

  if (!snapshot) {
    return [];
  }

  if (snapshot.completed) {
    return [`Missione completata: ${snapshot.title}.`];
  }

  return [`Obiettivo aggiornato: ${snapshot.steps[snapshot.currentStep]}`];
}
