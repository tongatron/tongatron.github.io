#include "Robottino.h"        // specifichiamo quale dispositivo è collegato alla scheda Arduino

Robottino Peppino;            //nominiamo l'oggetto robottino, possible il nome a condizione di sostituirlo dappertutto

void setup() {
  Peppino.begin();            // diciamo al robot di "cominciare" 
}

void loop() {
  Peppino.beep(250);          // il robot è cimito, bisogna fargli suonare il beep per ricordargli di leggere il sensore
  Peppino.leggiDistanza();    // legge la distanza col sensore a ultrasuoni
  
  if (oggettoVicino()) {                      // se viene rilevato un oggetto a meno di 20 cm
    Peppino.cominciaAContare();               // il robottino comincia a contare
    while ( secondiTrascorsiMinoriDi (5) ) {  // ed esegue per 5 secondi il ciclo while sottostante:
      Peppino.naso(blu);                      // NASO
      //Peppino.espressione(felice);          // ESPRESSIONE  
      //Peppino.ruota(impazzito);             // ROTAZIONE  
    }
  }
  
  else {                                      // altrimenti, ovvero nel caso in cui non venga rilevato alcun oggetto
    Peppino.naso(verde);                      // NASO
    //Peppino.espressione(neutra);            // ESPRESSIONE
    //Peppino.ruota(lento);                   // ROTAZIONE
  }
}
