export class ClubSearchResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    this.shadowRoot!.innerHTML = `<p>club-search-results placeholder</p>`;
  }
}
