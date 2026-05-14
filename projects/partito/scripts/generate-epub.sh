#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/downloads"
OUTPUT_FILE="$OUTPUT_DIR/partito-quaderno.epub"

mkdir -p "$OUTPUT_DIR"

cd "$ROOT_DIR"

pandoc \
  docs/00-metodo.md \
  docs/01-prompt-adattato.md \
  docs/02-storia-mondiale-sintesi.md \
  docs/03-italia-1850-2026.md \
  docs/04-partiti-e-movimenti.md \
  docs/05-italia-oggi.md \
  docs/06-ipotesi-formazione-politica.md \
  docs/07-programma-realistico.md \
  docs/08-fonti.md \
  docs/09-roadmap.md \
  docs/10-matrice-pubblici.md \
  docs/11-confronto-partiti.md \
  docs/12-manifesto-breve.md \
  --toc \
  --toc-depth=2 \
  --metadata title="Partito - Quaderno di lavoro" \
  --metadata lang="it-IT" \
  --metadata creator="OpenAI Codex" \
  --output "$OUTPUT_FILE"

printf 'Creato %s\n' "$OUTPUT_FILE"
