import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';
import router from '../../services/router.js';

export default class NavBarComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._onHashChange = this._onHashChange.bind(this);
        this._onCartUpdated = this._onCartUpdated.bind(this);
        this._onAuthChanged = this._onAuthChanged.bind(this);
    }

    async connectedCallback() {
        await this.loadHTML('blocks/nav-bar/nav-bar.template.html');
        const $ = sel => this.shadowRoot.querySelector(sel);

        this.$profileIcon = $('.profile-icon');
        this.$registration = $('.registration-btn');

        this.$badge = $('.navbar__cart-badge');

        this._updateAuthUI();
        await this._updateBadge();

        window.addEventListener('cart-updated', this._onCartUpdated);
        window.addEventListener('auth-changed', this._onAuthChanged);
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
                const href = link.getAttribute('href').replace(/^#/, '');
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
                        const href = link.getAttribute('href').replace(/^#/, '');
                        router.nav(href);
                    });
                });
        }, 0);

        $('.logout-button')?.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('auth-changed'));
            window.dispatchEvent(new CustomEvent('cart-updated'));
            location.reload();
        });
    }

    disconnectedCallback() {
        window.removeEventListener('hashchange', this._onHashChange);
        window.removeEventListener('cart-updated', this._onCartUpdated);
        window.removeEventListener('auth-changed', this._onAuthChanged);
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
            const items = await ApiService.getCartItems(token);
            const total = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
            this.$badge.textContent = total > 0 ? total : '';
        } catch {
            this.$badge.textContent = '';
        }
    }

    _onAuthChanged() {
        this._updateAuthUI();
        this._updateBadge();
    }
    _updateAuthUI() {
        const loggedIn = !!localStorage.getItem('token');
        this.$profileIcon.style.display = loggedIn ? 'flex' : 'none';
        this.$registration.style.display = loggedIn ? 'none' : 'flex';
    }

    _onHashChange() {
        const hideOn = ['#/login', '#/registration'];
        const current = window.location.hash || '#/';
        this.style.display = hideOn.includes(current) ? 'none' : '';
    }
}

customElements.define('nav-bar', NavBarComponent);
