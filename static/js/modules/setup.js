import { State } from './state.js';

export const Setup = {
    initGallery() {
        const grid = document.getElementById('sidebarPhotoGrid');
        if(!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < State.config.shotLimit; i++) {
            const box = document.createElement('div');
            box.style.minWidth = "75px";
            box.style.height = "100px";
            box.className = "flex-none bg-white/10 rounded-xl overflow-hidden border border-white/5";
            box.innerHTML = `<img id="shot-${i}" class="w-full h-full object-cover hidden-element">`;
            grid.appendChild(box);
        }
    },

    // 🎯 ဒီ function ကို Setup object ထဲမှာ အသေသတ်မှတ်လိုက်တာ
    toggleOrientation() {
        const v = document.getElementById('vfContainer');
        if(!v) return;

        v.classList.toggle('mode-landscape');
        v.classList.toggle('mode-portrait');

        // State ကို update လုပ်မယ်
        State.config.orientation = v.classList.contains('mode-portrait') ? 'portrait' : 'landscape';
        
        // စာသားကို update လုပ်မယ်
        const text = document.getElementById('orientationText');
        if(text) text.innerText = State.config.orientation.toUpperCase();
        
        console.log("🔄 Orientation Switched to:", State.config.orientation);
    }
};

// ⚠️ အောက်မှာ ကျန်ခဲ့တတ်တဲ့ window.toggleOrientation = ... ဆိုတဲ့ line ရှိရင် ဖြုတ်ပစ်ပါ

