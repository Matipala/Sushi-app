import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

export default class BlogComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.page = 1;
        this.limit = 10;
        this.loading = false;
        this.hasMore = true;
        this.currentFilter = 'all';
        this.favs = [];
        this.user = null;
    }

    async connectedCallback() {
        await this.loadHTML('blocks/blog/blog.template.html');

        this.$filters = this.shadowRoot.querySelector('.blog__filters');
        this.$list = this.shadowRoot.querySelector('.blog__items');
        this.$tpl = this.shadowRoot.getElementById('post-template');

        const token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');

        if (token && this.user) {
            try {
                this.favs = await ApiService.getFavorites(token);
                this._renderFilters();
            } catch (err) {
                console.warn('No se pudieron cargar favoritos (401). Quitando token.', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.$filters.style.display = 'none';
            }
        } else {
            this.$filters.style.display = 'none';
        }


        // sentinel para infinity scroll
        this.sentinel = document.createElement('div');
        this.sentinel.className = 'scroll-sentinel';
        this.$list.parentNode.insertBefore(this.sentinel, this.$list.nextSibling);

        // Observer aqui
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
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            this.$filters
                .querySelector('.blog__filter-button--active')
                .classList.remove('blog__filter-button--active');
            btn.classList.add('blog__filter-button--active');
            this.currentFilter = btn.dataset.filter;
            this.page = 1;
            this.hasMore = true;
            this.$list.innerHTML = '';
            this.loadNextPage();
        });

        this.loadNextPage();
    }

    _renderFilters() {
        this.$filters.innerHTML = `
      <button data-filter="all"  class="blog__filter-button blog__filter-button--active">All News</button>
      <button data-filter="fav"  class="blog__filter-button">Favorites</button>
      <button data-filter="mine" class="blog__filter-button">My Articles</button>
    `;
    }

    async loadNextPage() {
        this.loading = true;
        try {
            const posts = await ApiService.getBlogPostsPaged(this.page, this.limit);
            if (posts.length < this.limit) this.hasMore = false;
            this._renderPosts(posts, this.page > 1);
            this.page++;
        } catch (err) {
            console.error('Error cargando posts:', err);
        } finally {
            this.loading = false;
        }
    }

    _renderPosts(posts, append) {
        if (!append) this.$list.innerHTML = '';
        posts.forEach(p => {
            if (
                (this.currentFilter === 'fav' && !this.favs.includes(p.id)) ||
                (this.currentFilter === 'mine' && p.author_id !== this.user?.id)
            ) {
                return;
            }

            const clone = this.$tpl.content.cloneNode(true);
            const el = clone.querySelector('.blog__item');

            clone.querySelector('.blog__item-image').src = p.image_url || 'assets/images/default_blog.jpg';
            clone.querySelector('.blog__item-image').alt = p.title;
            clone.querySelector('.blog__item-date').textContent = new Date(p.created_at)
                .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            clone.querySelector('.blog__item-title').textContent = p.title;
            clone.querySelector('.blog__item-desc').textContent = p.description;
            clone.querySelector('.blog__item-author').textContent = p.author?.name || 'Unknown';

            const favBtn = clone.querySelector('.blog__item-fav');
            if (this.favs.includes(p.id)) favBtn.classList.add('blog__item-fav--active');
            favBtn.addEventListener('click', async e => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                if (this.favs.includes(p.id)) {
                    await ApiService.removeFavorite(p.id, token);
                    this.favs = this.favs.filter(id => id !== p.id);
                    favBtn.classList.remove('blog__item-fav--active');
                } else {
                    await ApiService.addFavorite(p.id, token);
                    this.favs.push(p.id);
                    favBtn.classList.add('blog__item-fav--active');
                }
            });

            this.$list.appendChild(clone);
        });
    }
}

customElements.define('blog-component', BlogComponent);
