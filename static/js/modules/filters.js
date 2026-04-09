import { State } from './state.js';
import { UI } from './ui.js';

export const Filters = {
    async init(canvas) {
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            UI.renderEffects(data.effects, canvas, null, (f) => {
                State.assets.currentFilterStr = f || 'none';
            });
            console.log("✅ Filters Initialized");
        } catch (err) {
            console.error("❌ Filters Init Error:", err);
        }
    }
};

