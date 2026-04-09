import { State } from './state.js';
import { Nav } from './navigation.js';

export const Payment = {
    async startFlow() {
        Nav.showScreen('paymentScreen');
        const orderId = await this.createOrder();
        if (orderId) {
            document.getElementById('displayOrderID').innerText = orderId;
            const baseUrl = this.getBaseUrl();
            const paymentLink = `${baseUrl}/api/pay/${orderId}`;
            document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;
            this.startPolling(() => Nav.showScreen('setup'));
        }
    },

    async createOrder() {
        try {
            const res = await fetch('/api/create_order', { method: 'POST' });
            const data = await res.json();
            State.session.orderId = data.order_id;
            return data.order_id;
        } catch (err) { console.error("Order Error:", err); return null; }
    },

    startPolling(onSuccess) {
        const itv = setInterval(async () => {
            try {
                const r = await fetch(`/api/check_payment/${State.session.orderId}`);
                const d = await r.json();
                if (d.status === 'completed' || d.status === 'paid') {
                    clearInterval(itv);
                    State.session.isPaid = true;
                    onSuccess();
                }
            } catch (err) { console.error("Polling Error:", err); }
        }, 2000);
    },

    getBaseUrl() {
        const { hostname, port } = window.location;
        return port ? `${window.location.protocol}//${hostname}:${port}` : `${window.location.protocol}//${hostname}`;
    }
};

