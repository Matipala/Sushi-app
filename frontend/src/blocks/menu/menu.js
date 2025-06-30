import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';
import router from '../../services/router.js';

export default class MenuComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.categories = [];
        this.items = [];
        this.currentCategory = 'all';
        this.pages = 1;
        this.limit = 50;
        this.loading = false;
        this.more = true;
    }

    async connectedCallback() {
        await this.loadHTML('blocks/menu/menu.template.html');

        this.$filters = this.shadowRoot.querySelector('.menu__filters');
        this.$list = this.shadowRoot.querySelector('.menu__items');
        this.$main = this.shadowRoot.querySelector('.menu__main');
        this.$tpl = this.shadowRoot.getElementById('menu-item-template');

        this.$title = document.createElement('div');
        this.$price = document.createElement('div');
        this.$btn = document.createElement('button');
        this.$title.classList.add('menu__overlay-title');
        this.$price.classList.add('menu__overlay-price');
        this.$btn.classList.add('menu__overlay-btn');
        this.$btn.textContent = '+';

        this.sentinel = document.createElement('div');
        this.sentinel.className = 'scroll-sentinel';
        this.$list.after(this.sentinel);

        this.token = localStorage.getItem('token');

        await this._loadData();
        this._bindFilterButtons();
        this._renderItems();

        //Aqui aplicamos el patron OBSERVER
        this.observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !this.loading && this.more) {
                    this.loadNextPage();
                }
            },
            {
                rootmargin: '200px', threshold: 0
            }
        );
        this.observer.observe(this.sentinel);
        this.loadNextPage();
    }

    async loadNextPage() {
        this.loading = true;
        try {
            const items = await ApiService.getMenuItemPaged(this.pages, this.limit);
            if (items.length < this.limit) this.more = false;
            this.renderItems(items);
            this.pages++;
        } catch (err) {
            console.error('error al cargar el menu:', err);
        } finally {
            this.loading = false;
        }
    }


    async _loadData() {
        this.categories = await ApiService.getCategories();
        this.items = await ApiService.getMenuItems();
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
            this.$filters
                .querySelector('.filter-button--active')
                .classList.remove('filter-button--active');
            btn.classList.add('filter-button--active');
            this.currentCategory = btn.dataset.category;
            this._renderItems();
            this._clearMain();
        });
    }

    _renderItems() {
        this.$list.innerHTML = '';
        items.forEach(item => {
            const link = document.createElement('div');
            el.className = 'menu__item';
            el.innerHTML = '<div class="menu__item-image-wrapper"></div><div class="menu__item-info">{{item.name}}</div><div class="menu-item__price-add">$${{item.price}}</div>';
            this.$list.appendChild(el)
        });
        this.items
            .filter(i => this.currentCategory === 'all' || String(i.category_id) === this.currentCategory)
            .forEach(item => {
                const clone = this.$tpl.content.cloneNode(true);
                const el = clone.querySelector('.menu-item');
                el.dataset.category = item.category_id;

                const img = clone.querySelector('.menu-item__img');
                img.src = item.image_url;
                img.alt = item.name;

                clone.querySelector('.menu-item__name').textContent = item.name;
                clone.querySelector('.menu-item__desc').textContent = item.description;

                const priceEl = clone.querySelector('.menu-item__price');
                priceEl.textContent = `$${item.price}`;

                const addBtn = clone.querySelector('.menu-item__add');
                addBtn.addEventListener('click', async e => {
                    e.stopPropagation();
                    await ApiService.addCartItem(item.id, 1, this.token);
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                });

                el.addEventListener('click', () => this._selectItem(item));
                this.$list.appendChild(clone);
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
        this.$price.textContent = `$${item.price}`;
        this.$btn.onclick = async () => {
            await ApiService.addCartItem(item.id, 1, this.token);
            window.dispatchEvent(new CustomEvent('cart-updated'));
        };

        if (!this.$main.contains(this.$title)) this.$main.appendChild(this.$title);
        if (!this.$main.contains(this.$price)) this.$main.appendChild(this.$price);
        if (!this.$main.contains(this.$btn)) this.$main.appendChild(this.$btn);
    }
}

customElements.define('menu-component', MenuComponent);
