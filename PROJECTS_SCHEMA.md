# Schema per la riprogettazione di `/projects/`

Documento di lavoro. Correggere soprattutto le colonne `mostrare`, `sezione`, `priorità` e `note`. Le righe con `?` sono decisioni da prendere.

## Regole proposte

- `mostrare`: `sì`, `no`, `forse`, `archivio`.
- `sezione`: usare poche categorie stabili, non una categoria diversa per ogni progetto.
- `priorità`: `A` = in evidenza, `B` = griglia principale, `C` = raccolta secondaria, `D` = archivio.
- `stato`: `attivo`, `sperimentale`, `storico`, `servizio personale`, `prototipo`, `da verificare`.
- Un progetto dovrebbe comparire una sola volta nella pagina. I servizi personali e i giochi possono avere sezioni separate oppure essere esclusi dal portfolio.

## Categorie da confermare

1. `In evidenza` — pochi progetti forti, recenti o rappresentativi.
2. `Web app e strumenti` — prodotti/utilità usabili da chi visita il sito.
3. `Musica e audio` — strumenti musicali e sound project.
4. `Esperimenti interattivi` — visual, 3D, browser API, demo.
5. `Dati, territorio e società` — astronomia, meteo, lavoro, PA, trasporti, analisi.
6. `Hardware e fabbricazione` — IoT, robotica, installazioni, fablab.
7. `Giochi e utility leggere` — eventualmente raccolti in una pagina dedicata.
8. `Archivio` — progetti vecchi, personali o non più rappresentativi.

## 1. Progetti già nella pagina `/projects/`

| Progetto | URL | Sezione attuale | Sezione proposta | Mostrare | Priorità | Stato | Note |
|---|---|---|---|---|---|---|---|
| Punto Eclissi | https://eclisse-12-08-2026.tongatron.org/ | App e siti | Dati, territorio e società | ? | B | stagionale | Utile come progetto evento; valutare se tenerlo dopo l'evento. |
| Astri | https://tongatron.org/astri/ | App e siti | Dati, territorio e società | ? | A | attivo | Progetto forte e distintivo; buona candidata per l'evidenza. |
| Ryanair Search | https://tongatron.org/projects/ryanair-search/ | App e siti | Web app e strumenti | ? | B | attivo | Utility concreta; pagina locale nel repository. |
| Head Tracking | https://tongatron.org/head-tracking/ | App e siti | Esperimenti interattivi | ? | B | sperimentale | Mostra uso di webcam/browser API. |
| Gmail Stats | https://tongatron.org/gmail-stats/ | App e siti | Dati, territorio e società | ? | B | prototipo | Analisi locale; chiarire privacy e requisiti. |
| PA Ninja | https://tongatron.org/pa-ninja/landing/ | App e siti | Dati, territorio e società | ? | B | attivo/prototipo | Forte tema professionale; non è attualmente nella pagina `/projects/`. |
| GTT Radar | https://gtt-to.onrender.com/ | App e siti | Dati, territorio e società | ? | B | da verificare | Dipende da hosting esterno Render. |
| Optical Transfer | https://optical-transfer.tongatron.org/ | App e siti | Web app e strumenti | ? | A | attivo | Idea tecnica molto chiara e differenziante. |
| Objects3D | https://tongatron.org/objects3D/ | App e siti | Esperimenti interattivi | ? | B | sperimentale | Demo 3D; valutare se raccontarla come esperimento. |
| RAL lordo/netto | https://tongatron.org/RAL-lordo-netto/ | App e siti | Web app e strumenti | ? | B | attivo | Utile, ma richiede verifica periodica delle regole fiscali. |
| Meteo Piemonte | https://meteo.tongatron.org/ | App e siti | Dati, territorio e società | ? | A/B | attivo | Progetto locale leggibile; controllare affidabilità dei dati. |
| Device Inspector | https://deviceinspector.tongatron.org/ | App e siti | Web app e strumenti | ? | A | attivo | Buon progetto manifesto su browser, privacy e analisi locale. |
| Birth-Lottery | https://tongatron.org/birth-lottery/ | App e siti | Esperimenti interattivi | ? | B | esperimento | Progetto editoriale/interattivo; può stare in una sezione più narrativa. |
| Moore's Law in Motion | https://tongatron.org/projects/computing-timeline/ | Pagine locali | Dati, territorio e società | ? | A/B | attivo | Demo educativa completa; buona candidata per la selezione principale. |
| Terminale Panico Estremo | https://tongatron.org/projects/error/ | Pagine locali | Esperimenti interattivi | ? | C | esperimento | Divertente ma poco rappresentativo; possibile raccolta secondaria. |
| Password Analyzer | https://tongatron.org/projects/password-analyzer/ | Pagine locali | Web app e strumenti | ? | B | attivo | Progetto utile; evitare promesse eccessive sulla sicurezza. |
| Kinetik Laboratories | https://tongatron.org/projects/kinetiklaboratories/ | Pagine locali | Musica e audio | ? | B | storico/prototipo | Progetto audio hardware/documentale, non una web app generica. |
| Partito | https://tongatron.org/projects/partito/ | Pagine locali | Esperimenti interattivi | ? | C | editoriale | Tema politico/editoriale: decidere se è ancora parte del portfolio. |
| Animations | https://tongatron.org/projects/animations/ | Pagine locali | Esperimenti interattivi | ? | C | sandbox | Meglio presentarlo come laboratorio o archivio di tecnica. |
| Farmaci | https://tongatron.org/projects/farmaci/ | Pagine locali | Web app e strumenti | ? | C | prototipo | Progetto personale/consultazione; verificare contenuti e responsabilità. |
| Robottino | https://tongatron.org/projects/robottino/robottino-site/index.html | IoT e prototipi | Hardware e fabbricazione | ? | B | storico | Documentazione visiva forte; progetto Fablab. |
| Selfomatic | https://tongatron.org/projects/selfomatic/index.html | IoT e prototipi | Hardware e fabbricazione | ? | A/B | storico/professionale | Buon case study di installazione per eventi. |
| IKEA Hack Nordli | https://tongatron.org/projects/IKEA-hack/index.html | IoT e prototipi | Hardware e fabbricazione | ? | C | storico | Fabbricazione digitale, ma meno centrale rispetto ai progetti software. |
| Magazzinoweb | https://tongatron.org/projects/magazzinoweb/ | IoT e prototipi | Archivio | no/archivio | D | storico | Vecchia versione del catalogo; non confondere con il servizio attuale. |

## 2. Progetti recenti mostrati sulla home ma da considerare nella pagina completa

| Progetto | URL | Sezione proposta | Mostrare | Priorità | Stato | Note |
|---|---|---|---|---|---|---|
| Metronome | https://metronome.tongatron.org/ | Musica e audio | ? | A | attivo | PWA usabile e immediata. |
| Sampler Mobile | https://samplermobile.tongatron.org/ | Musica e audio | ? | A | attivo | Prodotto più completo; possibile progetto hero. |
| ZOOM MultiStomp Patch Studio | https://zoom.tongatron.org/landing/ | Musica e audio | ? | A | attivo | Ha utenti attivi dichiarati; candidato forte per case study. |
| Pattern Machine | https://patternmachine.tongatron.org/ | Musica e audio | ? | A | attivo | Web/desktop/plugin; probabilmente uno dei progetti principali. |
| Annunci Lavoro Piemonte | https://annuncicpi.tongatron.org/ | Dati, territorio e società | ? | A/B | attivo | Progetto con utilità reale e aggiornamento automatico. |
| Excel-LizeMe | https://excel-lizeme.tongatron.org/ | Web app e strumenti | ? | B | attivo | Idea semplice, dimostrabile e adatta a una card. |
| Copy and Paste | https://copyandpaste.tongatron.org/ | Web app e strumenti | ? | B | attivo | Tool multipiattaforma; tema privacy/trasferimento dati. |
| Raspi Chat | https://chat.tongatron.org/ | Servizi personali | ? | C | servizio personale | Separare dal portfolio oppure descrivere come self-hosting. |

## 3. Progetti presenti nel repository o nel README ma non nella pagina `/projects/`

| Progetto | URL | Sezione proposta | Mostrare | Priorità | Stato | Note |
|---|---|---|---|---|---|---|
| Il Ministero delle Eccezioni | https://tongatron.org/ministero-delle-eccezioni/ | Esperimenti interattivi | ? | B/C | editoriale | Progetto narrativo; decidere se tenerlo nel portfolio tecnico. |
| Piemonte TU Exporter | https://tongatron.org/projects/piemonte-tu-exporter/ | Dati, territorio e società | ? | B/C | da verificare | Cartella presente nel repository, ma non linkata nella pagina attuale. |
| Games & utilities | https://tongatron.org/games-utilities/ | Giochi e utility leggere | ? | C | raccolta | Meglio una sola card/link alla raccolta, non 11 card nella pagina principale. |
| Anagrammatron | https://tongatron.org/games-utilities/anagrammatron/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Anonymous Pics | https://tongatron.org/games-utilities/anonymous-pics/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Dado | https://tongatron.org/games-utilities/dado/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Connect Four | https://tongatron.org/games-utilities/forza4/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Memory | https://tongatron.org/games-utilities/memory/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Simulatore Morse | https://tongatron.org/games-utilities/morse/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Multi Web Simulator | https://tongatron.org/games-utilities/multi-simulator/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| QR Scanner Mobile | https://tongatron.org/games-utilities/qrscanner/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Roulette | https://tongatron.org/games-utilities/roulette/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Rumore Bianco | https://tongatron.org/games-utilities/rumorebianco/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |
| Simon Simulator | https://tongatron.org/games-utilities/simon/ | Giochi e utility leggere | ? | C | attivo | Da mostrare solo dentro la raccolta giochi/utility. |

## 4. Servizi self-hosted: decidere se sono portfolio o infrastruttura personale

Questi elementi sono documentati nel README e/o mostrati sulla home. Propongo di non mescolarli ai progetti creativi: se restano, usare una sezione separata chiamata `Servizi self-hosted`.

| Servizio | URL | Mostrare nella pagina portfolio | Priorità | Note |
|---|---|---|---|---|
| Raspi Chat | https://chat.tongatron.org/ | ? | C | Già presente anche tra i progetti recenti. |
| Magazzino Sereno | https://mhz.tongatron.org/ | ? | C | Catalogo personale. |
| Liberia | https://library.tongatron.org/ | ? | C | Scanner ISBN e libreria personale. |
| Alcol Monitor | https://alcol-monitor.tongatron.org/ | ? | C | Tracker personale; valutare privacy e opportunità di pubblicazione. |

## 5. Campi da usare nella nuova struttura dati

```yaml
- id: metronome
  title: Metronome
  short_description: "Una frase chiara che spiega il valore del progetto."
  url: https://metronome.tongatron.org/
  repo: null
  image: img/projects/metronome.jpg
  section: musica-audio
  tags: [PWA, Web Audio, offline]
  status: attivo
  visibility: featured # featured | main | collection | archive | hidden
  priority: A
  year: 2026
  last_updated: 2026-11-09
  audience: musicisti
  proof: "Dato concreto: utenti, tecnologie, risultato o contesto d'uso."
  notes: "Decisioni editoriali o problemi da verificare."
```

## Decisione editoriale consigliata da cui partire

- Tenere in `In evidenza` circa 6–8 progetti: Pattern Machine, ZOOM MultiStomp Patch Studio, Sampler Mobile, Metronome, Optical Transfer, Device Inspector, Astri e Annunci Lavoro Piemonte.
- Tenere nella griglia principale gli strumenti con un valore d'uso chiaro: Ryanair Search, Excel-LizeMe, RAL lordo/netto, Meteo Piemonte, Moore's Law in Motion, Head Tracking, Password Analyzer e Selfomatic.
- Spostare in raccolte secondarie gli esperimenti, i giochi e i servizi personali.
- Lasciare in `Archivio` i progetti storici o non più mantenuti, senza eliminarne subito gli URL.
- Evitare duplicati tra home, `/projects/` e raccolte: una card principale, poi eventuali link correlati.

## Controlli da fare prima dell'implementazione

- [ ] Confermare quali URL sono ancora online e funzionanti.
- [ ] Confermare quali progetti sono pubblici, personali o non più da promuovere.
- [ ] Verificare immagini mancanti e immagini ospitate su domini esterni.
- [ ] Decidere se la pagina deve essere un portfolio professionale, un archivio personale o entrambe le cose.
- [ ] Decidere se mantenere categorie in inglese, in italiano o miste.
- [ ] Decidere una soglia per `In evidenza` e una regola per i progetti nuovi.
