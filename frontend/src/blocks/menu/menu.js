import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { getCategories, getMenuItems, addCartItem } from '../../api.js';

export default class MenuComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.categories = [];
        this.items = [];
        this.currentCategory = 'all';
    }

    async connectedCallback() {
        await this.loadHTML('blocks/menu/menu.template.html');

        this.$filters = this.shadowRoot.querySelector('.menu__filters');
        this.$list = this.shadowRoot.querySelector('.menu__items');
        this.$tpl = this.shadowRoot.getElementById('menu-item-template');
        this.token = localStorage.getItem('token');

        await this._loadData();
        this._bindFilterButtons();
        this._renderItems();
    }

    async _loadData() {
        try {
            this.categories = await getCategories();
            this.items = await getMenuItems();
            this._renderFilters();
        } catch (err) {
            console.error('Error loading menu data:', err);
        }
    }

    _renderFilters() {
        this.$filters.innerHTML = `
            <button data-category="all" class="filter-button filter-button--active">All</button>
            ${this.categories.map(c =>
            `<button data-category="${c.id}" class="filter-button">${c.name}</button>`
        ).join('')}
        `;
    }

    _bindFilterButtons() {
        this.$filters.addEventListener('click', e => {
            const btn = e.target.closest('.filter-button');
            if (!btn) return;
            this.$filters.querySelector('.filter-button--active')
                .classList.remove('filter-button--active');
            btn.classList.add('filter-button--active');
            this.currentCategory = btn.dataset.category;
            this._renderItems();
        });
    }

    _renderItems() {
        this.$list.innerHTML = '';

        this.items
            .filter(i => this.currentCategory === 'all' || String(i.category_id) === this.currentCategory)
            .forEach(item => {
                const clone = this.$tpl.content.cloneNode(true);
                const el = clone.querySelector('.menu-item');
                el.dataset.category = item.category_id;

                const imgEl = clone.querySelector('.menu-item__img');
                imgEl.src = item.image_url;
                imgEl.alt = item.name;

                clone.querySelector('.menu-item__name').textContent = item.name;
                clone.querySelector('.menu-item__desc').textContent = item.description;
                clone.querySelector('.menu-item__price').textContent = `$${item.price}`;

                const addBtn = clone.querySelector('.menu-item__add');
                addBtn.addEventListener('click', async () => {
                    await addCartItem(item.id, 1, this.token);
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                });

                this.$list.appendChild(clone);
            });
    }
}

//  Evita definir dos veces el mismo tag
if (!customElements.get('menu-component')) {
    customElements.define('menu-component', MenuComponent);
}
