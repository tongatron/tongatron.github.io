export interface ConditionSet {
  requiredFlags?: string[];
  absentFlags?: string[];
}

export interface QuestDefinition {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  rewardText: string;
}

export interface QuestSnapshot extends QuestDefinition {
  currentStep: number;
  completed: boolean;
}

export interface GameSnapshot {
  flags: string[];
  quests: QuestSnapshot[];
}

export interface DialogueEffect {
  startQuestId?: string;
  advanceQuestId?: string;
  setFlags?: string[];
  notification?: string;
}

export interface DialogueChoice extends ConditionSet {
  id: string;
  label: string;
  nextNodeId?: string;
  closeDialogue?: boolean;
  effects?: DialogueEffect;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueRoot extends ConditionSet {
  nodeId: string;
}

export interface DialogueView {
  nodeId: string;
  speaker: string;
  text: string;
  choices: Array<{
    id: string;
    label: string;
  }>;
}

export interface NPCDefinition {
  id: string;
  name: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  roots: DialogueRoot[];
}

export interface PropAction {
  type: 'advanceQuest';
  questId: string;
  setFlags?: string[];
  notification: string;
}

export interface PropDefinition extends ConditionSet {
  id: string;
  name: string;
  prompt: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  action: PropAction;
}
