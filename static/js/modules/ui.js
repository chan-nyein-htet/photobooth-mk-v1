import { Editor } from './editor.js';

export const UI = {
    /**
     * 🎨 Filters/Effects ကို Render လုပ်ခြင်း
     */
    renderEffects(effectData, canvas, previewImg, onSelect) {
        const list = document.getElementById('effectList'); // ID Fix
        if (!list) return;
        list.innerHTML = '';

        effectData.forEach(eff => {
            const b = document.createElement('div');
            // Filter value မရှိရင် active (Normal) ပေးမယ်
            const isActive = eff.filter === 'none' || eff.filter === '';
            b.className = `box ${isActive ? 'active' : ''}`;
            
            b.innerHTML = `
                <div class="fx-preview" style="filter:${eff.filter}; background:#333; border: 1px solid rgba(255,255,255,0.1);"></div>
                <div class="effect-name-tag">${eff.name}</div>
            `;

            b.onclick = () => {
                if (onSelect) onSelect(eff.filter);
                
                // Fabric.js Canvas ကို Filter သက်ရောက်စေခြင်း
                if (canvas && canvas.backgroundImage) {
                    // ဤနေရာတွင် Fabric Filter Logic ထည့်သွင်းနိုင်သည်
                    canvas.renderAll();
                }
                
                this._updateActive(list, b);
            };
            list.appendChild(b);
        });
    },

    /**
     * 🎭 Stickers ကို Render လုပ်ခြင်း
     */
    renderStickers(stickerData, onSelect) {
        const list = document.getElementById('stickerList'); // ID Fix
        if (!list) return;
        list.innerHTML = '';

        // ၁။ 'None' option အရင်ထည့်မယ်
        this._createStickerBox('NONE', null, onSelect, list, true);

        // ၂။ API ကလာတဲ့ Stickers တွေကို ပတ်ထုတ်မယ်
        stickerData.forEach(s => {
            this._createStickerBox(null, s.url, onSelect, list, false);
        });
    },

    /**
     * Sticker Box လေးတွေ တည်ဆောက်ခြင်း
     */
    _createStickerBox(text, url, onSelect, parent, isActive) {
        const b = document.createElement('div');
        b.className = `box ${isActive ? 'active' : ''}`;
        
        // ပုံရှိရင် img တပ်မယ်၊ မရှိရင် text ပြမယ်
        b.innerHTML = url ? 
            `<img src="${url}" crossorigin="anonymous">` : 
            `<span style="font-size:10px; color:#666; font-weight:900;">${text}</span>`;

        b.onclick = () => {
            if (!url) {
                if (onSelect) onSelect(null);
                this._updateActive(parent, b);
            } else {
                // Sticker Image ကို Load လုပ်ပြီး Editor ဆီ ပို့မယ်
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = url;
                img.onload = () => {
                    // Editor ထဲက addSticker helper ကို သုံးပြီး Canvas ပေါ်တင်မယ်
                    Editor.addSticker(img);
                    if (onSelect) onSelect(img);
                    this._updateActive(parent, b);
                };
            }
        };
        parent.appendChild(b);
        return b;
    },

    /**
     * Active Class ကို နေရာရွှေ့ပေးခြင်း
     */
    _updateActive(parent, activeEl) {
        parent.querySelectorAll('.box').forEach(x => x.classList.remove('active'));
        activeEl.classList.add('active');
    }
};

