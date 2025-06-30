import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

class ReservationComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/reservation/reservation.template.html');

        this.isLoggedIn = !!localStorage.getItem('token');

        this.$without = this.shadowRoot.querySelector('.reservation__without-session');
        this.$with = this.shadowRoot.querySelector('.reservation__with-session');
        this.$form = this.shadowRoot.querySelector('.reservation__form');

        if (this.isLoggedIn) {
            this.$without.style.display = 'none';
        } else {
            this.$with.style.display = 'none';
        }

        this.$form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData(this.$form);
        const payload = {
            guests: parseInt(fd.get('guests'), 10),
            date: fd.get('date'),
            time: fd.get('time'),
        };

        if (!this.isLoggedIn) {
            payload.name = fd.get('name');
            payload.phone = fd.get('phone');
            payload.email = fd.get('email');
        }

        try {
            await ApiService.createReservation(payload);
            this.showPopup('Reserva creada con éxito', true);
            this.$form.reset();
        } catch (err) {
            console.error(err);
            this.showPopup(err.message || 'Error al crear la reserva', false);
        }
    }

    showPopup(msg, ok = true) {
        const pop = document.createElement('div');
        pop.textContent = msg;
        Object.assign(pop.style, {
            position: 'fixed', top: '20px', left: '50%',
            transform: 'translateX(-50%)',
            background: ok ? '#4BB543' : '#FF6B6B',
            color: '#FFF', padding: '10px 20px',
            borderRadius: '5px', zIndex: 9999,
            opacity: 0, transition: 'opacity .3s'
        });
        this.shadowRoot.appendChild(pop);
        requestAnimationFrame(() => pop.style.opacity = '1');
        setTimeout(() => {
            pop.style.opacity = '0';
            pop.addEventListener('transitionend', () => pop.remove(), { once: true });
        }, 3000);
    }
}

customElements.define('reservation-component', ReservationComponent);
export default ReservationComponent;
