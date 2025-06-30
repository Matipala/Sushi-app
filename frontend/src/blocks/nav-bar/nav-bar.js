import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { getCartItems } from '../../api.js';
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

        // Elementos de login/logout
        this.$profileIcon = $('.profile-icon');
        this.$registration = $('.registration-btn');

        // Badge del carrito
        this.$badge = $('.navbar__cart-badge');

        // Inicializa UI
        this._updateAuthUI();
        await this._updateBadge();

        // Listeners globales
        window.addEventListener('cart-updated', this._onCartUpdated);
        window.addEventListener('auth-changed', this._onAuthChanged);
        window.addEventListener('hashchange', this._onHashChange);

        // Toggle modal-menu
        const toggle = $('[data-toggle]');
        const modal = this.shadowRoot.querySelector('modal-menu');
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('navbar__menu-toggle--active');
            modal.classList.toggle('navbar__modal-menu--hide');
        });

        // Enlaces del navbar
        this.shadowRoot.querySelectorAll('a[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                let href = link.getAttribute('href').replace(/^#/, '');
                router.nav(href);
            });
        });

        // Enlaces dentro del modal
        setTimeout(() => {
            modal.shadowRoot
                ?.querySelectorAll('a[data-link]')
                .forEach(link => {
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        toggle.classList.remove('navbar__menu-toggle--active');
                        modal.classList.add('navbar__modal-menu--hide');
                        let href = link.getAttribute('href').replace(/^#/, '');
                        router.nav(href);
                    });
                });
        }, 0);

        // Logout
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

    // Actualiza indicador de carrito
    async _onCartUpdated() {
        await this._updateBadge();
    }
    async _updateBadge() {
        const token = localStorage.getItem('token');
        if (!token) return this.$badge.textContent = '';
        try {
            const items = await getCartItems(token);
            const total = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
            this.$badge.textContent = total > 0 ? total : '';
        } catch {
            this.$badge.textContent = '';
        }
    }

    // Muestra u oculta perfil vs registro
    _onAuthChanged() {
        this._updateAuthUI();
        this._updateBadge(); // limpia badge si hace logout
    }
    _updateAuthUI() {
        const loggedIn = !!localStorage.getItem('token');
        this.$profileIcon.style.display = loggedIn ? 'flex' : 'none';
        this.$registration.style.display = loggedIn ? 'none' : 'flex';
    }

    // Oculta navbar en ciertas rutas
    _onHashChange() {
        const hideOn = ['#/login', '#/registration'];
        const current = window.location.hash || '#/';
        this.style.display = hideOn.includes(current) ? 'none' : '';
    }
}

customElements.define('nav-bar', NavBarComponent);
