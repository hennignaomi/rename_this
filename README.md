# Berliner Strassen

This repository contains a Berlin-focused scrollytelling project about street names, memory, and urban history.

## Scope

- `storytelling/` contains the static MapLibre + Scrollama story published via GitHub Pages.
- `exploratory_analysis/` contains Berlin notebooks and the Berlin address export script.
- `processed_data/` contains Berlin street and street-address GeoJSON exports used for analysis and storytelling.

## Local development

Install Python dependencies:

```bash
uv sync
```

Serve the storytelling app locally:

```bash
python -m http.server 8000 -d storytelling
```

Then open `http://127.0.0.1:8000`.

Copy `storytelling/config.local.example.js` to `storytelling/config.local.js` and add your Mapbox token for the basemap.

## Publish (GitHub Pages)

The site deploys from `storytelling/` via `.github/workflows/static.yml` when you push to `main`.

1. Create an empty repository on GitHub as `hennignaomi` (for example `Berliner_Strassen-naomi`).
2. Authenticate Git for that account (GitHub CLI, SSH key, or HTTPS with a personal access token).
3. Push this repository:

```bash
git remote add origin https://github.com/hennignaomi/Berliner_Strassen-naomi.git
git push -u origin main
```

4. In the repo settings, enable **GitHub Pages** with source **GitHub Actions**.
5. Add a repository secret `MAPBOX_ACCESS_TOKEN` with your Mapbox public token (`pk.…`), restricted to your GitHub Pages URL.

The published URL will be `https://hennignaomi.github.io/Berliner_Strassen-naomi/`.
