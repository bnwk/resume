# Resume (GitHub Pages)

This repo hosts a web resume (GitHub Pages) and a reproducible PDF export.

## Quick start (local)
- Open `index.html` directly, or serve:
  - `python -m http.server 8000`
  - visit `http://localhost:8000`

## PDF export (recommended)
Use Playwright to export the GitHub Pages URL to `resume.pdf`.

### One-time
- Install Node.js (LTS)
- `npm install`

### Export
- `node scripts/export_pdf.mjs --url http://localhost:8000 --out resume.pdf`

## GitHub Pages
Settings → Pages → Deploy from branch → `main` / root

Then:
- `https://<username>.github.io/<repo>/`
- PDF at `https://<username>.github.io/<repo>/resume.pdf`
