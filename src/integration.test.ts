// @vitest-environment happy-dom

/**
 * Integration tests: both components mounted together, verifying the full
 * event flow from map click through to results rendering.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { OhioCountyMap } from "./components/ohio-county-map/ohio-county-map";
import { ClubSearchResults } from "./components/club-search-results/club-search-results";
import metrosFixture from "../fixtures/metros.json";
import clubsFixture from "../fixtures/clubs-search.json";

vi.mock("./lib/api-client", () => ({
  fetchMetros: vi.fn(() => Promise.resolve(metrosFixture)),
  searchClubs: vi.fn(() => Promise.resolve(clubsFixture)),
}));

if (!customElements.get("ohio-county-map")) {
  customElements.define("ohio-county-map", OhioCountyMap);
}
if (!customElements.get("club-search-results")) {
  customElements.define("club-search-results", ClubSearchResults);
}

async function mountBoth() {
  const map = document.createElement("ohio-county-map") as OhioCountyMap;
  const results = document.createElement("club-search-results") as ClubSearchResults;
  map.setAttribute("api-base-url", "");
  results.setAttribute("api-base-url", "");
  document.body.appendChild(map);
  document.body.appendChild(results);

  // Wait for map to load
  await vi.waitFor(() => {
    expect(map.getAttribute("data-state")).toBe("ready");
  });

  return { map, results };
}

function clickCounty(map: OhioCountyMap, name: string) {
  const path = map.shadowRoot!.querySelector(`[data-county="${name}"]`)!;
  path.dispatchEvent(new Event("click"));
}

describe("Integration: map + results", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("results start in empty state", async () => {
    const { results } = await mountBoth();
    expect(results.getAttribute("data-state")).toBe("empty");
  });

  it("clicking a county triggers results to load and display clubs", async () => {
    const { map, results } = await mountBoth();

    clickCounty(map, "Franklin");

    // Results should go to loading then results (after debounce + fetch)
    await vi.waitFor(() => {
      expect(results.getAttribute("data-state")).toBe("results");
    }, { timeout: 1000 });

    const cards = results.shadowRoot!.querySelectorAll(".club-card");
    expect(cards.length).toBe(5);
  });

  it("clicking the same county again is a no-op", async () => {
    const { map, results } = await mountBoth();

    clickCounty(map, "Franklin");
    await vi.waitFor(() => {
      expect(results.getAttribute("data-state")).toBe("results");
    }, { timeout: 1000 });

    // Click again — should stay selected with results visible
    clickCounty(map, "Franklin");
    await new Promise((r) => setTimeout(r, 500));
    expect(results.getAttribute("data-state")).toBe("results");
  });

  it("clicking a different county triggers a new search", async () => {
    const { map, results } = await mountBoth();

    clickCounty(map, "Franklin");
    await vi.waitFor(() => {
      expect(results.getAttribute("data-state")).toBe("results");
    }, { timeout: 1000 });

    const { searchClubs } = await import("./lib/api-client");
    (searchClubs as ReturnType<typeof vi.fn>).mockClear();

    clickCounty(map, "Cuyahoga");
    await vi.waitFor(() => {
      expect(searchClubs).toHaveBeenCalled();
    }, { timeout: 1000 });

    const call = (searchClubs as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toBe("Cuyahoga");
  });

  it("club-detail event bubbles from results to document", async () => {
    const { map, results } = await mountBoth();
    const handler = vi.fn();
    document.addEventListener("club-detail", handler);

    clickCounty(map, "Franklin");
    await vi.waitFor(() => {
      expect(results.getAttribute("data-state")).toBe("results");
    }, { timeout: 1000 });

    const btn = results.shadowRoot!.querySelector(".club-name button") as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledOnce();
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.clubId).toBe(101);
    expect(event.detail.clubName).toBe("Scioto Country Club");

    document.removeEventListener("club-detail", handler);
  });

  it("all three event types reach document", async () => {
    const { map } = await mountBoth();
    const clubSearchHandler = vi.fn();
    const countySelectedHandler = vi.fn();
    document.addEventListener("club-search", clubSearchHandler);
    document.addEventListener("county-selected", countySelectedHandler);

    clickCounty(map, "Franklin");

    await vi.waitFor(() => {
      expect(clubSearchHandler).toHaveBeenCalled();
      expect(countySelectedHandler).toHaveBeenCalled();
    }, { timeout: 1000 });

    expect(clubSearchHandler.mock.calls[0][0].detail).toEqual({
      counties: "Franklin",
      label: "Franklin County",
    });
    expect(countySelectedHandler.mock.calls[0][0].detail).toEqual({
      county: "Franklin",
      regionId: "oga",
      regionName: "Ohio Golf Association",
    });

    document.removeEventListener("club-search", clubSearchHandler);
    document.removeEventListener("county-selected", countySelectedHandler);
  });
});
