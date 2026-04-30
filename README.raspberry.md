# Raspberry Services Inventory

Snapshot: 2026-04-30
Host: `raspberrypi`
Tailscale: `raspberrypi.tailce2514.ts.net`
OS: Raspbian GNU/Linux 13 (trixie) — armv7l
Node.js: v20.19.2 / npm 9.2.0
SSH user: `giovanni` — key: `~/.ssh/raspberry_pi` (Mac)

Questo file documenta i servizi, le app e la topologia di rete del Raspberry. Va aggiornato ogni volta che si aggiunge un servizio, cambia una porta, o si modifica un tunnel.

---

## Topologia pubblica (Cloudflare Tunnels)

| Hostname | Tunnel | → Porta locale | Servizio |
|---|---|---|---|
| `chat.tongatron.org` | `cloudflared.service` | `localhost:80` (nginx) | raspi-chat / fastify-api |
| `api.tongatron.org` | `cloudflared.service` | `localhost:3000` | fastify-api |
| `private.tongatron.org` | `cloudflared.service` | `localhost:3200` | raspi-admin |
| `mhz.tongatron.org` | `cloudflared-magazzino.service` | `localhost:3100` | magazzino-sereno |

Config tunnel principale: `/etc/cloudflared/config.yml` (tunnel ID: `8521f89c-9038-474b-886b-71fb4ae98bc6`)
Config tunnel magazzino: `~/.cloudflared/magazzino-config.yml` (tunnel ID: `e1fea28b-808a-40d5-a5cc-3b8adce1c71e`)

---

## Porte in ascolto

| Porta | Bind | Processo | Note |
|---|---|---|---|
| `22` | `0.0.0.0` | `sshd` | accesso shell |
| `80` | `0.0.0.0` | `nginx` | reverse proxy principale |
| `3000` | `127.0.0.1` | `node` (fastify-api) | raspi-chat + API |
| `3100` | `127.0.0.1` | `node` (magazzino.service) | magazzino-sereno |
| `3200` | `127.0.0.1` | `node` (raspi-admin.service) | pannello admin |
| `139`, `445` | `0.0.0.0` | `smbd` | Samba |

---

## App e servizi Node.js

### fastify-api

- **Service:** `fastify-api.service`
- **Working dir:** `/srv/apps/fastify-api`
- **Git:** `https://github.com/tongatron/raspi-chat.git`
- **Avvio:** `/usr/bin/node /srv/apps/fastify-api/server.js`
- **Bind:** `127.0.0.1:3000`
- **Env:** `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3000`
- **Env file:** `/srv/apps/fastify-api/.env`
- **Hostname pubblici:** `api.tongatron.org`, `chat.tongatron.org` (via nginx)

Route principali:
- `/` — landing page
- `/admin/*` — pannello admin integrato (legacy, sostituito da raspi-admin)
- `POST /api/send-mail` — invio mail via Gmail
- `/chat*`, `/ws` — chat real-time WebSocket
- `/health`, `/status`

Plugin Fastify registrati: `@fastify/cors`, `@fastify/websocket`, `@fastify/multipart`, `@fastify/formbody`

---

### raspi-admin

- **Service:** `raspi-admin.service`
- **Working dir:** `/srv/apps/raspi-admin`
- **Git:** `https://github.com/tongatron/raspi-admin.git` (privato)
- **Avvio:** `/usr/bin/node server.js`
- **Bind:** `127.0.0.1:3200`
- **Env file:** `/srv/apps/raspi-admin/.env`
- **Hostname pubblico:** `https://private.tongatron.org`
- **Login:** `https://private.tongatron.org/admin/login`

Pannello admin per il Raspberry: gestione servizi systemd, log, repo GitHub. Protetto da password (`ADMIN_PASSWORD` in `.env`). Plugin Fastify registrato come wrapper standalone (`server.js` locale).

---

### magazzino-sereno

- **Service:** `magazzino.service`
- **Working dir:** `/home/giovanni/magazzino-sereno/server`
- **Git:** `https://github.com/tongatron/magazzino.git`
- **Avvio:** `/usr/bin/npm start`
- **Bind:** `127.0.0.1:3100`
- **Env:** `HOST=127.0.0.1`, `PORT=3100`
- **Hostname pubblico:** `https://mhz.tongatron.org` (tunnel dedicato)

---

### tongatron-server (non attivo come systemd)

- **Dir:** `/home/giovanni/tongatron-server`
- **Descrizione:** server Express con socket.io e nodemailer — predecessore di fastify-api
- **Nota:** il file `.service` è presente ma il servizio non è abilitato; la funzione mail è migrata in fastify-api

---

## Nginx

Config attiva: `/etc/nginx/sites-enabled/fastify-api`

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    set $upstream http://127.0.0.1:3000;
    if ($host = mhz.tongatron.org) {
        set $upstream http://127.0.0.1:3100;
    }

    location / {
        client_max_body_size 20m;
        proxy_pass $upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # ...altri header standard
    }
}
```

---

## Cloudflare Tunnels

### Tunnel principale (`cloudflared.service`)

- **Config:** `/etc/cloudflared/config.yml`
- **Credentials:** `/etc/cloudflared/8521f89c-9038-474b-886b-71fb4ae98bc6.json`
- **Avvio:** `/usr/local/bin/cloudflared --no-autoupdate --config /etc/cloudflared/config.yml tunnel run`

Per aggiungere un hostname: modifica `/etc/cloudflared/config.yml`, aggiungi la regola ingress, poi:
```bash
cloudflared tunnel route dns 8521f89c-9038-474b-886b-71fb4ae98bc6 <nuovo-hostname>
sudo systemctl restart cloudflared.service
```

### Tunnel magazzino (`cloudflared-magazzino.service`)

- **Config:** `~/.cloudflared/magazzino-config.yml`
- **Credentials:** `~/.cloudflared/e1fea28b-808a-40d5-a5cc-3b8adce1c71e.json`

---

## Percorsi importanti

| Cosa | Percorso |
|---|---|
| App di produzione | `/srv/apps/` |
| fastify-api | `/srv/apps/fastify-api/` |
| raspi-admin | `/srv/apps/raspi-admin/` |
| magazzino-sereno | `/home/giovanni/magazzino-sereno/` |
| Nginx sites | `/etc/nginx/sites-enabled/` |
| Systemd services custom | `/etc/systemd/system/` |
| Cloudflared config (principale) | `/etc/cloudflared/config.yml` |
| Cloudflared config (magazzino) | `~/.cloudflared/magazzino-config.yml` |
| SSH keys (Mac → Pi) | `~/.ssh/raspberry_pi` |
| DuckDNS updater | `~/duckdns/` |
| Backup scripts | `~/backup-raspberry/` |

---

## Comandi utili

```bash
# Stato servizi
systemctl status fastify-api raspi-admin magazzino nginx cloudflared

# Log in tempo reale
journalctl -u raspi-admin -f
journalctl -u fastify-api -n 100 --no-pager

# Porte in ascolto
ss -tlnp

# Aggiornare un'app da git
cd /srv/apps/fastify-api && git pull && sudo systemctl restart fastify-api
cd /srv/apps/raspi-admin && git pull && sudo systemctl restart raspi-admin
cd ~/magazzino-sereno && git pull && sudo systemctl restart magazzino
```

---

## Note operative

- `raspi-admin` è il pannello di controllo ufficiale: gestisce i servizi systemd, i log e i repo direttamente dalla UI web.
- Variabili sensibili (password, token GitHub, chiavi mail) sono in `/srv/apps/fastify-api/.env` e `/srv/apps/raspi-admin/.env` — mai committare.
- Aggiornare questo file ogni volta che si aggiunge un servizio, cambia porta, o si crea/modifica un tunnel Cloudflare.
