import BaseHTMLElement from '../base/BaseHTMLElement.js';
import { createReservation } from '../../api.js';

class Reservation extends BaseHTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.loadHTML('blocks/reservation/reservation.template.html');

        this.form = this.shadowRoot.querySelector('.reservation__form');
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const payload = {
            name: formData.get('name'),
            contact: formData.get('phone'),
            email: formData.get('email'),
            date: formData.get('date'),
            time: formData.get('time'),
            partySize: parseInt(formData.get('guests'), 10)
        };

        try {
            await createReservation(payload);
            this.showPopup('Reserva creada con éxito');
            this.form.reset();
        } catch (err) {
            console.error('Error creating reservation:', err);
            this.showPopup('Error al crear la reserva. Intenta de nuevo.', false);
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
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: '9999',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        this.shadowRoot.appendChild(popup);
        requestAnimationFrame(() => popup.style.opacity = '1');
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
        }, 3000);
    }
}

customElements.define('reservation-component', Reservation);
export default Reservation;
