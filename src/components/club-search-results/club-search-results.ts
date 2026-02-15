import { searchClubs, type Club, type ClubSearchResponse } from "../../lib/api-client";
import { dispatchClubDetail, type ClubSearchDetail } from "../../lib/events";
import { styles } from "./club-search-results.styles";

export class ClubSearchResults extends HTMLElement {
  private currentQuery: { counties?: string; metros?: string } | null = null;
  private currentLabel: string | null = null;
  private currentPage = 1;
  private lastResponse: ClubSearchResponse | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleClubSearch = this.handleClubSearch.bind(this);
  }

  connectedCallback() {
    this.setState("empty");
    this.renderEmpty();
    document.addEventListener("club-search", this.handleClubSearch as EventListener);
  }

  disconnectedCallback() {
    document.removeEventListener("club-search", this.handleClubSearch as EventListener);
  }

  private get baseUrl(): string {
    return this.getAttribute("api-base-url") ?? "https://core.ohiogolf.org";
  }

  private get pageSize(): number {
    return parseInt(this.getAttribute("page-size") ?? "20", 10);
  }

  private setState(state: string) {
    this.setAttribute("data-state", state);
  }

  private handleClubSearch(e: CustomEvent<ClubSearchDetail | null>) {
    const detail = e.detail;

    if (!detail) {
      this.currentQuery = null;
      this.currentLabel = null;
      this.currentPage = 1;
      this.lastResponse = null;
      this.setState("empty");
      this.renderEmpty();
      return;
    }

    this.currentQuery = { counties: detail.counties, metros: detail.metros };
    this.currentLabel = detail.label;
    this.currentPage = 1;
    this.fetchResults();
  }

  private async fetchResults() {
    if (!this.currentQuery) return;

    this.setState("loading");
    this.renderLoading();

    try {
      const response = await searchClubs(
        this.baseUrl,
        this.currentQuery,
        this.currentPage,
        this.pageSize,
      );
      this.lastResponse = response;

      if (response.clubs.length === 0) {
        this.setState("no-results");
        this.renderNoResults();
      } else {
        this.setState("results");
        this.renderResults(response);
      }
    } catch {
      this.setState("error");
      this.renderError();
    }
  }

  private renderEmpty() {
    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="empty">
        <p>Select a county on the map to find golf clubs.</p>
      </div>
    `;
  }

  private renderLoading() {
    const message = this.currentLabel
      ? `Searching clubs in ${this.currentLabel}...`
      : "Searching...";

    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="spinner-container">
        <div class="spinner"></div>
        <div class="spinner-label">${message}</div>
      </div>
    `;
  }

  private renderNoResults() {
    const label = this.currentLabel ?? "this area";
    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="no-results">
        <p>No golf clubs found in ${label}.</p>
      </div>
    `;
  }

  private renderError() {
    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="error" role="alert">
        <p>Unable to load clubs. Please try again.</p>
        <button type="button">Try Again</button>
      </div>
    `;
    this.shadowRoot!.querySelector("button")!.addEventListener("click", () => {
      this.fetchResults();
    });
  }

  private renderResults(response: ClubSearchResponse) {
    const root = this.shadowRoot!;
    root.innerHTML = `<style>${styles}</style>`;

    // Accessible live region for screen readers
    const announcement = document.createElement("div");
    announcement.className = "sr-only";
    announcement.setAttribute("aria-live", "polite");
    announcement.textContent = `Found ${response.meta.total_count} club${response.meta.total_count === 1 ? "" : "s"} in ${this.currentLabel ?? "this area"}.`;
    root.appendChild(announcement);

    // Heading
    const heading = document.createElement("h2");
    heading.className = "results-heading";
    heading.textContent = `${response.meta.total_count} club${response.meta.total_count === 1 ? "" : "s"} in ${this.currentLabel ?? "this area"}`;
    root.appendChild(heading);

    // Club cards
    for (const club of response.clubs) {
      root.appendChild(this.buildClubCard(club));
    }

    // Pagination
    if (response.meta.total_pages > 1) {
      root.appendChild(this.buildPagination(response));
    }
  }

  private buildClubCard(club: Club): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "club-card";

    // Club name as a button that dispatches club-detail
    const nameEl = document.createElement("h3");
    nameEl.className = "club-name";
    const nameBtn = document.createElement("button");
    nameBtn.type = "button";
    nameBtn.textContent = club.name;
    nameBtn.addEventListener("click", () => {
      dispatchClubDetail(this, { clubId: club.id, clubName: club.name });
    });
    nameEl.appendChild(nameBtn);
    card.appendChild(nameEl);

    // Meta line: status, holes, city, phone
    const meta = document.createElement("div");
    meta.className = "club-meta";

    const status = document.createElement("span");
    status.className = "status-badge";
    status.textContent = club.status;
    meta.appendChild(status);

    if (club.num_holes) {
      const holes = document.createElement("span");
      holes.textContent = `${club.num_holes} holes`;
      meta.appendChild(holes);
    }

    if (club.address?.city) {
      const city = document.createElement("span");
      city.textContent = `${club.address.city}, ${club.address.state}`;
      meta.appendChild(city);
    }

    if (club.phones?.length > 0) {
      const phone = document.createElement("span");
      phone.textContent = club.phones[0].number;
      meta.appendChild(phone);
    }

    card.appendChild(meta);
    return card;
  }

  private buildPagination(response: ClubSearchResponse): HTMLElement {
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Pagination");
    nav.className = "pagination";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "Previous";
    prev.disabled = response.meta.current_page <= 1;
    prev.addEventListener("click", () => {
      this.currentPage--;
      this.fetchResults();
    });

    const pageInfo = document.createElement("span");
    pageInfo.className = "page-info";
    pageInfo.textContent = `Page ${response.meta.current_page} of ${response.meta.total_pages}`;

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    next.disabled = response.meta.current_page >= response.meta.total_pages;
    next.addEventListener("click", () => {
      this.currentPage++;
      this.fetchResults();
    });

    nav.appendChild(prev);
    nav.appendChild(pageInfo);
    nav.appendChild(next);
    return nav;
  }
}
