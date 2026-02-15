export class OhioCountyMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    this.shadowRoot!.innerHTML = `<p>ohio-county-map placeholder</p>`;
  }
}
