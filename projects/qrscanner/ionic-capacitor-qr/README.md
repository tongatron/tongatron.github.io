# QR Scanner (Ionic + Capacitor)

App mobile Android basata su Ionic React + Capacitor con scansione QR via plugin nativo:

- UI Ionic mobile-first
- scansione QR (`@capacitor-mlkit/barcode-scanning`)
- torcia (se disponibile)
- copia risultato / apertura link
- sync Android già configurato

## Requisiti

- Node.js + npm
- Android Studio
- SDK Android configurato

## Avvio Web (debug)

```bash
npm install
npm run dev
```

## Build + Sync Android

```bash
npm run sync:android
```

## Apri progetto Android Studio

```bash
npm run android
```

## Note operative

- Se il permesso camera è negato, abilitalo nelle impostazioni app Android.
- La preview su Android è gestita dal plugin nativo; su web usa l'elemento video della pagina.
- Per cambiare `appId` o `appName`, modifica `capacitor.config.ts`.
