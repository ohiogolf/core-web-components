# Core Web Components

[![CI](https://github.com/ohiogolf/core-web-components/actions/workflows/ci.yml/badge.svg)](https://github.com/ohiogolf/core-web-components/actions/workflows/ci.yml)

Drop-in web components powered by [core.ohiogolf.org](https://core.ohiogolf.org), the CRM for Ohio golf courses and events used by the major AGA associations in the state.

Built as a single JS file that any website can load with a `<script>` tag — no framework required. Add one line to any HTML page you control and the components are ready to use.

```html
<script src="https://ohiogolf.github.io/core-web-components/ohio-golf-core-components.js"></script>
```

This always serves the latest build from `main`. To pin to a specific version, download the JS file from a [GitHub Release](https://github.com/ohiogolf/core-web-components/releases).

> **[See it in action — Live demo](https://ohiogolf.github.io/core-web-components/)**

## Components

### [`<ohio-county-map>`](src/components/ohio-county-map/README.md)

Interactive SVG map of Ohio's 88 counties, colored by golf association region. Click a region to trigger club searches or drive other components.

![ohio-county-map screenshot](docs/images/ohio-county-map.png)

---

### [`<club-search-results>`](src/components/club-search-results/README.md)

Paginated club results panel that responds to search events. Pair it with the county map or drive it from any search source.

![club-search-results screenshot](docs/images/club-search-results.png)
