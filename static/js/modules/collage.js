import { Nav } from './navigation.js';
import { State } from './state.js';

/**
 * Collage Module
 */
export const Collage = {
    init() {
        console.log("🎨 Collage Selection Module Initialized");
    },

    /**
     * Layout Selection Logic
     */
    async select(layoutId, shots) {
        console.log(`🎯 Layout Selected: ${layoutId} (${shots} shots)`);

        // ၁။ Global State ထဲမှာ အချက်အလက် မှတ်မယ်
        if (State && State.session) {
            State.session.layoutId = layoutId;
            State.session.totalShots = parseInt(shots);
        }

        // ၂။ UI Feedback
        this.applySelectionUI(layoutId);

        // ၃။ Backend ဆီ Order လှမ်းဖွင့်မယ်
        try {
            const response = await fetch('/api/create_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    layout: layoutId,
                    shots: parseInt(shots)
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.status === 'success') {
                State.session.order_id = data.order_id;
                console.log(`✅ Order Created: ${data.order_id}`);

                // ၄။ အောင်မြင်ရင် Payment Screen ကို ကူးပြောင်းမယ်
                setTimeout(() => {
                    Nav.showScreen('paymentScreen');
                    if (typeof window.startPaymentFlow === 'function') {
                        window.startPaymentFlow();
                    }
                }, 300);
            }
        } catch (err) {
            console.error("❌ API Error:", err);
            Nav.showScreen('paymentScreen');
        }
    },

    applySelectionUI(layoutId) {
        document.querySelectorAll('.layout-card-btn .apple-glass').forEach(el => {
            el.classList.remove('ring-4', 'ring-primary', 'border-primary');
        });

        const safeId = layoutId.toLowerCase().replace('+', 'plus');
        const selectedEl = document.querySelector(`#layout-${safeId} .apple-glass`);

        if (selectedEl) {
            selectedEl.classList.add('ring-4', 'ring-primary', 'border-primary', 'scale-95');
            setTimeout(() => selectedEl.classList.remove('scale-95'), 150);
        }
    }
};

window.selectCollage = async (layoutId, shots) => await Collage.select(layoutId, shots);

