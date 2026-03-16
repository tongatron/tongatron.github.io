# PS Torino

PWA statica pensata per GitHub Pages, pubblicata sotto `projects/PS-Torino/`.

## Stato attuale

La PWA ora usa come sorgente primaria `data/live-torino.json`, generato da uno scraper e aggiornato da GitHub Actions.

Ordine di fallback del frontend:

1. `data/live-torino.json`
2. `apiBaseUrl` esterno, se configurato
3. cache locale dell'ultimo snapshot
4. `data/mock-torino.json`

## apiBaseUrl corretto

Nel repository attuale il valore corretto in `config.js` e:

```js
apiBaseUrl: ""
```

Motivo: GitHub Pages non esegue backend Laravel/PHP, e ora il progetto pubblica uno snapshot statico aggiornato via workflow. Fino a quando non deployi un servizio esterno, l'app deve usare quello invece di puntare a un URL fittizio.

Quando il backend esistera, sostituisci il valore con un URL `https://.../api` realmente raggiungibile, per esempio:

```js
apiBaseUrl: "https://ps-torino-api.tuodominio.it/api"
```

L'endpoint atteso dal frontend e:

```text
GET {apiBaseUrl}/piemonte/torino
```

Il payload puo essere:

- un array diretto
- oppure un oggetto con `data`
- oppure un oggetto con `hospitals`
- oppure un oggetto con `items`

## Scraper locale

Lo scraper e in `scripts/scrape-ps-torino.js`.

Esecuzione manuale:

```bash
node scripts/scrape-ps-torino.js
```

Output:

```text
data/live-torino.json
```

## Sorgenti live attuali

- Citta della Salute e della Scienza di Torino, pagina ufficiale con iframe dei presidi: [Situazione Pazienti in Pronto Soccorso](https://www.cittadellasalute.to.it/index.php?option=com_content&view=article&id=6786:situazione-pazienti-in-pronto-soccorso&catid=165:pronto-soccorso&Itemid=372)
- Endpoint JSON usati per i presidi Molinette, CTO, Sant'Anna e Regina Margherita:
  - [Molinette](https://listeps.cittadellasalute.to.it/gtotal.php?id=01090101)
  - [CTO](https://listeps.cittadellasalute.to.it/gtotal.php?id=01090201)
  - [Sant'Anna](https://listeps.cittadellasalute.to.it/gtotal.php?id=01090301)
  - [Regina Margherita](https://listeps.cittadellasalute.to.it/gtotal.php?id=01090302)
- Mauriziano, pagina ufficiale renderizzata server-side: [Pazienti in attesa presso Pronto Soccorso](https://www.mauriziano.it/i-nostri-servizi/pazienti-in-attesa-presso-pronto-soccorso)

## Workflow GitHub Actions

Workflow previsto in root repo:

```text
.github/workflows/ps-torino-live-snapshot.yml
```

Fa questo:

1. esegue lo scraper
2. aggiorna `projects/PS-Torino/data/live-torino.json`
3. committa e pusha solo se il file cambia

Trigger:

- `workflow_dispatch`
- schedule ogni 15 minuti

## Mini Checklist GitHub Pages

1. Verifica che i file della PWA siano nella cartella `projects/PS-Torino/`.
2. Pubblica il branch corretto su GitHub e assicurati che GitHub Pages serva il repository `tongatron.github.io` su HTTPS.
3. Apri l'URL finale esatto: `https://tongatron.github.io/projects/PS-Torino/`.
4. Controlla che si carichino `manifest.webmanifest` e `service-worker.js` senza `404`.
5. Verifica che `data/live-torino.json` risponda con `200`.
6. Controlla che la UI mostri `Fonte: Snapshot live (GitHub Actions)` dopo il deploy del workflow.
7. Se aggiorni file JS/CSS e il browser mostra ancora la versione vecchia, svuota i dati del sito o chiudi/riapri la PWA installata: il service worker mantiene cache locali.

## Checklist Backend Esterno

1. Deploya il backend Laravel su un host HTTPS esterno a GitHub Pages.
2. Espone `GET /api/piemonte/torino` con `Content-Type: application/json`.
3. Abilita CORS almeno per `https://tongatron.github.io`.
4. Restituisci campi coerenti con il mapping in `api.js`: `name|nome`, `address|indirizzo`, `red|rosso`, `yellow|giallo|arancione`, `green|verde|azzurro`, `white|bianco`, `updatedAt`.
5. Aggiorna `apiBaseUrl` in `config.js` con l'host reale del backend.
6. Esegui un test reale da browser su GitHub Pages e conferma che lo stato passi da `Snapshot live` o `Cache locale` a `Online`.

## Fonti verificate

- La Regione Piemonte parla della "visualizzazione online delle liste d'attesa nei Dea" come obiettivo di piattaforma, non come API pubblica regionale gia documentata: [Regione Piemonte, 2023](https://www.regione.piemonte.it/web/pinforma/notizie/2023-anno-dei-progetti-sbloccati-che-diventano-concreti)
- Citta della Salute pubblica una pagina ufficiale con iframe separati per i presidi e relativi endpoint JSON lato browser: [Situazione Pazienti in Pronto Soccorso](https://www.cittadellasalute.to.it/index.php?option=com_content&view=article&id=6786:situazione-pazienti-in-pronto-soccorso&catid=165:pronto-soccorso&Itemid=372)
- Il Mauriziano pubblica la tabella renderizzata server-side con ultimo aggiornamento visibile: [Pazienti in attesa presso Pronto Soccorso](https://www.mauriziano.it/i-nostri-servizi/pazienti-in-attesa-presso-pronto-soccorso)
