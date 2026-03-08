#include "../../Robottino.h"

Robottino Peppino;

void setup() {
  Peppino.begin();
}

void loop() {
  Peppino.naso(blu);         // LED RGB del naso acceso blu
  Peppino.espressione(felice); // sorriso sul display
}
