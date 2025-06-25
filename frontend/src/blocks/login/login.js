import BaseHTMLElement from '../base/BaseHTMLElement.js';
import router from '../../services/router.js';

class Login extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/login/login.template.html');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginButton = this.shadowRoot.querySelector('.login__button');
        if (loginButton) {
            loginButton.addEventListener('click', (event) => this.handleLogin(event));
        }

        const registerLink = this.shadowRoot.querySelector('.login a[data-link]');
        if (registerLink) {
            registerLink.addEventListener('click', (event) => this.handleNavigation(event));
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const errorEl = this.shadowRoot.querySelector('.login__error');
        if (errorEl) errorEl.textContent = '';

        const emailInput = this.shadowRoot.querySelector('input[name="email"]');
        const passInput = this.shadowRoot.querySelector('input[name="password"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            this.showPopup('Login exitoso', true);

            setTimeout(() => {
                window.location.hash = '#/';
            }, 1000);
        } catch (err) {
            console.error('Login error:', err);
            this.showPopup(err.message || 'No se pudo iniciar sesión', false);
            if (errorEl) errorEl.textContent = err.message;
        }
    }

    handleNavigation(event) {
        event.preventDefault();
        const href = event.currentTarget.getAttribute('href');
        if (href) {
            router.nav(href);
        }
    }

    showPopup(message, success = true) {
        const popup = document.createElement('div');
        popup.textContent = message;
        Object.assign(popup.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: success ? '#4BB543' : '#FF6B6B',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: '9999',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        this.shadowRoot.appendChild(popup);
        requestAnimationFrame(() => { popup.style.opacity = '1'; });
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
        }, 3000);
    }
}

customElements.define('login-component', Login);
export default Login;
