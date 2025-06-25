import BaseHTMLElement from '../base/BaseHTMLElement.js';

export default class ModalMenu extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/modal-menu/modal-menu.template.html');
    }
}

customElements.define('modal-menu', ModalMenu);
