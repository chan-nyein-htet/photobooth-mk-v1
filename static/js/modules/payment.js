import { State } from './state.js';
import { Nav } from './navigation.js';                

export const Payment = {
    itv: null, // Interval ကို သိမ်းဖို့

    async startFlow() {
        console.log("💳 Starting Payment Flow...");
        Nav.showScreen('paymentScreen');              
        
        // 🎯 State ထဲက နာမည်မှန် (orderId) နဲ့ ပြန်ခေါ်မယ်
        const orderId = State.session.orderId;

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
                console.log("✅ Payment Success! Switching to Camera Flow...");
                
                // 🎯 ဒီနေရာမှာ မင်းရဲ့ Camera Flow စတင်တဲ့ function ကို တိုက်ရိုက်ခေါ်ပေးရမယ်
                if (window.startCameraFlow) {
                    window.startCameraFlow();
                } else {
                    // Fallback အနေနဲ့ screen ပဲ ပြောင်းမယ်
                    Nav.showScreen('mainApp');
                }
            });
        } else {
            console.error("❌ No Order ID found in State! (Check if Collage.select saved it correctly)");
        }
    },

    startPolling(onSuccess) {
        if (this.itv) clearInterval(this.itv);

        this.itv = setInterval(async () => {
            // 🎯 နာမည်မှန် orderId နဲ့ပဲ စစ်မယ်
            const orderId = State.session.orderId;
            if (!orderId) return;

            try {
                const r = await fetch(`/api/check_payment/${orderId}`);
                const d = await r.json();

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

window.startPaymentFlow = () => Payment.startFlow();

