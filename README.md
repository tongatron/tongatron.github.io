# tongatron 🧪

> small repo, big rabbit hole

---

## 🌐 enter the system

👉 https://tongatron.org

Indice completo dei progetti: https://tongatron.org/projects/

---

## 🧠 what is this?

Questo repository è solo la porta d'ingresso (`tongatron.github.io`, servito su `tongatron.org`).

Dietro la porta:
- ⚙️ tools e utility web
- 🧪 esperimenti interattivi
- 🛰 prototipi IoT e hardware
- 📡 servizi self-hosted (Raspberry Pi + Cloudflare Tunnel)

---

## 🚀 progetti

### App e siti

| Progetto | URL | Repo |
|---|---|---|
| Astri — esplorazione del cielo notturno in 3D | https://tongatron.org/astri/ | [`astri`](https://github.com/tongatron/astri) |
| Il Ministero delle Eccezioni — romanzo satirico | https://tongatron.org/ministero-delle-eccezioni/ | [`ministero-delle-eccezioni`](https://github.com/tongatron/ministero-delle-eccezioni) |
| Ryanair Search — ricerca voli A/R con filtri | https://tongatron.org/projects/ryanair-search/ | locale |
| Head Tracking — interazioni con movimento testa | https://tongatron.org/head-tracking/ | [`head-tracking`](https://github.com/tongatron/head-tracking) |
| Gmail Stats — dashboard email | https://tongatron.org/gmail-stats/ | [`gmail-stats`](https://github.com/tongatron/gmail-stats) |
| PA Ninja — toolkit Pubblica Amministrazione | https://tongatron.org/pa-ninja/landing/ | [`pa-ninja`](https://github.com/tongatron/pa-ninja) |
| GTT Radar — trasporto pubblico torinese | https://gtt-to.onrender.com/ | [`gtt-to`](https://github.com/tongatron/gtt-to) |

### Pagine locali (in `/projects`)

| Progetto | URL |
|---|---|
| Moore's Law in Motion | https://tongatron.org/projects/computing-timeline/ |
| Terminale Panico Estremo | https://tongatron.org/projects/error/ |
| Password Analyzer | https://tongatron.org/projects/password-analyzer/ |
| Kinetik Laboratories | https://tongatron.org/projects/kinetiklaboratories/ |
| Partito | https://tongatron.org/projects/partito/ |
| Animations | https://tongatron.org/projects/animations/ |
| Farmaci | https://tongatron.org/projects/farmaci/ |

### IoT e installazioni

| Progetto | URL |
|---|---|
| Robottino | https://tongatron.org/projects/robottino/robottino-site/ |
| Selfomatic | https://tongatron.org/projects/selfomatic/ |
| IKEA Hack Nordli | https://tongatron.org/projects/IKEA-hack/ |
| Magazzinoweb (archivio) | https://tongatron.org/projects/magazzinoweb/ |

### Giochi e utility

Tutti sotto [`games-utilities`](https://github.com/tongatron/games-utilities):

- [Anagrammatron](https://tongatron.org/games-utilities/anagrammatron/) — generatore di anagrammi
- [Anonymous Pics](https://tongatron.org/games-utilities/anonymous-pics/) — utility fotocamera
- [Dado](https://tongatron.org/games-utilities/dado/) — simulatore di dado
- [Connect Four](https://tongatron.org/games-utilities/forza4/) — Forza Quattro vs CPU
- [Memory](https://tongatron.org/games-utilities/memory/) — memory game
- [Simulatore Morse](https://tongatron.org/games-utilities/morse/) — telegrafo + audio
- [Multi Web Simulator](https://tongatron.org/games-utilities/multi-simulator/) — simulatore MULTI
- [QR Scanner Mobile](https://tongatron.org/games-utilities/qrscanner/) — scanner QR
- [Roulette](https://tongatron.org/games-utilities/roulette/) — roulette casino-style
- [Rumore Bianco](https://tongatron.org/games-utilities/rumorebianco/) — generatore audio
- [Simon Simulator](https://tongatron.org/games-utilities/simon/) — Simon classico

### Servizi self-hosted (Raspberry Pi + Cloudflare Tunnel)

| Servizio | URL | Note |
|---|---|---|
| Raspi Chat | https://chat.tongatron.org/ | chat self-hosted con stanze |
| Magazzino Sereno | https://mhz.tongatron.org/ | catalogo personale |
| Liberia | https://library.tongatron.org/ | scanner ISBN |
| Alcol Monitor | https://alcol-monitor.tongatron.org/ | tracker personale |

Inventario completo dei servizi sul Pi: [`README.raspberry.md`](README.raspberry.md).

---

## 📊 analytics

Tutte le pagine sotto `tongatron.org` (e i servizi sul Pi via tunnel) caricano `https://tongatron.org/analytics.js` — sorgente unica, Google Analytics 4 con Consent Mode v2 e banner opt-in. Per aggiungere tracking a una nuova pagina:

```html
<script async src="https://tongatron.org/analytics.js"></script>
```

---

## 🧩 philosophy

- 🏃 build fast
- 🔁 iterate faster
- 🧱 ship real things
- 🪶 keep it lightweight
- 🧑‍🔧 break → fix → repeat

---

## 🛠 stack (more or less)

```
html · css · javascript · node · vite · fastify · express
+ whatever gets the job done
```
