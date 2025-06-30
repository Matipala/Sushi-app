const routes = {
    '/': 'gallery-component',
    '/menu': 'menu-component',
    '/about': 'about-component',
    '/reservation': 'reservation-component',
    '/blog': 'blog-component',
    '/contact': 'contact-component',
    '/cart': 'cart-component',
    '/registration': 'registration-component',
    '/login': 'login-component',
};

export default {
    _instances: {},

    init() {
        window.addEventListener('DOMContentLoaded', () => this.render());
        window.addEventListener('hashchange', () => this.render());
    },

    nav(path) {
        const normalized = path.startsWith('/') ? `#${path}` : `#/${path}`;
        window.location.hash = normalized;
    },

    render() {
        const raw = window.location.hash.replace(/^#/, '') || '/';
        const outlet = document.getElementById('app');

        let tag, params;
        if (raw.startsWith('/blog/') && raw.split('/').length === 3) {
            tag = 'blog-detail-component';
            params = { id: raw.split('/')[2] };

            if (this._instances[tag]) {
                outlet.removeChild(this._instances[tag]);
                delete this._instances[tag];
            }
        } else {
            tag = routes[raw];
        }

        if (!tag) {
            console.error(`Ruta desconocida: ${raw}`);
            return;
        }

        if (!this._instances[tag]) {
            const el = document.createElement(tag);
            if (params) el.params = params;
            el.style.display = 'none';
            outlet.appendChild(el);
            this._instances[tag] = el;
        } else if (params) {
            this._instances[tag].params = params;
        }

        Object.entries(this._instances).forEach(([routeTag, el]) => {
            el.style.display = (routeTag === tag) ? '' : 'none';
        });
    }
};
