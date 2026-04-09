export const UI = {
    renderEffects(effectData, canvas, previewImg, onSelect) {
        const list = document.getElementById('effectList');
        if(!list) return;
        list.innerHTML = '';

        effectData.forEach(eff => {
            const b = document.createElement('div');
            const isActive = eff.filter === 'none' || eff.filter === '';
            b.className = `box ${isActive ? 'active' : ''}`;
            b.innerHTML = `
                <div class="fx-preview" style="filter:${eff.filter}; width:100%; height:100%; background:#222; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; color:white;">FX</div>
                <div class="effect-name-tag">${eff.name}</div>
            `;

            b.onclick = () => {
                if (onSelect) onSelect(eff.filter);
                this._updateActive(list, b);
            };
            list.appendChild(b);
        });
    },

    renderStickers(stickerData, onSelect) {
        const list = document.getElementById('stickerList');
        if(!list) return;
        list.innerHTML = '';

        this._createStickerBox('NONE', null, onSelect, list, true);
        stickerData.forEach(s => {
            this._createStickerBox(null, s.url, onSelect, list, false);
        });
    },

    _updateActive(parent, activeEl) {
        parent.querySelectorAll('.box').forEach(x => x.classList.remove('active'));
        activeEl.classList.add('active');
    },

    _createStickerBox(text, url, onSelect, parent, isActive) {
        const b = document.createElement('div');
        b.className = `box ${isActive ? 'active' : ''}`;
        b.innerHTML = url ? `<img src="${url}" style="width:70%; height:70%; object-fit:contain;">` : `<span style="font-size:10px; color:#666;">${text}</span>`;
        
        b.onclick = () => {
            if (!url) {
                onSelect(null);
                this._updateActive(parent, b);
            } else {
                const i = new Image();
                i.crossOrigin = "anonymous";
                i.src = url;
                i.onload = () => {
                    onSelect(i);
                    this._updateActive(parent, b);
                };
            }
        };
        parent.appendChild(b);
        return b;
    }
};

