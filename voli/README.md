# Voli economici Torino -> Londra (Ryanair API)

Pagina web che mostra, in ordine di data, i voli piu economici da Torino (`TRN`) a Londra Stansted (`STN`), con ritorno dopo circa 5 giorni.

## Come funziona

- Scarica i prezzi giornalieri tramite endpoint `cheapestPerDay`.
- Combina andata + ritorno scegliendo il rientro piu economico entro `durata target ± tolleranza`.
- Mantiene la soluzione piu economica per ogni data di partenza.
- Filtra solo le opzioni con prezzo totale sotto `70€`.
- Mostra i risultati ordinati per data e apre i dettagli voli al click sulla riga.

## Avvio locale

Dalla cartella del progetto:

```bash
python3 -m http.server 8080
```

Poi apri:

- [http://localhost:8080](http://localhost:8080)

## Note

- I prezzi cambiano spesso: i risultati sono in tempo reale al momento della richiesta.
- Le API Ryanair usate sono endpoint pubblici non ufficialmente documentati e possono cambiare nel tempo.
