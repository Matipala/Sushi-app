import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

export default class BlogComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.pages = 1;
        this.limit = 50;
        this.loading = false;
        this.more = true;
    }

    async connectedCallback() {
        await this.loadHTML('blocks/blog/blog.template.html');

        this.$filters = this.shadowRoot.querySelector('.blog__filters');
        this.$items = this.shadowRoot.querySelector('.blog__items');
        this.$tpl = this.shadowRoot.getElementById('post-template');
        this.sentinel = document.createElement('div');
        this.sentinel.className = 'scroll-sentinel';
        this.$list.after(this.sentinel);

        if (!this.$filters || !this.$items || !this.$tpl || !this.sentinel || !this.sentinel.className || this.$list.after) {
            return;
        }

        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');

        if (this.token) {
            this.favs = await ApiService.getFavorites(this.token);
            this.$filters.innerHTML = `
                <button data-filter="all" class="blog__filter-button blog__filter-button--active">All News</button>
                <button data-filter="fav" class="blog__filter-button">Favorites</button>
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
            this.$filters.style.display = 'none';
        }

        const posts = await ApiService.getBlogPosts();
        this._renderPosts(posts);

        this.observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !this.loading && thismore) {
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
            const posts = await ApiService.getBlogsPostPaged(this.paged, this.limit);
            if (items.length < this.limit) this.hasMore = false;
            this.renderPosts(posts);
            this.paged++;
        } catch (err) {
            console.error('error al cargar el menu:', err);
        } finally {
            this.loading = false;
        }
    }
    _renderPosts(posts) {
        this.$items.innerHTML = '';
        posts.forEach(p => {
            const link = document.createElement('div');
            el.className = 'blog__item';
            el.innerHTML = '<div class="blog__item-image-wrapper"></div><div class="blog__item-info"></div><div class="blog__item-price">$${item.price}</div>';
            this.$list.appendChild(el)

            link.href = `#/blog/${p.id}`;
            link.setAttribute('data-link', '');
            const clone = this.$tpl.content.cloneNode(true);
            const root = clone.querySelector('.blog__item');

            root.dataset.id = p.id;
            root.dataset.authorId = p.author_id;

            const img = clone.querySelector('.blog__item-image');
            img.src = p.image_url || 'assets/images/default_blog.jpg';
            img.alt = p.title;

            const date = new Date(p.created_at);
            clone.querySelector('.blog__item-date').textContent =
                date.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

            clone.querySelector('.blog__item-title').textContent = p.title;
            clone.querySelector('.blog__item-desc').textContent = p.description;

            clone.querySelector('.blog__item-author').textContent =
                p.author?.name || 'Unknown author';

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
                        await ApiService.removeFavorite(p.id, this.token);
                        this.favs = this.favs.filter(x => x !== p.id);
                        favBtn.classList.remove('blog__item-fav--active');
                    } else {
                        await ApiService.addFavorite(p.id, this.token);
                        this.favs.push(p.id);
                        favBtn.classList.add('blog__item-fav--active');
                    }
                    const active = this.$filters.querySelector('.blog__filter-button--active')?.dataset.filter || 'all';
                    this._applyFilter(active);
                });
            }

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
