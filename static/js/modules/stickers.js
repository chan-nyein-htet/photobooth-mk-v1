import { State } from './state.js';
import { UI } from './ui.js';

export const Stickers = {
    async init() {
        try {
            const res = await fetch('/api/assets');
            
            if (!res.ok) throw new Error("Assets failed to load");
            const data = await res.json();

            UI.renderStickers(data.stickers || [], (img) => {
                State.assets.activeStickerImg = img;
            });
            console.log("✅ Stickers Initialized");
        } catch (err) {
            console.error("❌ Stickers Init Error (JSON Syntax?):", err);
            // Stickers မရှိလည်း UI မပျက်အောင် empty array နဲ့ ဆက်သွားမယ်
            UI.renderStickers([], (img) => {
                State.assets.activeStickerImg = img;
            });
        }
    }
};

