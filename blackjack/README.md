# BlackJack Web

Gioco BlackJack statico (HTML/CSS/JS) pronto per GitHub Pages.

## Avvio locale

```bash
python3 -m http.server 8000
```

Poi apri: `http://localhost:8000`

## Deploy su GitHub Pages

Questo progetto e' pensato per essere pubblicato nella cartella `blackjack` del repo `tongatron.github.io`.

URL finale atteso:

`https://tongatron.github.io/blackjack/`

Passi:

1. Aggiungi e committa i file della cartella `blackjack`.
2. Esegui push su `main` del repo `tongatron.github.io`.
3. In GitHub vai su `Settings > Pages` e verifica:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Attendi il deploy (1-2 minuti) e apri l'URL.

## File principali

- `index.html`
- `styles.css`
- `script.js`
