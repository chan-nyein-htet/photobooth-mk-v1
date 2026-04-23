import { Nav } from './navigation.js';
import { State } from './state.js';

export const Collage = {
    init() { console.log("🎨 Collage Module Ready"); },

    updateCanvasUI(layoutId) {
        try {
            const configEl = document.getElementById('canvas-configs');
            if (!configEl) return;
            const configs = JSON.parse(configEl.textContent);
            const type = ['A', 'B', 'C', 'D'].includes(layoutId) ? "6x2" : "6x4";
            const size = configs[type];

            if (size) {
                const root = document.documentElement;
                root.style.setProperty('--canvas-w', `${size.width}px`);
                root.style.setProperty('--canvas-h', `${size.height}px`);
                const mainCanvas = document.getElementById('mainCanvas');
                if (mainCanvas) mainCanvas.style.aspectRatio = `${size.width} / ${size.height}`;
            }
        } catch (err) { console.error("❌ UI Sync Error:", err); }
    },

    async select(layoutId, shots) {
        if (!layoutId || layoutId === 'undefined') return;

        console.log(`📡 Selecting Layout: ${layoutId}`);
        Collage.updateCanvasUI(layoutId);

        if (State && State.session) {
            State.session.layoutId = layoutId;
            State.session.totalShots = parseInt(shots);
        }

        try {
            const res = await fetch('/api/create_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ layout: layoutId, shots: parseInt(shots) })
            });
            const data = await res.json();

            if (data.status === 'success') {
                State.session.order_id = data.order_id;
                console.log(`✅ Order Created: ${data.order_id}`);
                
                // 🎯 မင်းရဲ့ payment.js ထဲက function ကို တိုက်ရိုက်လှမ်းခေါ်လိုက်တာ
                if (window.startPaymentFlow) {
                    window.startPaymentFlow();
                } else {
                    Nav.showScreen('paymentScreen');
                }
            }
        } catch (err) {
            console.error("❌ API Error:", err);
            Nav.showScreen('paymentScreen');
        }
    }
};

window.selectCollage = (id, shots) => Collage.select(id, shots);

