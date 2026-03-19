import type { ConditionSet, GameSnapshot, QuestDefinition, QuestSnapshot } from '../types';

type SnapshotListener = (snapshot: GameSnapshot) => void;

class GameState {
  private readonly flags = new Set<string>();
  private readonly quests = new Map<string, QuestSnapshot>();
  private readonly listeners = new Set<SnapshotListener>();

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  matchesConditions(conditions: ConditionSet): boolean {
    const requiredFlags = conditions.requiredFlags ?? [];
    const absentFlags = conditions.absentFlags ?? [];

    return (
      requiredFlags.every((flag) => this.flags.has(flag)) &&
      absentFlags.every((flag) => !this.flags.has(flag))
    );
  }

  setFlag(flag: string): void {
    if (this.flags.has(flag)) {
      return;
    }

    this.flags.add(flag);
    this.notify();
  }

  startQuest(definition: QuestDefinition): boolean {
    if (this.quests.has(definition.id)) {
      return false;
    }

    this.quests.set(definition.id, {
      ...definition,
      currentStep: 0,
      completed: false,
    });
    this.notify();
    return true;
  }

  advanceQuest(questId: string): boolean {
    const quest = this.quests.get(questId);

    if (!quest || quest.completed) {
      return false;
    }

    const nextStep = quest.currentStep + 1;
    quest.currentStep = nextStep;
    quest.completed = nextStep >= quest.steps.length;
    this.notify();
    return true;
  }

  getQuest(questId: string): QuestSnapshot | undefined {
    const quest = this.quests.get(questId);

    return quest
      ? {
          ...quest,
          steps: [...quest.steps],
        }
      : undefined;
  }

  getSnapshot(): GameSnapshot {
    return {
      flags: [...this.flags],
      quests: [...this.quests.values()].map((quest) => ({
        ...quest,
        steps: [...quest.steps],
      })),
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }
}

export const gameState = new GameState();
