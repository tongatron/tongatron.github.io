# Torino Line Radar

App locale per visualizzare i mezzi GTT live sulla mappa partendo direttamente dal numero o codice linea.

## Stack

- frontend: React + Vite + Leaflet
- backend: Express + GTFS statico + GTFS Realtime GTT
- PWA: installabile in locale/produzione, con cache base della shell

## Avvio sviluppo

```bash
npm install
npm run dev
```

URL:

- frontend: `http://localhost:5173`
- backend API: `http://localhost:3210`
- healthcheck: `http://localhost:3210/api/health`

## Build locale completa

```bash
npm run build
npm start
```

La build completa gira su:

- app + backend: `http://localhost:3210/`

Questa e la modalita giusta per provare la PWA, perche il service worker viene registrato solo in produzione.

## Come usare l'app

1. Inserisci una linea GTT, per esempio `4` o `M1N`
2. L'app carica i mezzi live disponibili
3. La mappa mostra i veicoli con indicatore di direzione

## Fonti dati

- Feed realtime GTT trip updates: <https://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx>
- Feed realtime GTT vehicle positions: <https://percorsieorari.gtt.to.it/das_gtfsrt/vehicle_position.aspx>
- GTFS statico GTT: <https://www.gtt.to.it/open_data/gtt_gtfs.zip>
- Geocoding: <https://nominatim.openstreetmap.org/>
