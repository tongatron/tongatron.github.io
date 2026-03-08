# ROBOTTINO - libreria Arduino

Libreria Arduino per controllare il robot Robottino.

## Il robot
**Attuatori**
- TESTA ROTANTE (motore servo)
- SUONI (piezo)
- NASO (LED RGB)
- BOCCA (display OLED)

**Sensori**
- SENSORI DI LUCE (LDR)
- SENSORE DI DISTANZA (ultrasuoni)

## Installazione
1. Installa l'ultima versione dell'**Arduino IDE**: [arduino.cc/en/software](https://www.arduino.cc/en/software)
2. Installa la libreria **u8glib**:
   In Arduino IDE: `Sketch > Include Library > Manage Libraries...` e cerca `u8glib`.
3. Installa questa libreria:
   Scarica lo ZIP del repository da GitHub e usa `Sketch > Include Library > Add .ZIP Library...`.
   In alternativa copia `Software/Robottino-ArduinoLibrary` nella cartella `libraries` di Arduino.

## Hello World
```arduino
#include "Robottino.h"
Robottino Peppino;

void setup() {
  Peppino.begin();
}

void loop() {
  Peppino.naso(verde);
  Peppino.espressione(felice);
  Peppino.beep(silenzio);
  Peppino.ruota(lento);
}
```

## Reference
[github.com/FablabTorino/Robottino/wiki/Reference](https://github.com/FablabTorino/Robottino/wiki/Reference)

## Pinout
Componente | PIN
----------- | ---
Buzzer | 13
LED Red | 11
LED Green | 10
LED Blue | 9
Servo Motor | 8
Ultrasonic Trigger | 7
Ultrasonic Echo | 4
Right LDR | A0
Left LDR | A1

## Credits
Hanno contribuito al software:
- Carmine Paolino - [github.com/cancelliere](https://github.com/cancelliere)
- Giovanni Bindi - [github.com/tongatron](https://github.com/tongatron)
- Fedele Tagarelli - [github.com/tagaf](https://github.com/tagaf)

## Licenza
[Creative Commons: Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/)

powered by [Tongatron](http://tongatron.it/)  
hosted and developed in [Fablab Torino](http://fablabtorino.org/)
