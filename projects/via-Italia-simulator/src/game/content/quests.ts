import type { QuestDefinition } from '../types';

export const questDefinitions: Record<string, QuestDefinition> = {
  operazione_manifesti: {
    id: 'operazione_manifesti',
    title: 'Operazione Manifesti',
    summary:
      "L'Assessore del Decoro sospetta che il destino civico di Via Italia dipenda da una bacheca comunale lasciata a se stessa.",
    steps: [
      'Controlla la bacheca comunale in fondo alla passeggiata.',
      "Torna dall'Assessore del Decoro con un resoconto credibile.",
    ],
    rewardText: 'Ricompensa: stima tiepida del municipio e reputazione da persona affidabile.',
  },
};
