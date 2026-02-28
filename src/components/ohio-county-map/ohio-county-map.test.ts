// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OhioCountyMap } from "./ohio-county-map";
import { REGIONS } from "../../data/regions";
import metrosFixture from "../../../fixtures/metros.json";

// Mock the API client to return fixture data without network requests
vi.mock("../../lib/api-client", () => ({
  fetchMetros: vi.fn(() => Promise.resolve(metrosFixture)),
  searchClubs: vi.fn(),
}));

// Register the custom element once
if (!customElements.get("ohio-county-map")) {
  customElements.define("ohio-county-map", OhioCountyMap);
}

function createMap(attrs: Record<string, string> = {}): OhioCountyMap {
  const el = document.createElement("ohio-county-map") as OhioCountyMap;
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

async function mountMap(attrs: Record<string, string> = {}): Promise<OhioCountyMap> {
  const el = createMap(attrs);
  document.body.appendChild(el);
  // Wait for async load to complete
  await vi.waitFor(() => {
    expect(el.getAttribute("data-state")).not.toBe("loading");
  });
  return el;
}

describe("OhioCountyMap", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("loading state", () => {
    it("sets data-state to loading initially", () => {
      const el = createMap();
      document.body.appendChild(el);
      expect(el.getAttribute("data-state")).toBe("loading");
    });

    it("renders a spinner while loading", () => {
      const el = createMap();
      document.body.appendChild(el);
      const spinner = el.shadowRoot!.querySelector(".spinner");
      expect(spinner).not.toBeNull();
    });
  });

  describe("ready state", () => {
    it("sets data-state to ready after loading metros", async () => {
      const el = await mountMap();
      expect(el.getAttribute("data-state")).toBe("ready");
    });

    it("renders 88 county path elements", async () => {
      const el = await mountMap();
      const paths = el.shadowRoot!.querySelectorAll("svg path");
      expect(paths.length).toBe(88);
    });

    it("sets data-county attribute on each path", async () => {
      const el = await mountMap();
      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]');
      expect(franklin).not.toBeNull();
    });

    it("sets fill color from region", async () => {
      const el = await mountMap();
      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      // Franklin is in columbus metro → OGA region → #339933
      expect(franklin.getAttribute("fill")).toBe("#339933");
    });

    it("sets data-region attribute", async () => {
      const el = await mountMap();
      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      expect(franklin.getAttribute("data-region")).toBe("oga");
    });

    it("sets data-metro attribute", async () => {
      const el = await mountMap();
      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      expect(franklin.getAttribute("data-metro")).toBe("columbus");
    });
  });

  describe("accessibility", () => {
    it("sets role=img and aria-label on the SVG", async () => {
      const el = await mountMap();
      const svg = el.shadowRoot!.querySelector("svg")!;
      expect(svg.getAttribute("role")).toBe("img");
      expect(svg.getAttribute("aria-label")).toContain("Ohio counties");
    });

    it("sets role=button and tabindex on county paths", async () => {
      const el = await mountMap();
      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]')!;
      expect(path.getAttribute("role")).toBe("button");
      expect(path.getAttribute("tabindex")).toBe("0");
    });

    it("includes county name and region in aria-label", async () => {
      const el = await mountMap();
      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]')!;
      expect(path.getAttribute("aria-label")).toBe("Franklin County, Ohio Golf Association");
    });
  });

  describe("legend", () => {
    it("renders all 4 regions", async () => {
      const el = await mountMap();
      const items = el.shadowRoot!.querySelectorAll(".legend-item");
      expect(items.length).toBe(4);
    });

    it("includes region names", async () => {
      const el = await mountMap();
      const legend = el.shadowRoot!.querySelector(".legend")!;
      expect(legend.textContent).toContain("Northern Ohio Golf Association");
      expect(legend.textContent).toContain("Ohio Golf Association");
      expect(legend.textContent).toContain("Greater Cincinnati Golf Assoc.");
      expect(legend.textContent).toContain("Miami Valley Golf");
    });

    it("renders region names as links to default URLs", async () => {
      const el = await mountMap();
      const links = el.shadowRoot!.querySelectorAll<HTMLAnchorElement>(".legend-item a");
      expect(links.length).toBe(4);
      for (const link of links) {
        const region = REGIONS.find((r) => r.name === link.textContent);
        expect(region).toBeDefined();
        expect(link.href).toBe(region!.url);
        expect(link.target).toBe("_blank");
        expect(link.rel).toBe("noopener noreferrer");
      }
    });

    it("uses overridden URL from attribute", async () => {
      const el = await mountMap({ "oga-url": "https://custom.example.com/" });
      const links = el.shadowRoot!.querySelectorAll<HTMLAnchorElement>(".legend-item a");
      const ogaLink = Array.from(links).find((a) => a.textContent === "Ohio Golf Association");
      expect(ogaLink!.href).toBe("https://custom.example.com/");
    });
  });

  describe("region mode (default)", () => {
    it("opens the default region URL in a new tab on click", async () => {
      const el = await mountMap();

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      const oga = REGIONS.find((r) => r.id === "oga")!;
      expect(window.open).toHaveBeenCalledWith(oga.url, "_blank", "noopener,noreferrer");
    });

    it("opens an overridden region URL when attribute is set", async () => {
      const el = await mountMap({ "oga-url": "https://custom.example.com/" });

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      expect(window.open).toHaveBeenCalledWith("https://custom.example.com/", "_blank", "noopener,noreferrer");
    });

    it("selects all counties in the region on click", async () => {
      const el = await mountMap();
      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      const selected = el.shadowRoot!.querySelectorAll(".selected");
      // All OGA counties should be selected
      const ogaCounties = el.shadowRoot!.querySelectorAll('[data-region="oga"]');
      expect(selected.length).toBe(ogaCounties.length);
      expect(selected.length).toBeGreaterThan(1);
    });

    it("dispatches club-search with metros for the region", async () => {
      const el = await mountMap();
      const handler = vi.fn();
      el.addEventListener("club-search", handler);

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledOnce();
      }, { timeout: 500 });

      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.label).toBe("Ohio Golf Association");
      expect(event.detail.metros).toBe("columbus");
    });

    it("dispatches county-selected for the clicked county", async () => {
      const el = await mountMap();
      const handler = vi.fn();
      el.addEventListener("county-selected", handler);

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledOnce();
      }, { timeout: 500 });

      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual({
        county: "Franklin",
        regionId: "oga",
        regionName: "Ohio Golf Association",
      });
    });

    it("ignores click on county in already-selected region", async () => {
      const el = await mountMap();
      const handler = vi.fn();

      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      franklin.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {}, { timeout: 400 });

      el.addEventListener("club-search", handler);
      // Click a different county in the same region (OGA)
      const delaware = el.shadowRoot!.querySelector('[data-county="Delaware"]') as SVGPathElement;
      delaware.dispatchEvent(new Event("click"));

      await new Promise((r) => setTimeout(r, 500));
      expect(handler).not.toHaveBeenCalled();
    });

    it("switches selection when clicking a different region", async () => {
      const el = await mountMap();

      const franklin = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      franklin.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {}, { timeout: 400 });

      const handler = vi.fn();
      el.addEventListener("club-search", handler);

      const cuyahoga = el.shadowRoot!.querySelector('[data-county="Cuyahoga"]') as SVGPathElement;
      cuyahoga.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledOnce();
      }, { timeout: 500 });

      // OGA counties should no longer be selected
      const ogaSelected = el.shadowRoot!.querySelectorAll('[data-region="oga"].selected');
      expect(ogaSelected.length).toBe(0);

      // NOGA counties should be selected
      const nogaSelected = el.shadowRoot!.querySelectorAll('[data-region="noga"].selected');
      expect(nogaSelected.length).toBeGreaterThan(0);
    });
  });

  describe("county mode", () => {
    it("selects only the clicked county", async () => {
      const el = await mountMap({ "selection-mode": "county" });
      const handler = vi.fn();
      el.addEventListener("club-search", handler);

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledOnce();
      }, { timeout: 500 });

      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual({ counties: "Franklin", label: "Franklin County" });

      const selected = el.shadowRoot!.querySelectorAll(".selected");
      expect(selected.length).toBe(1);
    });

    it("ignores click on already-selected county", async () => {
      const el = await mountMap({ "selection-mode": "county" });
      const handler = vi.fn();

      const path = el.shadowRoot!.querySelector('[data-county="Franklin"]') as SVGPathElement;
      path.dispatchEvent(new Event("click"));

      await vi.waitFor(() => {}, { timeout: 400 });

      el.addEventListener("club-search", handler);
      path.dispatchEvent(new Event("click"));

      await new Promise((r) => setTimeout(r, 500));
      expect(handler).not.toHaveBeenCalled();
      expect(path.classList.contains("selected")).toBe(true);
    });
  });

  describe("error state", () => {
    it("sets data-state to error when fetch fails", async () => {
      const { fetchMetros } = await import("../../lib/api-client");
      (fetchMetros as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const el = createMap();
      document.body.appendChild(el);

      await vi.waitFor(() => {
        expect(el.getAttribute("data-state")).toBe("error");
      });
    });

    it("renders a retry button on error", async () => {
      const { fetchMetros } = await import("../../lib/api-client");
      (fetchMetros as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const el = createMap();
      document.body.appendChild(el);

      await vi.waitFor(() => {
        expect(el.getAttribute("data-state")).toBe("error");
      });

      const button = el.shadowRoot!.querySelector("button");
      expect(button).not.toBeNull();
      expect(button!.textContent).toContain("Try Again");
    });
  });
});
