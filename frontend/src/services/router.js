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
    init() {
        window.addEventListener('DOMContentLoaded', () => this.render());
        window.addEventListener('hashchange', () => this.render());
    },

    nav(path) {
        const normalized = path.startsWith('/') ? `#${path}` : `#/${path}`;
        window.location.hash = normalized;
    },

    render() {
        const hash = window.location.hash.replace(/^#/, '') || '/';
        const tag = routes[hash];
        if (!tag) {
            console.error(`Ruta desconocida: ${hash}`);
            return;
        }
        const outlet = document.getElementById('app');
        outlet.innerHTML = '';
        outlet.appendChild(document.createElement(tag));
    }
};
