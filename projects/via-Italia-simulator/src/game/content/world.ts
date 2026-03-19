import type { NPCDefinition, PropDefinition } from '../types';

export const worldWidth = 1600;
export const worldHeight = 900;

export const npcDefinitions: NPCDefinition[] = [
  {
    id: 'assessore_decoro',
    name: 'Assessore del Decoro',
    prompt: "Parla con l'Assessore del Decoro",
    x: 760,
    y: 430,
    width: 38,
    height: 62,
    color: 0x9f4223,
    roots: [
      {
        nodeId: 'assessore_post_quest',
        requiredFlags: ['manifesti_resolved'],
      },
      {
        nodeId: 'assessore_turn_in',
        requiredFlags: ['manifesti_accepted', 'manifesti_checked'],
        absentFlags: ['manifesti_resolved'],
      },
      {
        nodeId: 'assessore_in_progress',
        requiredFlags: ['manifesti_accepted'],
        absentFlags: ['manifesti_checked'],
      },
      {
        nodeId: 'assessore_intro',
      },
    ],
  },
];

export const propDefinitions: PropDefinition[] = [
  {
    id: 'bacheca_comunale',
    name: 'Bacheca Comunale',
    prompt: 'Esamina la bacheca comunale',
    description:
      'Un concentrato locale di volantini, comunicati, eventi minacciosi e promesse stampate in corpo 9.',
    x: 1220,
    y: 452,
    width: 82,
    height: 96,
    color: 0x2c4752,
    requiredFlags: ['manifesti_accepted'],
    absentFlags: ['manifesti_checked'],
    action: {
      type: 'advanceQuest',
      questId: 'operazione_manifesti',
      setFlags: ['manifesti_checked'],
      notification:
        'Hai ispezionato la bacheca: tre volantini storti e un evento del 2019 ancora in resistenza passiva.',
    },
  },
];
