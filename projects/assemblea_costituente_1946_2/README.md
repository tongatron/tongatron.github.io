# Atlante delle elezioni italiane

Pagina statica pensata per GitHub Pages che rende navigabili i risultati storici di:

- Assemblea Costituente
- Camera dei deputati
- Senato della Repubblica
- Referendum
- Elezioni provinciali
- Elezioni comunali

I dati provengono dal catalogo open data di Eligendo:

- https://elezionistorico.interno.gov.it/eligendo/opendata.php

## Come rigenerare i dati

Prerequisiti:

- Node.js 18+
- `unzip` disponibile nel terminale

Comando:

```bash
node scripts/build-data.mjs
```

Lo script:

1. scarica il catalogo ufficiale;
2. individua gli ZIP di `assemblea_costituente`, `camera`, `senato`, `referendum`, `provinciali` e `comunali`;
3. aggrega a livello nazionale i voti di lista (e per i referendum le opzioni `SI`/`NO` per quesito);
4. scrive `data/elections.json`.

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

La pagina usa i file territoriali testuali/csv disponibili nel catalogo. I pacchetti pubblicati solo in formato XLSX (alcune tornate locali e alcuni referendum recenti) vengono esclusi automaticamente.
