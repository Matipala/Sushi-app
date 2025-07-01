import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

export default class MenuComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.page = 1;
        this.limit = 10;
        this.loading = false;
        this.hasMore = true;
        this.categories = [];
        this.currentCategory = 'all';
    }

    async connectedCallback() {
        await this.loadHTML('blocks/menu/menu.template.html');

        this.$filters = this.shadowRoot.querySelector('.menu__filters');
        this.$list = this.shadowRoot.querySelector('.menu__items');

        if (!this.$filters || !this.$list) {
            console.error('Faltan selectores en menu.template.html');
            return;
        }

        try {
            this.categories = await ApiService.getCategories();
        } catch (err) {
            console.error('Error al cargar categorías:', err);
        }
        this._renderFilters();

        this.sentinel = document.createElement('div');
        this.sentinel.className = 'scroll-sentinel';
        this.$list.parentNode.insertBefore(this.sentinel, this.$list.nextSibling);

        this.observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !this.loading && this.hasMore) {
                    this.loadNextPage();
                }
            },
            { rootMargin: '200px', threshold: 0 }
        );
        this.observer.observe(this.sentinel);

        this.$filters.addEventListener('click', e => {
            const btn = e.target.closest('button[data-category]');
            if (!btn) return;
            this.$filters
                .querySelector('.filter-button--active')
                .classList.remove('filter-button--active');
            btn.classList.add('filter-button--active');
            this.currentCategory = btn.dataset.category;
            this.page = 1;
            this.hasMore = true;
            this.loadNextPage();
        });

        this.loadNextPage();
    }

    _renderFilters() {
        this.$filters.innerHTML = `
      <button data-category="all" class="filter-button filter-button--active">All</button>
      ${this.categories.map(c =>
            `<button data-category="${c.id}" class="filter-button">${c.name}</button>`
        ).join('')}
    `;
    }

    async loadNextPage() {
        this.loading = true;

        const categoryParam = this.currentCategory === 'all'
            ? ''
            : `&category=${this.currentCategory}`;

        try {
            const items = await ApiService.getMenuItemsPaged(
                this.page,
                this.limit
            );

            if (items.length < this.limit) this.hasMore = false;
            this._renderItems(items, this.page > 1);
            this.page++;
        } catch (err) {
            console.error('Error al cargar el menú:', err);
        } finally {
            this.loading = false;
        }
    }

    _renderItems(items, append) {
        if (!append) this.$list.innerHTML = '';
        items.forEach(item => {
            const tpl = this.shadowRoot.getElementById('menu-item-template');
            const clone = tpl.content.cloneNode(true);

            clone.querySelector('.menu-item__img').src = item.image_url;
            clone.querySelector('.menu-item__img').alt = item.name;
            clone.querySelector('.menu-item__name').textContent = item.name;
            clone.querySelector('.menu-item__desc').textContent = item.description;
            clone.querySelector('.menu-item__price').textContent = `$${item.price}`;

            clone.querySelector('.menu-item__add').addEventListener('click', e => {
                e.stopPropagation();
                const token = localStorage.getItem('token');
                ApiService.addCartItem(item.id, 1, token)
                    .then(() => window.dispatchEvent(new CustomEvent('cart-updated')))
                    .catch(console.error);
            });

            this.$list.appendChild(clone);
        });
    }
}

customElements.define('menu-component', MenuComponent);
