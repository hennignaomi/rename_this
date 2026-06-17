# Storytelling

This directory contains the scroll-driven story **Re:Name THIS!** It is a static MapLibre app with no build step.

Mapbox requires a public token in `config.local.js` (see `config.local.example.js`). That file is gitignored.

## Files

- `index.html`: app shell, styles, MapLibre setup, and scroll behavior
- `config.js`: story text, chapters, camera positions, and GeoJSON layer sequences
- `config.local.js`: your Mapbox access token (not committed)
- `story-layers.js`: loads orange highlight layers from `data/*_wgs84.geojson`
- `quellen.html`: full sources and acknowledgements
- `impressum.html`: legal notice (placeholders to fill in before publishing)
- `datenschutz.html`: privacy policy
- `data/*_wgs84.geojson`: chapter street layers (WGS84)

## Run locally

Serve the directory over HTTP and open `index.html` in a browser. Any simple static server works.

Example:

```bash
cd storytelling
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## How it works

- The basemap style comes from CARTO via `config.style`.
- `index.html` adds an Esri satellite raster overlay as `satellite-imagery`.
- `index.html` also loads the local street GeoJSON and creates the highlight layers used by the story.
- Each chapter in `config.js` defines text plus a target map view.
- `onChapterEnter` and `onChapterExit` change layer opacity as the reader scrolls.

## Editing the story

- Update story text, titles, and chapter order in `config.js`.
- Adjust `location.center`, `zoom`, `pitch`, and `bearing` per chapter to change the camera.
- Reference existing layer ids in `onChapterEnter` and `onChapterExit`.
- Add new data-driven highlights in `index.html` if the story needs additional layers.

## Notes

- The implementation is based on an upstream storytelling template, but this copy has been adapted to use MapLibre and project-local data sources.
- The `LICENSE` file is kept to preserve upstream license attribution for the inherited template code.
