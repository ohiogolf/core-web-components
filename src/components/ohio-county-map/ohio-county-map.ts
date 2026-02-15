import { OHIO_COUNTIES } from "../../data/ohio-counties";
import { REGIONS, type Region } from "../../data/regions";
import { fetchMetros, type MetrosResponse } from "../../lib/api-client";
import { dispatchClubSearch, dispatchCountySelected } from "../../lib/events";
import { styles } from "./ohio-county-map.styles";

const SVG_NS = "http://www.w3.org/2000/svg";

export class OhioCountyMap extends HTMLElement {
  private countyToMetro = new Map<string, string>();
  private countyToRegion = new Map<string, Region>();
  private selectedCounty: string | null = null;
  private selectedRegion: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.load();
  }

  private get baseUrl(): string {
    return this.getAttribute("api-base-url") ?? "https://core.ohiogolf.org";
  }

  private get selectionMode(): "region" | "county" {
    const mode = this.getAttribute("selection-mode");
    return mode === "county" ? "county" : "region";
  }

  private async load() {
    this.setState("loading");
    this.renderLoading();

    try {
      const metros = await fetchMetros(this.baseUrl);
      this.buildLookups(metros);
      this.setState("ready");
      this.renderMap();

      const defaultRegion = this.getAttribute("default-region");
      if (defaultRegion) {
        this.selectRegion(defaultRegion);
      }
    } catch {
      this.setState("error");
      this.renderError();
    }
  }

  private setState(state: string) {
    this.setAttribute("data-state", state);
  }

  private buildLookups(metros: MetrosResponse) {
    for (const [metro, counties] of Object.entries(metros)) {
      const region = REGIONS.find((r) => r.metros.includes(metro));
      for (const county of counties) {
        this.countyToMetro.set(county, metro);
        if (region) {
          this.countyToRegion.set(county, region);
        }
      }
    }
  }

  private renderLoading() {
    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
    `;
  }

  private renderError() {
    this.shadowRoot!.innerHTML = `
      <style>${styles}</style>
      <div class="error">
        <p>Unable to load map data.</p>
        <button type="button">Try Again</button>
      </div>
    `;
    this.shadowRoot!.querySelector("button")!.addEventListener("click", () => {
      this.load();
    });
  }

  private renderMap() {
    const root = this.shadowRoot!;
    root.innerHTML = `<style>${styles}</style>`;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 800 700");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Interactive map of Ohio counties by golf association region");

    for (const [name, pathData] of Object.entries(OHIO_COUNTIES)) {
      const region = this.countyToRegion.get(name);
      const metro = this.countyToMetro.get(name);

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", region?.color ?? "#cccccc");
      path.setAttribute("data-county", name);
      if (metro) path.setAttribute("data-metro", metro);
      if (region) path.setAttribute("data-region", region.id);
      path.setAttribute("role", "button");
      path.setAttribute("tabindex", "0");
      path.setAttribute(
        "aria-label",
        `${name} County${region ? `, ${region.name}` : ""}`,
      );

      path.addEventListener("mouseenter", () => {
        svg.classList.add("has-hover");
        if (this.selectionMode === "region" && region) {
          svg.querySelectorAll(`[data-region="${region.id}"]`).forEach((p) =>
            p.classList.add("hovered"),
          );
        } else {
          path.classList.add("hovered");
        }
      });

      path.addEventListener("mouseleave", () => {
        svg.classList.remove("has-hover");
        svg.querySelectorAll(".hovered").forEach((p) =>
          p.classList.remove("hovered"),
        );
      });

      path.addEventListener("click", () => this.handleSelect(name));
      path.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleSelect(name);
        }
      });

      svg.appendChild(path);
    }

    root.appendChild(svg);
    root.appendChild(this.buildLegend());
  }

  private handleSelect(county: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.selectionMode === "region") {
      this.handleRegionSelect(county);
    } else {
      this.handleCountySelect(county);
    }
  }

  private handleCountySelect(county: string) {
    const svg = this.shadowRoot!.querySelector("svg")!;

    if (this.selectedCounty === county) {
      return;
    }

    svg.querySelectorAll(".selected").forEach((p) => p.classList.remove("selected"));
    const path = svg.querySelector(`[data-county="${county}"]`);
    path?.classList.add("selected");
    this.selectedCounty = county;

    const region = this.countyToRegion.get(county);

    this.debounceTimer = setTimeout(() => {
      dispatchClubSearch(this, {
        counties: county,
        label: `${county} County`,
      });

      if (region) {
        dispatchCountySelected(this, {
          county,
          regionId: region.id,
          regionName: region.name,
        });
      }
    }, 300);
  }

  private handleRegionSelect(county: string) {
    const region = this.countyToRegion.get(county);
    if (!region) return;

    if (this.selectedRegion === region.id) {
      return;
    }

    this.selectRegion(region.id, county);
  }

  private selectRegion(regionId: string, triggeredByCounty?: string) {
    const svg = this.shadowRoot!.querySelector("svg")!;
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;

    svg.querySelectorAll(".selected").forEach((p) => p.classList.remove("selected"));
    this.selectedRegion = regionId;

    const counties: string[] = [];
    for (const [county, r] of this.countyToRegion) {
      if (r.id === regionId) {
        counties.push(county);
        svg.querySelector(`[data-county="${county}"]`)?.classList.add("selected");
      }
    }

    if (counties.length > 0) {
      this.debounceTimer = setTimeout(() => {
        dispatchClubSearch(this, {
          metros: region.metros.join(","),
          label: region.name,
        });

        if (triggeredByCounty) {
          dispatchCountySelected(this, {
            county: triggeredByCounty,
            regionId: region.id,
            regionName: region.name,
          });
        }
      }, 300);
    }
  }

  private buildLegend(): HTMLDivElement {
    const legend = document.createElement("div");
    legend.className = "legend";

    for (const region of REGIONS) {
      const item = document.createElement("div");
      item.className = "legend-item";

      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.backgroundColor = region.color;

      const label = document.createElement("span");
      label.textContent = region.name;

      item.appendChild(swatch);
      item.appendChild(label);
      legend.appendChild(item);
    }

    return legend;
  }
}
