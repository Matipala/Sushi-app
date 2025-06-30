import BaseHTMLElement from '../base/BaseHTMLElement.js';
import router from '../../services/router.js';
import ApiService from '../../services/ApiService.js';

class Login extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/login/login.template.html');
        this._bind();
    }

    _bind() {
        const btn = this.shadowRoot.querySelector('.login__button');
        btn?.addEventListener('click', e => this._handleLogin(e));

        const link = this.shadowRoot.querySelector('.login a[data-link]');
        link?.addEventListener('click', e => {
            e.preventDefault();
            router.nav(link.getAttribute('href').replace(/^#/, ''));
        });
    }

    async _handleLogin(e) {
        e.preventDefault();
        const errorEl = this.shadowRoot.querySelector('.login__error');
        errorEl.textContent = '';

        const email = this.shadowRoot.querySelector('input[name="email"]').value.trim();
        const password = this.shadowRoot.querySelector('input[name="password"]').value;

        try {
            const { token, user } = await ApiService.login({ email, password });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new CustomEvent('auth-changed'));

            this.showPopup('Login exitoso', true);

            setTimeout(() => {
                router.nav('/');
                window.location.reload();
            }, 800);

        } catch (err) {
            console.error(err);
            this.showPopup(err.message || 'Error al iniciar sesión', false);
            errorEl.textContent = err.message;
        }
    }

    showPopup(message, success = true) {
        const popup = document.createElement('div');
        popup.textContent = message;
        Object.assign(popup.style, {
            position: 'fixed', top: '20px', left: '50%',
            transform: 'translateX(-50%)',
            background: success ? '#4BB543' : '#FF6B6B',
            color: '#fff', padding: '10px 20px',
            borderRadius: '5px', zIndex: '9999',
            opacity: 0, transition: 'opacity 0.3s'
        });
        this.shadowRoot.appendChild(popup);
        requestAnimationFrame(() => popup.style.opacity = '1');
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
        }, 2000);
    }
}

customElements.define('login-component', Login);
export default Login;
