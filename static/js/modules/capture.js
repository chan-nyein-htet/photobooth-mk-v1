import { State } from './state.js';
import { Camera } from './camera.js';

export const Capture = {
    start() {
        if (State.session.currentShot >= State.config.shotLimit) return;
        document.getElementById('snapBtn').style.display = 'none';
        let count = 3;
        const el = document.getElementById('countdown');
        el.style.display = 'flex'; el.innerText = count;

        const timer = setInterval(() => {
            count--;
            if (count > 0) el.innerText = count;
            else if (count === 0) el.innerText = "📸";
            else {
                clearInterval(timer);
                el.style.display = 'none';
                State.session.tempImgData = Camera.capture(document.getElementById('liveCanvas'));
                const previewImg = document.getElementById('previewImg');
                previewImg.src = State.session.tempImgData;
                document.getElementById('liveCanvas').classList.add('hidden-element');
                previewImg.classList.remove('hidden-element');
                document.getElementById('postCaptureBtns').classList.remove('hidden-element');
            }
        }, 1000);
    },

    keep() {
        const targetImg = document.getElementById(`shot-${State.session.currentShot}`);
        if (targetImg) {
            targetImg.src = State.session.tempImgData;
            targetImg.classList.remove('hidden-element');
        }
        State.session.currentShot++;
        this.resetUI();
        if (State.session.currentShot >= State.config.shotLimit) {
            document.getElementById('finishBtn').classList.remove('hidden-element');
            document.getElementById('snapBtn').style.display = 'none';
        }
    },

    retake() {
        this.resetUI();
    },

    resetUI() {
        document.getElementById('snapBtn').style.display = 'block';
        document.getElementById('liveCanvas').classList.remove('hidden-element');
        document.getElementById('previewImg').classList.add('hidden-element');
        document.getElementById('postCaptureBtns').classList.add('hidden-element');
    }
};

