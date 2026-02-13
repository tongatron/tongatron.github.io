<!-- Copilot / AI agent instructions for tongatron.github.io -->
# Repo snapshot

This is a small static website (GitHub Pages / Jekyll-style) consisting mainly of hand-authored HTML files, a few Markdown blog posts, client-side JS, CSS, and JSON data files used by front-end widgets.

Key locations (examples):
- `index.html` — main entry page.
- `blogpost/` — Markdown blog posts (e.g. `2017-03-05-IKEA-hack.md`).
- `css/` — site CSS (Bootstrap copies + `tngstyle.css`).
- `js/` and top-level JS files — client-side code (e.g. `caloscript.js`, `mjscript.js`).
- `img/`, `imgk/` — images and image subfolders.
- data files: `dati_nutrizionali.json`, `calories.json`, `beverages.json` — consumed by front-end scripts.
- utility script: `files.py` — local cleanup/duplicate finder (not part of site build).

## Big picture / architecture
- This is not a server app — it is a static website. Pages are mostly static `.html` files; some pages and widgets read JSON files client-side (via `fetch`) and render with plain DOM or Chart.js.
- There is a minimal Jekyll hint (`_config.yml`), but most pages do not appear to use Liquid templating extensively — treat changes as static-file edits unless you confirm Jekyll templates are used.
- Data flow examples:
  - `caloscript.js` fetches `dati_nutrizionali.json` and populates UI elements and a Chart.js chart. When changing data shape, update both the JSON and the JS that reads it.
  - Other JSON files (e.g. `beverages.json`, `calories.json`) are used similarly by small scripts.

## What to know before editing
- Filenames and paths: many files are referenced by relative paths in scripts (e.g. `fetch('dati_nutrizionali.json')`) — serve the repository root when previewing locally so relative fetches succeed.
- Some filenames contain spaces (e.g. `griglia vita.html`, `curriculum vitae.pdf`) — be careful with URL encoding and shell commands.
- Content is primarily in Italian; keep language/context when editing copy.

## Local preview / developer workflow
- Preferred quick preview options (pick what you have installed):
  - If you use Jekyll: from repo root run `jekyll serve` to preview the site at `http://127.0.0.1:4000`.
  - Otherwise a minimal static server is fine: `python -m http.server 4000` (then open `http://localhost:4000`).
- When debugging JS that fetches JSON, open DevTools Console/Network and confirm the JSON is served (200) and has the expected shape.

## Project-specific conventions and patterns
- Minimal JS frameworks: code is plain ES5/ES6 DOM manipulation (see `caloscript.js`). Avoid introducing heavy frameworks without a clear reason.
- Styling: Bootstrap files are present in `css/` and `js/`. Local customizations live in `tngstyle.css` — change here for site-wide style tweaks.
- Posts: Add blog posts as Markdown files under `blogpost/` following the existing file naming style if you intend them to be rendered by GitHub Pages.

## Integration points & external dependencies
- Charting: `caloscript.js` uses Chart.js (chart creation appears in the script). Ensure Chart.js is included in pages that render charts or add it via CDN.
- Bootstrap assets are copied into `css/` and `js/` — edits to these should be intentional; prefer `tngstyle.css` for custom style rules.

## Editing rules for AI agents (actionable guidelines)
- Prefer small, focused PRs that change one page/feature at a time.
- When modifying JSON schemas (for example `dati_nutrizionali.json`), update the consuming script (e.g. `caloscript.js`) in the same change and include a short example of the new JSON shape.
- Preserve Italian copy unless instructed otherwise; if translating, change only the target files and call out changes in PR description.
- Avoid adding build/tooling unless requested — this repo runs fine as static files.

## Examples to reference in PRs or suggestions
- To show data-driven UI changes, point to `caloscript.js` and `dati_nutrizionali.json` as a concrete pair.
- For layout/CSS suggestions, reference `css/tngstyle.css` and the Bootstrap files in `css/`.

## Missing / unknowns (ask the maintainer)
- Whether the site is actively built with Jekyll on CI (GitHub Pages) or served as plain static files.
- Any preferred branching / commit / release conventions.

If anything here is unclear or you want this to include more examples (for example, search patterns of how JSON files are used), tell me which area to expand and I will iterate.
