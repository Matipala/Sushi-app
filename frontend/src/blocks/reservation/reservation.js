import BaseHTMLElement from '../base/BaseHTMLElement.js';
import ApiService from '../../services/ApiService.js';

class ReservationComponent extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/reservation/reservation.template.html');
        this.$form = this.shadowRoot.querySelector('.reservation__form');
        if (!this.$form) {
            console.error('Formulario de reserva no encontrado');
            return;
        }

        this.$form.noValidate = true;

        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.isLoggedIn = !!this.token && !!this.user;

        const without = this.shadowRoot.querySelector('.reservation__without-session');
        const withSess = this.shadowRoot.querySelector('.reservation__with-session');
        if (this.isLoggedIn) {
            without && (without.style.display = 'none');
        } else {
            withSess && (withSess.style.display = 'none');
        }

        this.$form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData(this.$form);

        const guests = fd.get('guests')?.trim();
        const date = fd.get('date');
        const time = fd.get('time');
        const phone = fd.get('phone')?.trim();

        if (!guests || !date || !time || !phone) {
            return this.showPopup('Guests, Date, Time y Phone son obligatorios', false);
        }

        const nameInput = fd.get('name')?.trim();
        const name = this.isLoggedIn
            ? this.user.name
            : (nameInput || 'Guest');

        const payload = {
            name,
            contact_phone: phone,
            guests: parseInt(guests, 10),
            reservation_date: date,
            reservation_time: time
        };

        if (this.isLoggedIn) {
            payload.user_id = this.user.id;
        }

        console.log('Payload reserva:', payload);

        try {
            await ApiService.createReservation(payload, this.token);
            this.showPopup('Reserva creada con éxito', true);
            this.$form.reset();
        } catch (err) {
            console.error('Error al crear reserva:', err);
            this.showPopup(err.message || 'Error al crear la reserva', false);
        }
    }

    showPopup(message, success = true) {
        const pop = document.createElement('div');
        pop.textContent = message;
        Object.assign(pop.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: success ? '#4BB543' : '#FF6B6B',
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 9999,
            opacity: 0,
            transition: 'opacity .3s'
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
