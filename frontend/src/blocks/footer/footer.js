import BaseHTMLElement from '../base/BaseHTMLElement.js';

class Footer extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    async connectedCallback() {
        await this.loadHTML("blocks/footer/footer.template.html");

    }
}

customElements.define('footer-component', Footer);
export default Footer;