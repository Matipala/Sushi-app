import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';
import router from '../../services/router.js';

export default class BlogDetailComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/blog-detail/blog-detail.template.html');

        const sel = s => {
            const el = this.shadowRoot.querySelector(s);
            if (!el) console.warn(`Selector '${s}' no encontrado en blog-detail.template.html`);
            return el;
        };

        this.$back = sel('.blog-detail-page__back');
        this.$img = sel('.blog-detail-page__image');
        this.$title = sel('.blog-detail-page__header-title');
        this.$author = sel('.blog-detail-page__description-author');
        this.$date = sel('.blog-detail-page__header-date .blog-detail-page__date-content');
        this.$content = sel('.blog-detail-page__description-content');

        this.$back?.addEventListener('click', () => router.nav('/blog'));

        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.token = localStorage.getItem('token');

        const { id } = this.params || {};
        if (!id) {
            this._showError('ID inválido');
            return;
        }

        try {
            this.post = await ApiService.getBlogPostById(id);

            this._renderPost();

            if (this.user?.id === this.post.author_id) {
                this._enableInlineEditing();
            }
        } catch (err) {
            console.error(err);
            this._showError('Error al cargar el artículo');
        }
    }

    _renderPost() {
        const dateStr = new Date(this.post.created_at)
            .toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            });

        if (this.$img) {
            this.$img.src = this.post.image_url || 'assets/images/default_blog.jpg';
            this.$img.alt = this.post.title;
        }
        if (this.$title) this.$title.textContent = this.post.title;
        if (this.$content) this.$content.textContent = this.post.description;
        if (this.$author) this.$author.textContent = this.post.author?.name || 'Autor desconocido';
        if (this.$date) this.$date.textContent = dateStr;
    }

    _enableInlineEditing() {
        [this.$title, this.$content].forEach($el => {
            if (!$el) return;
            $el.style.cursor = 'text';

            $el.addEventListener('dblclick', () => {
                $el.contentEditable = 'true';
                $el.focus();
            });

            $el.addEventListener('blur', async () => {
                if (!$el.isContentEditable) return;
                $el.contentEditable = 'false';

                const field = $el === this.$title ? 'title' : 'description';
                const newValue = $el.textContent.trim();
                if (newValue === this.post[field]) return;

                try {
                    await ApiService.updateBlogPost(this.post.id, { [field]: newValue }, this.token);
                    this.post[field] = newValue;
                } catch (err) {
                    console.error('Error al guardar:', err);
                }
            });
        });
    }

    _showError(msg) {
        if (this.$title) {
            this.$title.textContent = msg;
        } else {
            console.error(msg);
        }
    }
}

customElements.define('blog-detail-component', BlogDetailComponent);
