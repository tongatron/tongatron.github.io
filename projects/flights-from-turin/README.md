# Ryanair Flights

Web app statica per cercare voli Ryanair scegliendo aeroporto di partenza e destinazione, filtrare i risultati per durata del soggiorno e budget totale andata/ritorno, e condividere la ricerca con un link.

## Cosa fa

- legge gli aeroporti Ryanair attivi e permette di filtrare la partenza tra `Italia` e `Tutti gli aeroporti`;
- scarica i prezzi giornalieri per ogni tratta;
- combina andata + ritorno scegliendo il rientro piu conveniente entro `durata target ± tolleranza`;
- filtra i risultati per `spesa massima A/R`;
- supporta la selezione lingua `ITA / ENG`;
- salva i filtri nell'URL, cosi i risultati sono condivisibili;
- offre due viste risultati: `Lista` e `Schede`;
- puo essere installata come PWA.

## Tecnologie usate

- `HTML5` per la struttura della pagina;
- `CSS3` custom per tema, layout e componenti applicativi;
- `JavaScript` vanilla (`app.js`) per logica filtri, fetch API, rendering e internazionalizzazione;
- [`Bootstrap 5.3.8`](https://getbootstrap.com/) per griglia, componenti base e responsive layout;
- [`Bootstrap Icons 1.13.1`](https://icons.getbootstrap.com/) per le icone UI;
- [`Open Sans`](https://fonts.google.com/specimen/Open+Sans) come font principale;
- `manifest.webmanifest` + `service-worker.js` per funzionalita PWA e caching dell'app shell.

## Architettura

- non c'e un backend applicativo: la pagina interroga direttamente gli endpoint pubblici Ryanair dal browser;
- il file principale e [app.js](./app.js), che gestisce filtri, fetch dati, combinazione dei voli e rendering;
- [index.html](./index.html) contiene la UI Bootstrap;
- [styles.css](./styles.css) contiene il tema visuale custom;
- [service-worker.js](./service-worker.js) gestisce il caching dei file statici.

## API utilizzate

L'app usa endpoint pubblici Ryanair non ufficialmente documentati. Sono endpoint comodi per una web app client-side, ma possono cambiare senza preavviso.

### 1. Catalogo aeroporti attivi

Usata per recuperare l'elenco aeroporti Ryanair attivi con `iataCode`, `countryCode` e rotte disponibili.

- Endpoint reale (IT): [https://www.ryanair.com/api/views/locate/3/airports/it/active](https://www.ryanair.com/api/views/locate/3/airports/it/active)
- Endpoint reale (EN): [https://www.ryanair.com/api/views/locate/3/airports/en/active](https://www.ryanair.com/api/views/locate/3/airports/en/active)
- Nel codice: [app.js](/Users/tonga/Documents/GitHub/tongatron.github.io/projects/flights-from-turin/app.js:1)

### 2. Prezzi giornalieri piu economici per tratta

Usata per recuperare i prezzi `cheapestPerDay` mese per mese su una tratta specifica, sia per l'andata sia per il ritorno.

- Base endpoint: `https://www.ryanair.com/api/farfnd/3/oneWayFares/{departure}/{arrival}/cheapestPerDay`
- Esempio reale: [https://www.ryanair.com/api/farfnd/3/oneWayFares/TRN/STN/cheapestPerDay?outboundMonthOfDate=2026-03-01&market=it-it&currency=EUR](https://www.ryanair.com/api/farfnd/3/oneWayFares/TRN/STN/cheapestPerDay?outboundMonthOfDate=2026-03-01&market=it-it&currency=EUR)
- Parametri usati dall'app:
  - `outboundMonthOfDate`
  - `market=it-it`
  - `currency=EUR`
- Nel codice: [app.js](/Users/tonga/Documents/GitHub/tongatron.github.io/projects/flights-from-turin/app.js:2)

## Funzionamento della ricerca

1. l'app scarica il catalogo aeroporti Ryanair in italiano e inglese;
2. filtra gli aeroporti di partenza tra `Italia` e `Tutti gli aeroporti`;
3. costruisce l'elenco delle destinazioni compatibili con l'aeroporto di partenza selezionato;
4. per ogni aeroporto di destinazione selezionato recupera i prezzi giornalieri mese per mese;
5. costruisce le possibili coppie `andata + ritorno`;
6. sceglie il ritorno piu economico nella finestra `durata target ± tolleranza`;
7. calcola il `totale A/R`;
8. ordina i risultati per data di partenza;
9. aggiorna l'URL con i filtri correnti.

## Avvio in locale

Aprire `index.html` direttamente con `file://` non e consigliato, perche service worker e alcune funzionalita PWA richiedono `http://localhost` oppure `https`.

### Avvio rapido dalla cartella del progetto

```bash
cd /Users/tonga/Documents/GitHub/tongatron.github.io/projects/flights-from-turin
python3 -m http.server 8080
```

Poi apri:

- [http://localhost:8080](http://localhost:8080)

### Avvio dalla root della repository

```bash
cd /Users/tonga/Documents/GitHub/tongatron.github.io
python3 -m http.server 8080
```

Poi apri:

- [http://localhost:8080/projects/flights-from-turin/](http://localhost:8080/projects/flights-from-turin/)

## Note operative

- i prezzi cambiano spesso: i risultati dipendono dal momento in cui fai la richiesta;
- se Ryanair cambia struttura o disponibilita degli endpoint, la ricerca puo smettere di funzionare;
- dopo modifiche a `index.html`, `app.js`, `styles.css` o `service-worker.js`, puo essere necessario fare un hard refresh (`Cmd/Ctrl + Shift + R`);
- l'app usa una query string per condividere filtri e vista corrente, inclusa la lingua (`lang=it|en`).
