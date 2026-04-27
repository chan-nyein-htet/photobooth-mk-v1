export const UI = {
    renderEffects(effectData, canvas, previewImg, onSelect) {
        const list = document.getElementById('effectList');
        if (!list) return;
        list.innerHTML = '';
        effectData.forEach(eff => {
            const b = document.createElement('div');
            const filterValue = eff.filter || 'none';
            
            // 🎯 Selection Sync လုပ်ဖို့ dataset ထည့်မယ်
            b.dataset.filter = filterValue;
            
            const isActive = filterValue === 'none' || filterValue === '';
            b.className = `box ${isActive ? 'active' : ''}`;

            // 🎯 Preview ပုံ ပြန်ပေါ်ဖို့ samplePath ကို ပြန်ထည့်ထားတယ်
            const samplePath = '/static/assets/samples/demo_3.jpg';

            b.innerHTML = `
                <div class="fx-preview" style="
                    background-image: url('${samplePath}');
                    background-size: cover;
                    background-position: center;
                    filter: ${eff.filter || 'none'};
                    background-color: #333;
                "></div>
                <div class="effect-name-tag">${eff.name}</div>
            `;
            
            b.onclick = () => {
                if (onSelect) onSelect(eff.filter);
                this._updateActive(list, b);
            };
            list.appendChild(b);
        });
    },

    // 🎯 Editor.js ထဲက handleSelection ကနေ ဒါကို လှမ်းခေါ်ပေးပါ
    syncFilterSelection(activeFilter) {
        const list = document.getElementById('effectList');
        if (!list) return;
        const val = activeFilter || 'none';
        list.querySelectorAll('.box').forEach(box => {
            if (box.dataset.filter === val) {
                box.classList.add('active');
            } else {
                box.classList.remove('active');
            }
        });
    },

    renderStickers(stickerData, onSelect) {
        // Sticker ပေါ်အောင် ID နှစ်မျိုးလုံးကို စစ်ထားပေးတယ်
        const list = document.getElementById('stickerList') || document.getElementById('galleryList');
        if (!list) return;
        list.innerHTML = '';
        stickerData.forEach(s => {
            const b = document.createElement('div');
            b.className = `box flex-shrink-0`;
            const url = typeof s === 'string' ? s : s.url;
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

