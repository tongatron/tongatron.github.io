# Torino Stop Radar

App per consultare i mezzi in arrivo a una fermata GTT di Torino.

## Come funziona

- Il backend Express legge il feed GTFS Realtime `trip_update.aspx` di GTT.
- Il GTFS statico `gtt_gtfs.zip` viene usato per fermate, linee e mappatura `trip_id + stop_sequence -> stop`.
- Il frontend React + Leaflet permette di digitare un numero fermata, cercare per indirizzo e vedere gli arrivi realtime dei mezzi di superficie GTT.
- La geolocalizzazione e la ricerca indirizzo mostrano le fermate vicine sulla mappa e consentono di selezionarle con un click.

## Avvio

```bash
npm install
npm run dev
```

In sviluppo:

- frontend: `http://localhost:5173`
- API locale: `http://localhost:3210/api/arrivals?stopCode=10`
- geocoder locale: `http://localhost:3210/api/geocode?address=via%20po%2017`

## Build

```bash
npm run build
npm start
```

## Fonti dati

- Mobility Database feed `mdb-2705`: <https://mobilitydatabase.org/feeds/gtfs_rt/mdb-2705>
- Feed realtime GTT trip updates: <https://percorsieorari.gtt.to.it/das_gtfsrt/trip_update.aspx>
- GTFS statico GTT: <https://www.gtt.to.it/open_data/gtt_gtfs.zip>
- Geocoding: <https://nominatim.openstreetmap.org/>
