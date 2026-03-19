import type { DialogueNode } from '../types';

export const dialogueNodes: Record<string, DialogueNode> = {
  assessore_intro: {
    id: 'assessore_intro',
    speaker: 'Assessore del Decoro',
    text:
      "Finalmente una persona che cammina con intenzione. Ho bisogno di un volontario per una missione essenziale: capire se la bacheca comunale stia ancora fingendo di essere ordinata.",
    choices: [
      {
        id: 'accept_quest',
        label: 'Accetto. In questa citta qualcuno deve pur osservare i manifesti.',
        nextNodeId: 'assessore_briefing',
        effects: {
          startQuestId: 'operazione_manifesti',
          setFlags: ['manifesti_accepted'],
        },
      },
      {
        id: 'decline_quest',
        label: 'Passo. Oggi ho in agenda solo una passeggiata teatrale.',
        closeDialogue: true,
      },
    ],
  },
  assessore_briefing: {
    id: 'assessore_briefing',
    speaker: 'Assessore del Decoro',
    text:
      "Eccellente. Raggiungi la bacheca laggiu, valuta la situazione con gravita istituzionale e poi torna da me. Se noti sovrapposizioni abusive, fingi comunque di sapere cosa stai facendo.",
    choices: [
      {
        id: 'leave_for_quest',
        label: 'Vado. Portero ordine, o almeno un resoconto convinto.',
        closeDialogue: true,
      },
    ],
  },
  assessore_in_progress: {
    id: 'assessore_in_progress',
    speaker: 'Assessore del Decoro',
    text:
      'Le affissioni non si autovalutano. La bacheca ti aspetta e io pure, con una pazienza amministrativa molto limitata.',
    choices: [
      {
        id: 'continue_quest',
        label: "Ricevuto. Vado a controllare l'epicentro del decoro.",
        closeDialogue: true,
      },
    ],
  },
  assessore_turn_in: {
    id: 'assessore_turn_in',
    speaker: 'Assessore del Decoro',
    text:
      'Hai visto la bacheca? Parla con precisione, o almeno con il tono di chi ha letto due righe e ne ha tratto una teoria urbanistica.',
    choices: [
      {
        id: 'complete_quest',
        label: 'Confermo: tre volantini storti, un evento improbabile e un caos gestibile.',
        nextNodeId: 'assessore_complete',
        effects: {
          advanceQuestId: 'operazione_manifesti',
          setFlags: ['manifesti_resolved'],
        },
      },
      {
        id: 'not_yet',
        label: 'Sto ancora indagando. Voglio un quadro drammatico completo.',
        closeDialogue: true,
      },
    ],
  },
  assessore_complete: {
    id: 'assessore_complete',
    speaker: 'Assessore del Decoro',
    text:
      "Ottimo lavoro. Non hai risolto l'urbanistica, ma hai prodotto qualcosa di quasi piu raro: un aggiornamento utile. Per oggi posso definire Via Italia sotto controllo.",
    choices: [
      {
        id: 'close_complete',
        label: 'Perfetto. Continuero a presidiare il buon gusto civico.',
        closeDialogue: true,
      },
    ],
  },
  assessore_post_quest: {
    id: 'assessore_post_quest',
    speaker: 'Assessore del Decoro',
    text:
      'Da quando sei intervenuto, guardo la bacheca con serenita professionale. Se continui cosi rischi perfino una delega non richiesta.',
    choices: [
      {
        id: 'close_post_quest',
        label: 'Meglio non provocare il destino amministrativo.',
        closeDialogue: true,
      },
    ],
  },
};
