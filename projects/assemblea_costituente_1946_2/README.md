# Atlante delle elezioni italiane

Pagina statica pensata per GitHub Pages che rende navigabili i risultati storici di:

- Assemblea Costituente
- Camera dei deputati
- Senato della Repubblica
- Referendum
- Elezioni provinciali
- Elezioni comunali

La UI include ricerca liste (su tutti i tipi elettorali), ricerca candidati (quando presenti nel dataset), navigazione rapida tra tornate e grafici sintetici per tipo elettorale.

I dati provengono dal catalogo open data di Eligendo:

- https://elezionistorico.interno.gov.it/eligendo/opendata.php

## Come rigenerare i dati

Prerequisiti:

- Node.js 18+
- `unzip` disponibile nel terminale
- dipendenze installate (`npm install`)

Comando:

```bash
node scripts/build-data.mjs
```

Lo script:

1. scarica il catalogo ufficiale;
2. individua gli ZIP di `assemblea_costituente`, `camera`, `senato`, `referendum`, `provinciali` e `comunali`;
3. aggrega a livello nazionale i voti di lista (e per i referendum le opzioni `SI`/`NO` per quesito);
4. quando disponibili, aggrega anche i voti candidati;
5. scrive `data/elections.json`.

Gli ZIP vengono cacheati in `.cache/`.

## Avvio locale

Serve un server statico locale, per esempio:

```bash
python3 -m http.server 4173
```

Poi apri:

```text
http://localhost:4173
```

## Nota sui dati

La pagina usa i file territoriali disponibili nel catalogo (`txt`, `csv`, `xlsx`), includendo anche i pacchetti più recenti pubblicati solo in formato Excel e, dove possibile, aggregazioni candidati (top 400 per elezione per limitare il peso del JSON). Restano escluse alcune sezioni speciali/estero non confrontabili in modo uniforme.
