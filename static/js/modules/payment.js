import { State } from './state.js';
import { Nav } from './navigation.js';

export const Payment = {
    itv: null,

    async startFlow() {
        console.log("💳 Starting Payment Flow...");
        // 1. Payment Screen ကို အရင်ပြမယ်
        Nav.showScreen('paymentScreen');

        // 2. State ထဲက Order ID ကို ယူမယ်
        const orderId = State.session.orderId;
        
        if (orderId) {
            // Screen ပေါ်မှာ Order ID ပြဖို့
            const displayEl = document.getElementById('displayOrderID');
            if (displayEl) displayEl.innerText = orderId;

            const baseUrl = this.getBaseUrl();
            // 🎯 Payment Link (Simulate link ကို သုံးထားတယ်)
            const paymentLink = `${baseUrl}/api/simulate_pay/${orderId}`;
            
            // 3. QR Code ထုတ်မယ်
            const qrEl = document.getElementById('qrCode');
            if (qrEl) {
                qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;
            }

            // 4. ပိုက်ဆံပေးပြီးမပြီး Polling စမယ်
            this.startPolling(() => {
                console.log("✅ Payment Success!");
                State.session.isPaid = true;

                // 🎯 ၅။ Setup Screen ကို ပြောင်းမယ်
                Nav.showScreen('setup');

                // 🎯 ၆။ Setup.js ကို ခေါ်ပြီး Animation Tutorial စမယ်
                import('./setup.js').then(m => {
                    if (m.Setup && m.Setup.startTutorial) {
                        m.Setup.startTutorial();
                    }
                });
            });
        } else {
            console.error("❌ Order ID not found in State!");
        }
    },

    /**
     * Backend ဆီမှာ ပိုက်ဆံပေးပြီးမပြီး ၂ စက္ကန့်တစ်ခါ လှမ်းမေးပေးမယ့် Function
     */
    startPolling(onSuccess) {
        if (this.itv) clearInterval(this.itv);
        
        this.itv = setInterval(async () => {
            const orderId = State.session.orderId;
            if (!orderId) return;

            try {
                const r = await fetch(`/api/pay/${orderId}`);
                const d = await r.json();

                // Backend က success လို့ ပြန်လာရင်
                if (d.status === 'success' && d.paid === true) {
                    clearInterval(this.itv);
                    this.itv = null;
                    onSuccess(); // ပြီးရင် အပေါ်က logic ကို ပြန်သွားမယ်
                }
            } catch (err) {
                console.error("Polling Error:", err);
            }
        }, 2000);
    },

    /**
     * လက်ရှိ Server ရဲ့ Base URL ကို ယူဖို့ (Localhost ဖြစ်ဖြစ် IP ဖြစ်ဖြစ်)
     */
    getBaseUrl() {
        const { hostname, port, protocol } = window.location;
        return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    }
};

// Global scope ကနေ လှမ်းခေါ်လို့ရအောင် လုပ်ထားမယ်
window.startPaymentFlow = () => Payment.startFlow();

