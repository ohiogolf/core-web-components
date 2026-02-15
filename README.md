# core-web-components

Drop-in web components powered by [core.ohiogolf.org](https://core.ohiogolf.org). Built as a single JS file that any website can load with a `<script>` tag — no framework required.

## Components

- **`<ohio-county-map>`** — Interactive SVG map of Ohio's 88 counties, colored by golf association region. Click a county to search for clubs.
- **`<club-search-results>`** — Displays paginated club results. Listens for search events from the map (or any other driver).

The two components communicate via DOM events and are fully independent — either can be used alone.

## Getting started

```bash
bin/setup          # Install dependencies
bin/dev            # Start dev server at http://localhost:5173
```

Open the dev page in your browser. It loads both components side by side with an event log at the bottom.

## Scripts

| Command | What it does |
|---------|-------------|
| `bin/setup` | Install dependencies |
| `bin/dev` | Start Vite dev server at http://localhost:5173 |
| `bin/test` | Run tests once via Vitest |
| `npm run build` | Build `dist/ohio-golf-core-components.js` (single IIFE bundle) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run generate-svg` | Regenerate county SVG paths from Census data (rarely needed) |

## Project structure

```
bin/
  setup                                 Install dependencies
  dev                                   Start dev server
  test                                  Run tests
src/
  index.ts                              Entry point — registers both custom elements
  components/
    ohio-county-map/
      ohio-county-map.ts                Map component
      ohio-county-map.styles.ts         Scoped styles (Shadow DOM)
    club-search-results/
      club-search-results.ts            Results component
      club-search-results.styles.ts     Scoped styles (Shadow DOM)
  data/
    ohio-counties.ts                    SVG path data for 88 counties (generated)
    regions.ts                          Region display config (IDs, names, colors)
  lib/
    events.ts                           Custom event types and dispatch helpers
    api-client.ts                       Fetch wrapper for CRM API endpoints
scripts/
  generate-ohio-svg.ts                  One-time script: Census TopoJSON -> SVG paths
index.html                              Dev/test page with both components
```

## SVG map data

`src/data/ohio-counties.ts` contains pre-computed SVG path strings for all 88 Ohio counties. This file is generated from Census TIGER boundaries (`us-atlas` npm package) and committed to git, so cloning and building works without running the generate script.

If Census boundary data ever updates, regenerate with `npm run generate-svg`. The script projects coordinates with Albers centered on Ohio into an 800x700 viewBox and rounds to 1 decimal place for compact output.

## How the build works

Vite bundles everything in `src/` into a single IIFE file (`dist/ohio-golf-core-components.js`). Loading this file on any page automatically registers both custom elements — no imports or initialization needed:

```html
<script src="ohio-golf-core-components.js"></script>

<ohio-county-map api-base-url="https://core.ohiogolf.org"></ohio-county-map>
<club-search-results api-base-url="https://core.ohiogolf.org"></club-search-results>
```

## Tech stack

- **Vite 6** — build tool (library mode, IIFE output)
- **TypeScript** — type checking only (`noEmit`); Vite handles compilation
- **Vitest** — test runner
- **Vanilla Web Components** — Shadow DOM, no framework dependencies
