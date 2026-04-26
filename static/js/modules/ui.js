export const UI = {
    renderEffects(effectData, canvas, previewImg, onSelect) {
        const list = document.getElementById('effectList');
        if (!list) return;
        list.innerHTML = '';
        effectData.forEach(eff => {
            const b = document.createElement('div');
            const isActive = eff.filter === 'none' || eff.filter === '';
            b.className = `box ${isActive ? 'active' : ''}`;
            b.innerHTML = `
                <div class="fx-preview" style="filter:${eff.filter}; background:#333;"></div>
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
        if (!list) return;
        list.innerHTML = '';
        stickerData.forEach(s => {
            const b = document.createElement('div');
            // 🎯 Tailwind classes တွေဖြုတ်ပြီး CSS က .box ကိုပဲ သုံးမယ်
            // flex-shrink-0 တစ်ခုပဲ ထည့်ထားမယ် (scroll ဆွဲလို့ရအောင်)
            b.className = `box flex-shrink-0`;

            const url = typeof s === 'string' ? s : s.url;
            // 🎯 Inline styles တွေဖြုတ်လိုက်ပြီ (CSS ကနေပဲ ထိန်းမယ်)
            b.innerHTML = `<img src="${url}" crossorigin="anonymous">`;

            b.onclick = () => {
                if (onSelect) onSelect(url);
                this._updateActive(list, b);
            };
            list.appendChild(b);
        });
    },

    _updateActive(parent, activeEl) {
        parent.querySelectorAll('.box').forEach(x => x.classList.remove('active'));
        activeEl.classList.add('active');
    }
};

