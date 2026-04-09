import { State } from './state.js';
import { UI } from './ui.js';

export const Stickers = {
    async init() {
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            UI.renderStickers(data.stickers, (img) => {
                State.assets.activeStickerImg = img;
            });
            console.log("Stickers Initialized");
        } catch (err) {
            console.error("Stickers Init Error:", err);
        }
    }
};

