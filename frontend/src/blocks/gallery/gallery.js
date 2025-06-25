import BaseHTMLElement from '../base/BaseHTMLElement.js';

export default class GalleryComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/gallery/gallery.template.html');

        const links = this.shadowRoot.querySelectorAll('.gallery__link');
        links.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const href = link.getAttribute('href');
                window.location.hash = href;
            });
        });
    }
}

customElements.define('gallery-component', GalleryComponent);
