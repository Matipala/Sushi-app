import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { getCartItems } from '../../api.js';
import router from '../../services/router.js';

export default class NavBarComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._onHashChange = this._onHashChange.bind(this);
        this._onCartUpdated = this._onCartUpdated.bind(this);
    }

    async connectedCallback() {
        await this.loadHTML('blocks/nav-bar/nav-bar.template.html');
        const $ = sel => this.shadowRoot.querySelector(sel);

        this.$badge = $('.navbar__cart-badge');

        await this._updateBadge();
        window.addEventListener('cart-updated', this._onCartUpdated);

        this._onHashChange();
        window.addEventListener('hashchange', this._onHashChange);

        const toggle = $('[data-toggle]');
        const modal = this.shadowRoot.querySelector('modal-menu');
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('navbar__menu-toggle--active');
            modal.classList.toggle('navbar__modal-menu--hide');
        });

        this.shadowRoot.querySelectorAll('a[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                let href = link.getAttribute('href');
                if (href.startsWith('#')) href = href.slice(1);
                router.nav(href);
            });
        });

        setTimeout(() => {
            modal.shadowRoot
                ?.querySelectorAll('a[data-link]')
                .forEach(link => {
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        toggle.classList.remove('navbar__menu-toggle--active');
                        modal.classList.add('navbar__modal-menu--hide');
                        let href = link.getAttribute('href');
                        if (href.startsWith('#')) href = href.slice(1);
                        router.nav(href);
                    });
                });
        }, 0);

        const logoutBtn = $('.logout-button');
        logoutBtn?.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('cart-updated'));
            router.nav('/login');
        });
    }

    disconnectedCallback() {
        window.removeEventListener('hashchange', this._onHashChange);
        window.removeEventListener('cart-updated', this._onCartUpdated);
    }

    async _onCartUpdated() {
        await this._updateBadge();
    }

    async _updateBadge() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.$badge.textContent = '';
            return;
        }
        try {
            const items = await getCartItems(token);
            const total = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
            this.$badge.textContent = total > 0 ? total : '';
        } catch {
            this.$badge.textContent = '';
        }
    }

    _onHashChange() {
        const hideOn = ['#/login', '#/registration'];
        const current = window.location.hash || '#/';
        this.style.display = hideOn.includes(current) ? 'none' : '';
    }
}

customElements.define('nav-bar', NavBarComponent);
