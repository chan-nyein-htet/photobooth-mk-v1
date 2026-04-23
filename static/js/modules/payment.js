import { State } from './state.js';
import { Nav } from './navigation.js';

export const Payment = {
    // ပင်မ flow စတင်ခြင်း
    async startFlow() {
        // ၁။ UI ကို Payment screen ပြောင်းမယ်
        Nav.showScreen('paymentScreen');

        // ၂။ Order ID ယူမယ်
        const orderId = State.session.order_id;

        if (orderId) {
            // UI မှာ Order ID ပြမယ်
            const displayEl = document.getElementById('displayOrderID');
            if (displayEl) displayEl.innerText = orderId;

            // QR Code ထုတ်မယ်
            const baseUrl = this.getBaseUrl();
            const paymentLink = `${baseUrl}/api/pay/${orderId}`;
            const qrEl = document.getElementById('qrCode');
            if (qrEl) {
                qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;
            }

            // ၃။ ပိုက်ဆံချေမချေ စစ်မယ်
            this.startPolling(() => {
                console.log("✅ Payment Success! Switching to Setup...");
                
                // ✅ မင်းရဲ့ HTML ID အတိုင်း 'setup' လို့ပဲ ပြန်ပြောင်းပေးထားတယ် (Design မပျက်စေရဘူး)
                Nav.showScreen('setup'); 
            });
        } else {
            console.error("❌ No Order ID found in State!");
        }
    },

    // Backend status ကို ၂ စက္ကန့်တစ်ခါ လှမ်းမေးခြင်း
    startPolling(onSuccess) {
        if (this.itv) clearInterval(this.itv);

        this.itv = setInterval(async () => {
            const orderId = State.session.order_id;
            if (!orderId) return;

            try {
                const r = await fetch(`/api/check_payment/${orderId}`);
                const d = await r.json();

                // Backend ရဲ့ response နဲ့ တိုက်စစ်မယ်
                if (d.status === 'success' && d.paid === true) {
                    clearInterval(this.itv);
                    State.session.isPaid = true;
                    onSuccess();
                }
            } catch (err) {
                console.error("Polling Error:", err);
            }
        }, 2000);
    },

    getBaseUrl() {
        const { hostname, port, protocol } = window.location;
        return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    }
};

// Global function
window.startPaymentFlow = () => Payment.startFlow();

