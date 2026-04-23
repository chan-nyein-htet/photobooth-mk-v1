import { Nav } from './navigation.js';
import { State } from './state.js';

export const Collage = {
    init() { console.log("🎨 Collage Module Ready"); },

    updateCanvasUI(size) {
        try {
            const configEl = document.getElementById('canvas-configs');
            if (!configEl) return;
            const configs = JSON.parse(configEl.textContent);
            const selectedSize = configs[size];

            if (selectedSize) {
                const root = document.documentElement;
                root.style.setProperty('--canvas-w', `${selectedSize.width}px`);
                root.style.setProperty('--canvas-h', `${selectedSize.height}px`);
                const mainCanvas = document.getElementById('mainCanvas');
                if (mainCanvas) mainCanvas.style.aspectRatio = `${selectedSize.width} / ${selectedSize.height}`;
                console.log(`📏 UI Updated for ${size}`);
            }
        } catch (err) { console.error("❌ UI Sync Error:", err); }
    },

    async select(layoutId, size, shots) {
        if (!layoutId || layoutId === 'undefined') return;

        console.log(`📡 Selecting: ${layoutId} | Size: ${size} | Shots: ${shots}`);
        
        // UI & State Sync
        this.updateCanvasUI(size);
        State.session.layoutId = layoutId;
        State.session.paperSize = size;
        State.session.totalShots = parseInt(shots);

        try {
            const res = await fetch('/api/create_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    layout: layoutId, 
                    size: size, 
                    shots: parseInt(shots) 
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                State.session.orderId = data.order_id;
                console.log(`✅ Order Created: ${State.session.orderId}`);

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

// 🎯 Global Bridge (HTML က ခေါ်မယ့်ကောင်)
window.selectCollage = (id, size, shots) => Collage.select(id, size, shots);

