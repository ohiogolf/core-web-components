export const styles = `
  :host {
    display: block;
    font-family: var(--map-font-family, inherit);
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
  }

  svg path {
    stroke: var(--map-stroke-color, #ffffff);
    stroke-width: var(--map-stroke-width, 0.5);
    cursor: pointer;
    transition: stroke 0.15s ease, stroke-width 0.15s ease;
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
    stroke-width: var(--map-selected-stroke-width, 2.5);
  }

  /* Legend */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #374151;
  }

  .legend-item a {
    color: inherit;
    text-decoration: none;
  }

  .legend-item a:hover {
    text-decoration: underline;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    background: var(--map-tooltip-background, #1f2937);
    color: var(--map-tooltip-color, #ffffff);
    font-size: var(--map-tooltip-font-size, 0.8125rem);
    padding: var(--map-tooltip-padding, 0.25rem 0.5rem);
    border-radius: var(--map-tooltip-border-radius, 0.25rem);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .tooltip.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .tooltip a {
    color: var(--map-tooltip-link-color, #93c5fd);
    text-decoration: none;
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
