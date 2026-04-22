import { State } from './state.js';
import { Camera } from './camera.js';
export const Capture = {
    start() {
        if (State.session.currentShot >= State.config.shotLimit) return;
        document.getElementById('snapBtn').classList.add('hidden-element');
        document.getElementById('timerControls').classList.add('hidden-element');
        let count = State.config.timerValue;
        const el = document.getElementById('countdown');
        el.style.display = 'flex'; el.innerText = count;
        const timer = setInterval(() => {
            count--; if (count > 0) el.innerText = count;
            else { clearInterval(timer); el.style.display = 'none'; this.takePhoto(); }
        }, 1000);
    },
    takePhoto() {
        const flash = document.getElementById('flashOverlay');
        flash.style.opacity = '1'; setTimeout(() => flash.style.opacity = '0', 100);
        State.session.tempImgData = Camera.capture(document.getElementById('liveCanvas'));
        const preview = document.getElementById('previewImg');
        preview.src = State.session.tempImgData;
        document.getElementById('liveCanvas').classList.add('hidden-element');
        preview.classList.remove('hidden-element');
        document.getElementById('postCaptureBtns').classList.remove('hidden-element');
    },
    keep() {
        const targetImg = document.getElementById(`shot-${State.session.currentShot}`);
        if (targetImg) { targetImg.src = State.session.tempImgData; targetImg.classList.remove('hidden-element'); }
        State.session.currentShot++; this.resetUI();
    },
    resetUI() {
        const isFinished = State.session.currentShot >= State.config.shotLimit;
        document.getElementById('snapBtn').classList.toggle('hidden-element', isFinished);
        document.getElementById('timerControls').classList.toggle('hidden-element', isFinished);
        document.getElementById('finishBtn').classList.toggle('hidden-element', !isFinished);
        document.getElementById('liveCanvas').classList.remove('hidden-element');
        document.getElementById('previewImg').classList.add('hidden-element');
        document.getElementById('postCaptureBtns').classList.add('hidden-element');
    }
};
window.startCapture = () => Capture.start();
window.retakePhoto = () => Capture.resetUI();
window.keepPhoto = () => Capture.keep();

