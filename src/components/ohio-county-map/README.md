# `<ohio-county-map>`

Interactive SVG map of Ohio's 88 counties, colored by golf association region. Click a county to dispatch search events that drive a results panel (or anything else listening).

## Usage

```html
<ohio-county-map api-base-url="https://core.ohiogolf.org"></ohio-county-map>
```

The component fetches metro-to-county mappings from the API at runtime, so boundary changes in core propagate automatically without rebuilding.

## Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `api-base-url` | `https://core.ohiogolf.org` | Base URL for the metros API endpoint |
| `default-region` | — | Region ID (e.g., `noga`) to auto-select on load. Highlights all counties in that region and dispatches a `club-search` event. |

## Data attributes (read-only)

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-state` | `loading`, `ready`, `error` | Current component state. Use for external CSS targeting: `ohio-county-map[data-state="loading"] { ... }` |

## CSS custom properties

All styling is encapsulated by Shadow DOM. These custom properties are the only way to theme the component from the host page.

| Property | Default | Description |
|----------|---------|-------------|
| `--map-stroke-color` | `#ffffff` | Border color between counties |
| `--map-stroke-width` | `0.5` | Border width between counties |
| `--map-hover-opacity` | `0.8` | Opacity of the hovered county |
| `--map-muted-opacity` | `0.3` | Opacity of non-hovered counties when one is hovered |
| `--map-selected-stroke` | `#FFD700` | Stroke color for the selected county |
| `--map-selected-stroke-width` | `2.5` | Stroke width for the selected county |
| `--map-font-family` | `inherit` | Font family for the legend |
| `--map-spinner-color` | `#003366` | Loading spinner color |

## Events dispatched

### `club-search`

Dispatched when a county is clicked. Bubbles and crosses shadow boundaries (`composed`).

```typescript
// Select a county
{ counties: "Franklin", label: "Franklin County" }

// Deselect (click same county again)
null
```

### `county-selected`

Dispatched alongside `club-search` when a county is selected. Intended for host page use (URL sync, analytics, etc.).

```typescript
{ county: "Franklin", regionId: "oga", regionName: "Ohio Golf Association" }
```

## Behavior

- **Hover:** highlights the hovered county and mutes all others
- **Click:** selects the county with a gold stroke, dispatches events. Click again to deselect.
- **Keyboard:** counties are focusable with Tab. Enter or Space to select.
- **Loading:** shows a spinner while fetching metro data
- **Error:** shows a retry message if the fetch fails
- **Legend:** displays all four golf association regions with colored swatches (display only)

## Accessibility

- SVG has `role="img"` with a descriptive `aria-label`
- Each county path has `role="button"`, `tabindex="0"`, and an `aria-label` like "Franklin County, Ohio Golf Association"
- Keyboard navigation with Tab, selection with Enter/Space
