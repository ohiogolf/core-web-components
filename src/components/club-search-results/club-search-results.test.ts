// @vitest-environment happy-dom

import { describe, it, expect, vi, afterEach } from "vitest";
import { ClubSearchResults } from "./club-search-results";
import clubsFixture from "../../../fixtures/clubs-search.json";

const emptyResponse = { clubs: [], meta: { total_count: 0, total_pages: 0, current_page: 1, per_page: 20 } };

const pagedResponse = {
  clubs: clubsFixture.clubs.slice(0, 2),
  meta: { total_count: 25, total_pages: 3, current_page: 1, per_page: 2 },
};

// Mock the API client
vi.mock("../../lib/api-client", () => ({
  fetchMetros: vi.fn(),
  searchClubs: vi.fn(() => Promise.resolve(clubsFixture)),
}));

if (!customElements.get("club-search-results")) {
  customElements.define("club-search-results", ClubSearchResults);
}

function createResults(attrs: Record<string, string> = {}): ClubSearchResults {
  const el = document.createElement("club-search-results") as ClubSearchResults;
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

function mountResults(attrs: Record<string, string> = {}): ClubSearchResults {
  const el = createResults(attrs);
  document.body.appendChild(el);
  return el;
}

function dispatchSearch(counties: string, label: string) {
  document.dispatchEvent(
    new CustomEvent("club-search", {
      detail: { counties, label },
      bubbles: true,
      composed: true,
    }),
  );
}

function dispatchClearSearch() {
  document.dispatchEvent(
    new CustomEvent("club-search", {
      detail: null,
      bubbles: true,
      composed: true,
    }),
  );
}

async function waitForState(el: ClubSearchResults, state: string) {
  await vi.waitFor(() => {
    expect(el.getAttribute("data-state")).toBe(state);
  });
}

describe("ClubSearchResults", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("empty state", () => {
    it("sets data-state to empty on mount", () => {
      const el = mountResults();
      expect(el.getAttribute("data-state")).toBe("empty");
    });

    it("shows a prompt to select a county", () => {
      const el = mountResults();
      const text = el.shadowRoot!.textContent;
      expect(text).toContain("Select a county");
    });
  });

  describe("loading state", () => {
    it("sets data-state to loading when search event received", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      // Loading is set synchronously before the fetch resolves
      expect(el.getAttribute("data-state")).toBe("loading");
    });

    it("shows contextual loading message", () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      const text = el.shadowRoot!.textContent;
      expect(text).toContain("Searching clubs in Franklin County");
    });
  });

  describe("results state", () => {
    it("sets data-state to results after successful fetch", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");
    });

    it("renders club cards", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const cards = el.shadowRoot!.querySelectorAll(".club-card");
      expect(cards.length).toBe(5);
    });

    it("renders club name as a button", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const btn = el.shadowRoot!.querySelector(".club-name button");
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toBe("Scioto Country Club");
    });

    it("renders status badge", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const badge = el.shadowRoot!.querySelector(".status-badge");
      expect(badge!.textContent).toBe("private");
    });

    it("renders results heading with count", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const heading = el.shadowRoot!.querySelector(".results-heading");
      expect(heading!.textContent).toContain("5 clubs");
      expect(heading!.textContent).toContain("Franklin County");
    });

    it("renders aria-live announcement", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const live = el.shadowRoot!.querySelector("[aria-live]");
      expect(live).not.toBeNull();
      expect(live!.textContent).toContain("Found 5 clubs");
    });
  });

  describe("club-detail event", () => {
    it("dispatches club-detail when View Details is clicked", async () => {
      const el = mountResults({ "api-base-url": "" });
      const handler = vi.fn();
      el.addEventListener("club-detail", handler);

      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const btn = el.shadowRoot!.querySelector(".club-name button") as HTMLButtonElement;
      btn.click();

      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual({ clubId: 101, clubName: "Scioto Country Club" });
    });
  });

  describe("no-results state", () => {
    it("shows no-results message for empty response", async () => {
      const { searchClubs } = await import("../../lib/api-client");
      (searchClubs as ReturnType<typeof vi.fn>).mockResolvedValueOnce(emptyResponse);

      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Noble", "Noble County");
      await waitForState(el, "no-results");

      const text = el.shadowRoot!.textContent;
      expect(text).toContain("No golf clubs found in Noble County");
    });
  });

  describe("error state", () => {
    it("sets data-state to error when fetch fails", async () => {
      const { searchClubs } = await import("../../lib/api-client");
      (searchClubs as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "error");
    });

    it("renders error message with retry button", async () => {
      const { searchClubs } = await import("../../lib/api-client");
      (searchClubs as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "error");

      const errorDiv = el.shadowRoot!.querySelector(".error");
      expect(errorDiv!.getAttribute("role")).toBe("alert");
      expect(errorDiv!.textContent).toContain("Unable to load clubs");

      const btn = el.shadowRoot!.querySelector(".error button");
      expect(btn).not.toBeNull();
    });
  });

  describe("clear/deselect", () => {
    it("returns to empty state when club-search dispatches null", async () => {
      const el = mountResults({ "api-base-url": "" });

      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      dispatchClearSearch();
      expect(el.getAttribute("data-state")).toBe("empty");
      expect(el.shadowRoot!.textContent).toContain("Select a county");
    });
  });

  describe("pagination", () => {
    it("renders pagination when multiple pages", async () => {
      const { searchClubs } = await import("../../lib/api-client");
      (searchClubs as ReturnType<typeof vi.fn>).mockResolvedValueOnce(pagedResponse);

      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const nav = el.shadowRoot!.querySelector("nav[aria-label='Pagination']");
      expect(nav).not.toBeNull();
      expect(nav!.textContent).toContain("Page 1 of 3");
    });

    it("disables Previous on first page", async () => {
      const { searchClubs } = await import("../../lib/api-client");
      (searchClubs as ReturnType<typeof vi.fn>).mockResolvedValueOnce(pagedResponse);

      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const prev = el.shadowRoot!.querySelectorAll(".pagination button")[0] as HTMLButtonElement;
      expect(prev.disabled).toBe(true);
    });

    it("does not render pagination for single page", async () => {
      const el = mountResults({ "api-base-url": "" });
      dispatchSearch("Franklin", "Franklin County");
      await waitForState(el, "results");

      const nav = el.shadowRoot!.querySelector("nav");
      expect(nav).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("removes event listener on disconnect", () => {
      const el = mountResults();
      document.body.removeChild(el);

      // After removal, dispatching should not change state
      el.setAttribute("data-state", "empty");
      dispatchSearch("Franklin", "Franklin County");
      expect(el.getAttribute("data-state")).toBe("empty");
    });
  });
});
