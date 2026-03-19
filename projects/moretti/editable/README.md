# Editable Edition

This folder contains a simple static version of the site that can be updated from GitHub without touching the Readymag mirror.

## What to edit

1. `content/site.json`
   Update labels, intro texts, footer text, and links.
2. `content/projects.json`
   Add, remove, or reorder rows in the project table.
3. `assets/uploads/home-01.jpg` to `home-04.jpg`
   Replace these files to update the home page visuals.

## Public URLs

- `./editable/`
- `./editable/behindtheshadow/`
- `./editable/admin/`

## Admin panel

The page `./editable/admin/` provides a graphical editor for texts, links,
project rows, and home images.

- It saves drafts in the browser.
- It exports `site.json`, `projects.json`, and replacement image files.
- It does not publish to GitHub automatically, so the exported files still need
  to be uploaded to the repository.
- It is not truly protected on GitHub Pages. Anyone with the URL can open it.

## GitHub-friendly workflow

1. Open the file you want to change on GitHub.
2. Click the pencil icon.
3. Edit the JSON or upload a replacement image with the same file name.
4. Commit the change.

## Notes

- The original mirror stays outside this folder and remains untouched.
- If you want to add a link to one project row, fill the `link` field in `projects.json`.
- Keep JSON syntax valid: every string needs quotes and every row except the last one needs a trailing comma.
