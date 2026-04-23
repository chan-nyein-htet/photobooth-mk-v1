import { State } from './state.js';
import { UI } from './ui.js';

export const Filters = {
    async init(canvas) {
        try {
            const res = await fetch('/api/assets');
            
            // ✅ JSON ဟုတ်မဟုတ် အရင်စစ်မယ် (HTML ကြီးဝင်လာရင် catch ဆီ လွှတ်ပစ်မယ်)
            if (!res.ok) throw new Error("Assets failed to load");
            const data = await res.json();

            // Backend က 'filters' လို့ ပို့ထားတာမို့ data.filters ကို သုံးရမယ်
            UI.renderEffects(data.filters || ['none'], canvas, null, (f) => {
                State.assets.currentFilterStr = f || 'none';
            });
            console.log("✅ Filters Initialized");
        } catch (err) {
            console.error("❌ Filters Init Error (JSON Syntax?):", err);
            // Error တက်ရင်လည်း default filter တွေနဲ့ ရှေ့ဆက်မယ်
            UI.renderEffects(['none', 'grayscale', 'sepia'], canvas, null, (f) => {
                State.assets.currentFilterStr = f || 'none';
            });
        }
    }
};

