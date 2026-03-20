# Editable Edition

This folder contains a simple static version of the site that can be updated from GitHub without touching the Readymag mirror.

## What to edit

1. `content/site.json`
   Update labels, intro texts, footer text, links, and the full home slider:
   image order, client, project, year, and result text shown under each image.
2. `content/projects.json`
   Add, remove, or reorder rows in the project table, including optional row
   images.
3. `assets/uploads/home-*.jpg`
   Replace or add these files to update the home page visuals.
4. `assets/uploads/projects/`
   Optional image files for the works table rows.

## Public URLs

- `./editable/`
- `./editable/behindtheshadow/`
- `./editable/admin/`

## Admin panel

The page `./editable/admin/` provides a graphical editor for texts, links,
project rows, and home images.

- It saves drafts in the browser.
- On the local Node server it can also write directly to disk.
- It exports `site.json`, `projects.json`, and replacement image files.
- It does not publish to GitHub automatically, so the exported files still need
  to be uploaded to the repository.
- It is not truly protected on GitHub Pages. Anyone with the URL can open it.
- It lets you set the display order of the home visuals.
- It lets you edit the text shown under each home image.
- It lets you add new home images to the slider.
- It lets you attach one image to each row in the works table.

## Local save flow

1. Run `npm start`
2. Open `http://localhost:4173/editable/admin/`
3. Click `Save to disk`
4. Commit and push the changed files

## GitHub-friendly workflow

1. Open the file you want to change on GitHub.
2. Click the pencil icon.
3. Edit the JSON or upload a replacement image with the same file name.
4. Commit the change.

## Notes

- The original mirror stays outside this folder and remains untouched.
- If you want to add a link to one project row, fill the `link` field in `projects.json`.
- Keep JSON syntax valid: every string needs quotes and every row except the last one needs a trailing comma.
