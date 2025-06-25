import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { getBlogPosts } from '../../api.js';

export default class BlogComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/blog/blog.template.html');

        this.$items = this.shadowRoot.querySelector('.blog__items');
        this.$tpl = this.shadowRoot.getElementById('post-template');

        if (!this.$items || !this.$tpl) {
            console.error('Falta .blog__items o #post-template en el template');
            return;
        }

        const posts = await getBlogPosts();
        this._renderPosts(posts);
    }

    _renderPosts(posts) {
        this.$items.innerHTML = '';
        posts.forEach(p => {
            const clone = this.$tpl.content.cloneNode(true);

            const img = clone.querySelector('.blog__item-image');
            img.src = p.image_url || 'assets/images/default_blog.jpg';
            img.alt = p.title;

            const date = new Date(p.created_at);
            clone.querySelector('.blog__item-date').textContent =
                date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            clone.querySelector('.blog__item-title').textContent = p.title;
            clone.querySelector('.blog__item-desc').textContent = p.description;

            clone.querySelector('.blog__item-author').textContent =
                p.author?.name || 'Unknown author';

            this.$items.appendChild(clone);
        });
    }
}

customElements.define('blog-component', BlogComponent);
