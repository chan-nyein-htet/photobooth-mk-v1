import { State } from './state.js';

export const Setup = {
    setShots(n, btnElement) {
        State.config.shotLimit = n;
        document.querySelectorAll('.num-btn').forEach(x => x.classList.remove('btn-primary', 'btn-active'));
        if (btnElement) btnElement.classList.add('btn-primary', 'btn-active');
    },

    toggleOrientation() {
        const v = document.getElementById('vfContainer');
        if (!v) return;
        v.classList.toggle('mode-landscape');
        v.classList.toggle('mode-portrait');
        State.config.orientation = v.classList.contains('mode-portrait') ? 'portrait' : 'landscape';
        const text = document.getElementById('orientationText');
        if (text) text.innerText = State.config.orientation.toUpperCase();
    },

    initGallery() {
        // Sidebar ထဲက ID အသစ် sidebarPhotoGrid ကို သုံးထားတယ်
        const grid = document.getElementById('sidebarPhotoGrid');
        if(!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < State.config.shotLimit; i++) {
            const box = document.createElement('div');
            box.className = "gallery-item-box bg-white/5 rounded-2xl overflow-hidden aspect-[3/4]";
            box.innerHTML = `<img id="shot-${i}" class="w-full h-full object-cover hidden-element">`;
            grid.appendChild(box);
        }
    }
};

