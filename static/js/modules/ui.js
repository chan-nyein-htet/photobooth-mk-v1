// ✅ UI ဆိုတဲ့ object ထဲမှာ function တွေအကုန် စုထည့်လိုက်တာပါ
export const UI = {
    // app.js က လှမ်းခေါ်မယ့် init function
    init: function() {
        console.log("UI Module Initialized");
    },

    // မူရင်း renderEffects logic
    renderEffects: function(effectData, canvas, previewImg) {
        const effectList = document.getElementById('effectList');
        if(!effectList) return;
        effectList.innerHTML = '';

        effectData.forEach(eff => {
            const b = document.createElement('div');
            b.className = 'box';
            b.innerHTML = `
                <div style="width:100%; height:100%; background:#222; filter:${eff.filter}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; font-weight:bold;">
                    FX
                </div>
                <div class="effect-name-tag">${eff.name}</div>
            `;

            if(eff.filter === 'none' || eff.filter === '') b.classList.add('active');

            b.onclick = () => {
                canvas.style.filter = eff.filter;
                previewImg.style.filter = eff.filter;
                document.querySelectorAll('#effectList .box').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
            };
            effectList.appendChild(b);
        });
    },

    // မူရင်း renderStickers logic
    renderStickers: function(stickerData, onSelect) {
        const stickerList = document.getElementById('stickerList');
        if(!stickerList) return;
        stickerList.innerHTML = '';

        const noneBtn = document.createElement('div');
        noneBtn.className = 'box active';
        noneBtn.innerHTML = `<span style="font-size:10px; color:#666;">NONE</span>`;
        noneBtn.onclick = () => {
            onSelect(null, '');
            document.querySelectorAll('#stickerList .box').forEach(x => x.classList.remove('active'));
            noneBtn.classList.add('active');
        };
        stickerList.appendChild(noneBtn);

        stickerData.forEach(s => {
            const b = document.createElement('div');
            b.className = 'box';
            b.innerHTML = `<img src="${s.url}" style="width:70%; height:70%; object-fit:contain;">`;
            b.onclick = () => {
                const i = new Image();
                i.crossOrigin = "anonymous";
                i.src = s.url;
                i.onload = () => {
                    onSelect(i, s.url);
                    document.querySelectorAll('#stickerList .box').forEach(x => x.classList.remove('active'));
                    b.classList.add('active');
                };
            };
            stickerList.appendChild(b);
        });
    }
};

