# Mac Sensor Dashboard

Dashboard locale (browser) che mostra i principali dati e sensori del tuo Mac:

- CPU (user/system/idle + load average)
- RAM (usata/libera/compressa)
- Batteria (carica, cicli, salute, voltaggio, amperaggio, temperatura)
- Stato termico da `pmset`
- Rete (IP, MAC, traffico totale + velocita download/upload)
- Dischi (utilizzo per mountpoint)
- Processi top per CPU

## Avvio

```bash
npm start
```

Poi apri:

- `http://localhost:3492`

## Note

- Alcuni sensori hardware avanzati su macOS non sono esposti senza strumenti aggiuntivi o privilegi elevati.
- La dashboard usa solo comandi di sistema standard (es. `pmset`, `ioreg`, `system_profiler`, `vm_stat`, `netstat`, `ps`).
