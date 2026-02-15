export const styles = `
  :host {
    display: block;
    font-family: var(--results-font-family, inherit);
    color: var(--results-text-color, #374151);
  }

  /* Loading state */
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--results-spinner-color, #003366);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spinner-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Empty state */
  .empty {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  /* Error state */
  .error {
    text-align: center;
    padding: 2rem;
    color: var(--results-error-color, #cc3333);
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: #ffffff;
    color: var(--results-text-color, #374151);
    cursor: pointer;
    font: inherit;
  }

  .error button:hover {
    background: #f3f4f6;
  }

  /* No results */
  .no-results {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  /* Results heading */
  .results-heading {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--results-heading-color, #111827);
  }

  /* Club cards */
  .club-card {
    border: var(--results-card-border, 1px solid #e5e7eb);
    border-radius: 0.5rem;
    background: var(--results-card-bg, #ffffff);
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .club-card:last-child {
    margin-bottom: 0;
  }

  .club-name {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .club-name button {
    background: none;
    border: none;
    padding: 0;
    color: var(--results-link-color, #003366);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
  }

  .club-name button:hover {
    text-decoration: underline;
  }

  .club-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .club-meta span:not(:last-child)::after {
    content: "·";
    margin-left: 0.5rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: var(--results-status-bg, #f3f4f6);
    font-size: 0.75rem;
    text-transform: capitalize;
  }

  /* Pagination */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.25rem;
    font-size: 0.875rem;
  }

  .pagination button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--results-pagination-color, #003366);
    border-radius: 0.375rem;
    background: #ffffff;
    color: var(--results-pagination-color, #003366);
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
  }

  .pagination button:hover:not(:disabled) {
    background: var(--results-pagination-color, #003366);
    color: #ffffff;
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pagination .page-info {
    color: #6b7280;
  }

  /* Screen reader announcements */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
