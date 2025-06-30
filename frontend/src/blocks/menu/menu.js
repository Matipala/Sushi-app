import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { getCategories, getMenuItems, addCartItem } from '../../api.js';
import router from '../../services/router.js';

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
        this.$main = this.shadowRoot.querySelector('.menu__main');
        this.$title = document.createElement('div');
        this.$price = document.createElement('div');
        this.$btn = document.createElement('button');
        this.$title.classList.add('menu__overlay-title');
        this.$price.classList.add('menu__overlay-price');
        this.$btn.classList.add('menu__overlay-btn');

        this.$btn.textContent = '+';

        this.token = localStorage.getItem('token');

        await this._loadData();
        this._bindFilterButtons();
        this._renderItems();
    }

    async _loadData() {
        this.categories = await getCategories();
        this.items = await getMenuItems();
        this._renderFilters();
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
            this._clearMain();
        });
    }

    _renderItems() {
        this.$list.innerHTML = '';
        this.items
            .filter(i => this.currentCategory === 'all' || String(i.category_id) === this.currentCategory)
            .forEach(item => {
                const el = document.createElement('div');
                el.className = 'menu-item';
                el.innerHTML = `
          <div class="menu-item__img-wrapper">
            <img src="${item.image_url}" alt="${item.name}" class="menu-item__img"/>
          </div>
          <div class="menu-item__info">
            <h2 class="menu-item__name">${item.name}</h2>
            <p class="menu-item__desc">${item.description}</p>
          </div>
          <div class="menu-item__price">${item.price}</div>
        `;
                el.addEventListener('click', () => this._selectItem(item));
                this.$list.appendChild(el);
            });
    }

    _clearMain() {
        this.$main.style.backgroundImage = `url('../../assets/images/menu_main.png')`;
        [this.$title, this.$price, this.$btn].forEach(node => {
            if (node.parentNode === this.$main) this.$main.removeChild(node);
        });
    }

    _selectItem(item) {
        this.$main.style.backgroundImage = `url('${item.image_url}')`;
        this.$title.textContent = item.name;
        this.$btn.onclick = async () => {
            await addCartItem(item.id, 1, this.token);
            window.dispatchEvent(new CustomEvent('cart-updated'));
        };

        if (!this.$main.contains(this.$title)) this.$main.appendChild(this.$title);
        if (!this.$main.contains(this.$price)) this.$main.appendChild(this.$price);
        if (!this.$main.contains(this.$btn)) this.$main.appendChild(this.$btn);
    }
}

customElements.define('menu-component', MenuComponent);
