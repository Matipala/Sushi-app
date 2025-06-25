class BaseHTMLElement extends HTMLElement {
    constructor() {
        super();
    }

    async loadHTML(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load HTML from ${path}: ${response.statusText}`);
        }
        const html = await response.text();

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = html;
        }
        else {
            this.innerHTML = html;
        }
    }

}

export default BaseHTMLElement;