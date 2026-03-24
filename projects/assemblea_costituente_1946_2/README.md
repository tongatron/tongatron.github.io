# Atlante delle elezioni italiane

Pagina statica pensata per GitHub Pages che rende navigabili i risultati storici di:

- Assemblea Costituente
- Camera dei deputati
- Senato della Repubblica

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
2. individua gli ZIP di `assemblea_costituente`, `camera` e `senato`;
3. aggrega i voti di lista a livello nazionale;
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

La pagina usa i file territoriali con voti di lista disponibili nel catalogo. Per alcune elezioni recenti non sono inclusi estero e alcuni collegi speciali pubblicati in file separati senza voti di lista direttamente confrontabili.
