export const styles = `
  :host {
    display: block;
    font-family: var(--map-font-family, system-ui, -apple-system, sans-serif);
    font-weight: var(--map-font-weight, 400);
    position: relative;
  }

  /* Loading state */
  .spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: var(--map-spinner-color, #003366);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error state */
  .error {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: #ffffff;
    cursor: pointer;
    font: inherit;
  }

  .error button:hover {
    background: #f3f4f6;
  }

  /* SVG map */
  svg {
    width: 100%;
    height: auto;
    position: relative;
  }


  svg path {
    stroke: var(--map-stroke-color, #ffffff);
    stroke-width: var(--map-stroke-width, 0.5);
    cursor: pointer;
    transition: stroke 0.15s ease, stroke-width 0.15s ease, filter 0.15s ease;
  }

  svg path:hover {
    filter: brightness(1.15);
    stroke-width: 1.5;
  }

  svg path:focus {
    outline: none;
  }

  svg path:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }

  /* Selected county */
  svg path.selected {
    stroke: var(--map-selected-stroke, #FFD700);
    stroke-width: var(--map-selected-stroke-width, 3);
    filter: brightness(1.2);
  }

  /* Legend */
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--map-legend-font-size, 1rem);
    color: #374151;
  }

  .legend-item a,
  .legend-item a:link,
  .legend-item a:visited {
    color: inherit;
    text-decoration: none;
  }

  .legend-item a:hover {
    text-decoration: underline;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    z-index: 10;
    display: flex;
    flex-direction: column;
    background: var(--map-tooltip-background, #1f2937);
    color: var(--map-tooltip-color, #ffffff);
    font-size: var(--map-tooltip-font-size, 1rem);
    line-height: 1.3;
    padding: var(--map-tooltip-padding, 0.5rem 0.75rem);
    border-radius: var(--map-tooltip-border-radius, 0.5rem);
    white-space: nowrap;
    cursor: default;
    visibility: hidden;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
  }

  .tooltip.visible {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }

  .tooltip a,
  .tooltip a:link,
  .tooltip a:visited {
    color: var(--map-tooltip-link-color, #93c5fd);
    text-decoration: none;
    cursor: pointer;
  }

  .tooltip a:hover {
    text-decoration: underline;
  }

  .legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Touch devices: larger tap targets */
  @media (pointer: coarse) {
    svg path {
      stroke-width: var(--map-touch-stroke-width, 1.5);
    }
  }

  /* Narrow screens: stack legend */
  @media (max-width: 400px) {
    .legend {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
`;
