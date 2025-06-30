import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

export default class CartComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.token = localStorage.getItem('token');
        this.cartItems = [];
        this.handleCheckout = this.handleCheckout.bind(this);
    }

    async connectedCallback() {
        await this.loadHTML('blocks/cart/cart.template.html');
        this.$list = this.shadowRoot.querySelector('.cart__items');
        this.$total = this.shadowRoot.querySelector('.cart__total-amount');
        this.$checkout = this.shadowRoot.querySelector('.cart__checkout-button');
        this.$checkout.addEventListener('click', this.handleCheckout);
        window.addEventListener('cart-updated', () => this._renderCart());
        await this._renderCart();
    }

    async _renderCart() {
        if (!this.token) {
            return;
        }
        this.cartItems = await ApiService.getCartItems(this.token);

        this.$list.innerHTML = '';
        let sum = 0;
        this.cartItems.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'cart__item';
            wrapper.innerHTML = `
                <img class="cart__item-img" src="${item.image_url}" alt="${item.name}" />
                <div class="cart__item-info">
                  <div class="cart__item-name">${item.name}</div>
                  <div class="cart__item-desc">${item.description}</div>
                  <div class="cart__qty-controls">
                    <button class="qty-decr">–</button>
                    <span class="qty">${item.quantity}</span>
                    <button class="qty-incr">+</button>
                  </div>
                </div>
                <div class="cart__item-pricing">$${item.price * item.quantity}</div>
                <button class="remove">×</button>
            `;

            wrapper.querySelector('.qty-incr').addEventListener('click', async () => {
                await ApiService.updateCartItem(item.id, item.quantity + 1, this.token);
                window.dispatchEvent(new CustomEvent('cart-updated'));
            });
            wrapper.querySelector('.qty-decr').addEventListener('click', async () => {
                if (item.quantity > 1) {
                    await ApiService.updateCartItem(item.id, item.quantity - 1, this.token);
                } else {
                    await ApiService.removeCartItem(item.id, this.token);
                }
                window.dispatchEvent(new CustomEvent('cart-updated'));
            });
            wrapper.querySelector('.remove').addEventListener('click', async () => {
                await ApiService.removeCartItem(item.id, this.token);
                window.dispatchEvent(new CustomEvent('cart-updated'));
            });

            this.$list.appendChild(wrapper);
            sum += item.price * item.quantity;
        });

        this.$total.textContent = `$${sum}`;
    }

    async handleCheckout() {
        if (!this.cartItems.length) {
            this.showPopup('El carrito está vacío', false);
            return;
        }

        try {
            await ApiService.createOrder(
                this.cartItems.map(i => ({ menu_item_id: i.menu_item_id || i.id, quantity: i.quantity })),
                this.token
            );

            this.showPopup('Orden realizada con éxito');
            window.dispatchEvent(new CustomEvent('cart-cleared'));
            await this._renderCart();
        } catch (err) {
            console.error(err);
            this.showPopup(err.message || 'Error al procesar la orden', false);
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
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        document.body.appendChild(popup);
        requestAnimationFrame(() => popup.style.opacity = '1');
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
        }, 3000);
    }
}

customElements.define('cart-component', CartComponent);
