// blocks/blog/blog.js
import BaseHTMLElement from '../base/BaseHTMLElement.js';
import {
    getBlogPosts,
    getFavorites,
    addFavorite,
    removeFavorite
} from '../../api.js';

export default class BlogComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/blog/blog.template.html');

        // referencias
        this.$filters = this.shadowRoot.querySelector('.blog__filters');
        this.$items = this.shadowRoot.querySelector('.blog__items');
        this.$tpl = this.shadowRoot.getElementById('post-template');

        if (!this.$filters || !this.$items || !this.$tpl) {
            console.error('Faltan selectores en blog.template.html');
            return;
        }

        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');

        // si hay sesión, carga favoritos y renderiza filtros
        if (this.token) {
            this.favs = await getFavorites(this.token); // array de postId strings
            this.$filters.innerHTML = `
        <button data-filter="all"  class="blog__filter-button blog__filter-button--active">All News</button>
        <button data-filter="fav"  class="blog__filter-button">Favorites</button>
        <button data-filter="mine" class="blog__filter-button">My Articles</button>
      `;
            this.$filters.addEventListener('click', e => {
                const btn = e.target.closest('.blog__filter-button');
                if (!btn) return;
                this.$filters
                    .querySelector('.blog__filter-button--active')
                    .classList.remove('blog__filter-button--active');
                btn.classList.add('blog__filter-button--active');
                this._applyFilter(btn.dataset.filter);
            });
        } else {
            // oculta zona de filtros si no hay sesión
            this.$filters.style.display = 'none';
        }

        // carga y renderiza
        const posts = await getBlogPosts();
        this._renderPosts(posts);
    }

    _renderPosts(posts) {
        this.$items.innerHTML = '';
        posts.forEach(p => {
            // crea enlace contenedor
            const link = document.createElement('a');
            link.href = `#/blog/${p.id}`;
            link.setAttribute('data-link', '');
            // clona plantilla
            const clone = this.$tpl.content.cloneNode(true);
            const root = clone.querySelector('.blog__item');

            // datos en el root para filtrado
            root.dataset.id = p.id;
            root.dataset.authorId = p.author_id;

            // imagen
            const img = clone.querySelector('.blog__item-image');
            img.src = p.image_url || 'assets/images/default_blog.jpg';
            img.alt = p.title;

            // fecha
            const date = new Date(p.created_at);
            clone.querySelector('.blog__item-date').textContent =
                date.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

            // título y descripción
            clone.querySelector('.blog__item-title').textContent = p.title;
            clone.querySelector('.blog__item-desc').textContent = p.description;

            // autor
            clone.querySelector('.blog__item-author').textContent =
                p.author?.name || 'Unknown author';

            // favorito
            const favBtn = clone.querySelector('.blog__item-fav');
            if (!this.token) {
                favBtn.style.display = 'none';
            } else {
                if (this.favs.includes(p.id)) {
                    favBtn.classList.add('blog__item-fav--active');
                }
                favBtn.addEventListener('click', async e => {
                    e.preventDefault();
                    if (this.favs.includes(p.id)) {
                        await removeFavorite(p.id, this.token);
                        this.favs = this.favs.filter(x => x !== p.id);
                        favBtn.classList.remove('blog__item-fav--active');
                    } else {
                        await addFavorite(p.id, this.token);
                        this.favs.push(p.id);
                        favBtn.classList.add('blog__item-fav--active');
                    }
                    // reaplica filtro activo
                    const active = this.$filters.querySelector('.blog__filter-button--active')?.dataset.filter || 'all';
                    this._applyFilter(active);
                });
            }

            // inserta clone dentro del enlace y en el contenedor
            link.appendChild(clone);
            this.$items.appendChild(link);
        });
    }

    _applyFilter(filter) {
        this.$items.querySelectorAll('a[data-link]').forEach(a => {
            const el = a.querySelector('.blog__item');
            const isFav = this.favs.includes(el.dataset.id);
            const isMine = this.user && el.dataset.authorId === this.user.id;
            let show = filter === 'all'
                ? true
                : filter === 'fav'
                    ? isFav
                    : filter === 'mine'
                        ? isMine
                        : true;
            a.style.display = show ? '' : 'none';
        });
    }
}

customElements.define('blog-component', BlogComponent);
