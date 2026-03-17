# PWA Test — Istruzioni per tongatron.github.io

Questo pacchetto è già configurato per la tua repo `tongatron/tongatron.github.io`.

---

## Struttura da creare nella tua repo

```
tongatron.github.io/
├── .well-known/
│   └── assetlinks.json       ← copia dalla cartella .well-known/ di questo ZIP (completare dopo build)
├── _config.yml               ← aggiungi:  include: [.well-known]
└── projects/
    └── pwa-test/             ← copia questa intera cartella
        ├── index.html
        ├── manifest.json
        ├── sw.js
        └── icons/
```

---

## Step 1 — Copia i file

```bash
git clone https://github.com/tongatron/tongatron.github.io.git
cd tongatron.github.io

mkdir -p projects/pwa-test
cp -r /percorso/zip/pwa-test/* projects/pwa-test/

mkdir -p .well-known
cp projects/pwa-test/.well-known/assetlinks.json .well-known/
```

## Step 2 — _config.yml (già presente nella tua repo)

Aggiungi questa riga:
```yaml
include:
  - .well-known
```

## Step 3 — Push

```bash
git add .
git commit -m "aggiunta pwa-test per Bubblewrap"
git push origin main
```

PWA live su: https://tongatron.github.io/projects/pwa-test/

---

## Step 4 — Bubblewrap

```bash
npm install -g @bubblewrap/cli
mkdir twa-build && cd twa-build
bubblewrap init --manifest https://tongatron.github.io/projects/pwa-test/manifest.json
bubblewrap build
```

## Step 5 — Completa assetlinks.json

Dopo la build, recupera la SHA-256:
```bash
keytool -list -v -keystore android.keystore
```

Incollala in `.well-known/assetlinks.json` nella ROOT della repo, poi push.

---

## URL finali

| Risorsa | URL |
|---------|-----|
| PWA | https://tongatron.github.io/projects/pwa-test/ |
| Manifest | https://tongatron.github.io/projects/pwa-test/manifest.json |
| Asset Links | https://tongatron.github.io/.well-known/assetlinks.json |
