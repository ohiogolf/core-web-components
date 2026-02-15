# `<club-search-results>`

Displays paginated golf club results in response to search events. Map-agnostic — it responds to a generic `club-search` event, so any component (the county map, a future Mapbox map, or a simple form) can drive it.

## Usage

```html
<club-search-results api-base-url="https://core.ohiogolf.org"></club-search-results>
```

The component listens for `club-search` events on `document`. It does not manage URLs or navigation — the host page decides what to do with `club-detail` events.

## Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `api-base-url` | `https://core.ohiogolf.org` | Base URL for the club search API endpoint |
| `page-size` | `20` | Number of results per page |

## Data attributes (read-only)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-state` | `empty`, `loading`, `results`, `no-results`, `error` | Current component state. Use for external CSS targeting: `club-search-results[data-state="loading"] { ... }` |

## CSS custom properties

All styling is encapsulated by Shadow DOM. These custom properties are the only way to theme the component from the host page.

| Property | Default | Description |
|----------|---------|-------------|
| `--results-font-family` | `inherit` | Font family |
| `--results-card-border` | `1px solid #e5e7eb` | Club card border |
| `--results-card-bg` | `#ffffff` | Club card background |
| `--results-link-color` | `#003366` | Club name link color |
| `--results-status-bg` | `#f3f4f6` | Status badge background |
| `--results-spinner-color` | `#003366` | Loading spinner color |
| `--results-error-color` | `#cc3333` | Error message color |
| `--results-heading-color` | `#111827` | Results heading color |
| `--results-text-color` | `#374151` | Body text color |
| `--results-pagination-color` | `#003366` | Pagination button color |

## Events listened for

### `club-search` (on `document`)

Triggers a search. The component reads the event's `detail` and fetches matching clubs.

```typescript
// Trigger a search
{ counties: "Franklin", label: "Franklin County" }

// The map no longer dispatches null — clicking the same county is a no-op
```

## Events dispatched

### `club-detail`

Dispatched when a user clicks a club name. Bubbles and crosses shadow boundaries (`composed`). The component does not navigate — the host page decides what to do.

```typescript
{ clubId: 123, clubName: "Scioto Country Club" }
```

### Host page example

```html
<script>
  document.addEventListener('club-detail', (e) => {
    window.location.href = `/clubs/${e.detail.clubId}`;
  });
</script>
```

## States

| State | UI |
|-------|-----|
| `empty` | "Select a county on the map to find golf clubs." |
| `loading` | Spinner with contextual message (e.g., "Searching clubs in Franklin County...") |
| `results` | Club cards with name, status badge, holes, city, phone. Pagination if multiple pages. |
| `no-results` | "No golf clubs found in Franklin County." |
| `error` | "Unable to load clubs. Please try again." with retry button (`role="alert"`) |

## Accessibility

- Results announcement via `aria-live="polite"` so screen readers announce when results arrive
- Error state uses `role="alert"` for immediate screen reader notification
- Pagination uses `<nav aria-label="Pagination">`
