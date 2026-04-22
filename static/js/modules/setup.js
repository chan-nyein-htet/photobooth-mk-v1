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
    }
};
window.toggleOrientation = () => {
    const v = document.getElementById('vfContainer');
    v.classList.toggle('mode-landscape');
    v.classList.toggle('mode-portrait');
    State.config.orientation = v.classList.contains('mode-portrait') ? 'portrait' : 'landscape';
    document.getElementById('orientationText').innerText = State.config.orientation.toUpperCase();
};

