# core-web-components

Drop-in web components powered by [core.ohiogolf.org](https://core.ohiogolf.org). Built as a single JS file that any website can load with a `<script>` tag — no framework required.

## Quick start

Add the script and drop in the components. That's it — no configuration needed:

```html
<script src="https://ohiogolf.github.io/core-web-components/ohio-golf-core-components.js"></script>

<ohio-county-map></ohio-county-map>
<club-search-results></club-search-results>
```

Click a region on the map and matching clubs appear in the results panel. Both components connect to `core.ohiogolf.org` by default and communicate via DOM events — no wiring required.

### Configuration

Both components work with zero attributes, but there's plenty you can customize.

**Pre-select a region on load** — great for association-specific pages:

```html
<!-- Load with Northern Ohio Golf Association selected -->
<ohio-county-map default-region="noga"></ohio-county-map>
```

Available region IDs: `noga`, `oga`, `gcga`, `mvg`

**Switch to county-level selection** — selects a single county instead of an entire region:

```html
<ohio-county-map selection-mode="county"></ohio-county-map>
```

**Change results per page:**

```html
<club-search-results page-size="10"></club-search-results>
```

**Point to a different API** (staging, local dev, etc.):

```html
<ohio-county-map api-base-url="https://staging.core.ohiogolf.org"></ohio-county-map>
<club-search-results api-base-url="https://staging.core.ohiogolf.org"></club-search-results>
```

### Theming

Styles are encapsulated in Shadow DOM, but you can theme through CSS custom properties:

```css
ohio-county-map {
  --map-selected-stroke: #003366;    /* selection highlight color */
  --map-muted-opacity: 0.4;         /* dim non-hovered regions */
  --map-font-family: "Georgia", serif;
}

club-search-results {
  --results-link-color: #003366;     /* club name color */
  --results-card-bg: #fafafa;        /* card background */
  --results-font-family: "Georgia", serif;
}
```

See each component's README for the full list of CSS custom properties.

### Events

The components dispatch events you can hook into for navigation, analytics, or custom behavior:

```html
<script>
  // Navigate to a club's page when clicked
  document.addEventListener('club-detail', (e) => {
    window.location.href = `/clubs/${e.detail.clubId}`;
  });

  // Track region selections
  document.addEventListener('county-selected', (e) => {
    analytics.track('region_selected', { region: e.detail.regionId });
  });
</script>
```

| Event | Fires when | Key fields |
|-------|-----------|------------|
| `club-search` | A region or county is selected | `metros` or `counties`, `label` |
| `county-selected` | A county/region is clicked | `county`, `regionId`, `regionName` |
| `club-detail` | A club name is clicked | `clubId`, `clubName` |

See each component's README for full event details.

## Components

- [**`<ohio-county-map>`**](src/components/ohio-county-map/README.md) — Interactive SVG map of Ohio's 88 counties, colored by golf association region.
- [**`<club-search-results>`**](src/components/club-search-results/README.md) — Paginated club results driven by search events.

Both components are fully independent — either can be used alone.

## Development

```bash
bin/setup          # Install dependencies
bin/dev            # Start dev server at http://localhost:5173
```

The dev page loads both components side by side with an event log at the bottom.

## Scripts

| Command | What it does |
|---------|-------------|
| `bin/setup` | Install dependencies |
| `bin/dev` | Start Vite dev server at http://localhost:5173 |
| `bin/test` | Run tests once via Vitest |
| `bin/ci` | Type check, tests, and build (same as CI pipeline) |

## Project structure

```
bin/
  setup                                 Install dependencies
  dev                                   Start dev server
  test                                  Run tests
  ci                                    Type check + tests + build
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
fixtures/
  metros.json                           Mock metros API response (all 88 counties)
  clubs-search.json                     Mock club search API response
index.html                              Dev/test page with both components
```

## Dev mocking

The dev server mocks the API so the components work without a running Rails server. Vite middleware intercepts `/api/metros.json` and `/api/clubs/search.json` and returns fixture data from `fixtures/`. The dev page sets `api-base-url=""` to route requests to the local Vite server. To test against a real API, change it to `api-base-url="https://core.ohiogolf.org"` or `api-base-url="http://localhost:3001"` for a local Rails server.

## SVG map data

`src/data/ohio-counties.ts` contains pre-computed SVG path strings for all 88 Ohio counties. This file is generated from Census TIGER boundaries (`us-atlas` npm package) and committed to git, so cloning and building works without running the generate script.

If Census boundary data ever updates, regenerate with `npm run generate-svg`. The script projects coordinates with Albers centered on Ohio into an 800x700 viewBox and rounds to 1 decimal place for compact output.

## How the build works

`bin/ci` (or `npm run build` directly) bundles everything into a single IIFE file (`dist/ohio-golf-core-components.js`). Loading this file on any page automatically registers both custom elements — no imports or initialization needed.

## Tech stack

- **Vite 6** — build tool (library mode, IIFE output)
- **TypeScript** — type checking only (`noEmit`); Vite handles compilation
- **Vitest** — test runner
- **Vanilla Web Components** — Shadow DOM, no framework dependencies
