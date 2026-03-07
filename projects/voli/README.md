# Voli da Torino (Ryanair API)

Pagina web che mostra, in ordine di data, i voli economici da Torino (`TRN`) verso gli aeroporti Ryanair raggiungibili, con ritorno dopo circa 5 giorni.

## Come funziona

- Scarica i prezzi giornalieri tramite endpoint `cheapestPerDay`.
- Combina andata + ritorno scegliendo il rientro piu economico entro `durata target ± tolleranza`.
- Permette il filtro destinazione con opzione `Tutti gli aeroporti raggiungibili`.
- Filtra solo le opzioni entro la `spesa massima A/R` impostata nei filtri.
- Mostra il giorno della settimana nelle date dei voli.
- Supporta due viste risultati: `Lista` (con dettaglio al click) e `Schede` (cards complete).

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
