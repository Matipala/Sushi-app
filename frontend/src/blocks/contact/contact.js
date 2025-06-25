import BaseHTMLElement from '../base/BaseHTMLElement.js';

export default class ContactComponent extends BaseHTMLElement {
    async connectedCallback() {
        await this.loadHTML('blocks/contact/contact.template.html');

        this.shadowRoot.querySelectorAll('[data-link]').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                window.location.hash = a.getAttribute('href');
            });
        });
    }
}

customElements.define('contact-component', ContactComponent);
