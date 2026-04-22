import { State } from './state.js';
import { Camera } from './camera.js';

export const Capture = {
    start() {
        if (State.session.currentShot >= State.config.shotLimit) return;

        const snapBtn = document.getElementById('snapBtn');
        const el = document.getElementById('countdown');
        const flashOverlay = document.getElementById('flashOverlay');
        const timerControls = document.getElementById('timerControls');

        snapBtn.style.display = 'none';
        if (timerControls) timerControls.style.display = 'none';

        let count = State.config.timerValue;
        el.style.display = 'flex';
        el.innerText = count;

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                el.innerText = count;
            } else {
                clearInterval(timer);
                el.style.display = 'none';

                if (flashOverlay) {
                    flashOverlay.style.opacity = '1';
                    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 100);
                }

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
            
            // Sidebar ထဲက item box ကို visible ဖြစ်အောင် လုပ်ပေးမယ်
            targetImg.parentElement.classList.remove('bg-white/5');
        }
        State.session.currentShot++;
        this.resetUI();

        // 📸 ပုံအရေအတွက် ပြည့်သွားရင် Sidebar ထဲက Finish Button ကို ပြမယ်
        if (State.session.currentShot >= State.config.shotLimit) {
            // Sidebar ထဲမှာ Finish Button ရှိနေရင် အဲဒါကို ပြမယ်
            const finishBtn = document.getElementById('finishBtn');
            if (finishBtn) finishBtn.classList.remove('hidden-element');

            document.getElementById('snapBtn').style.display = 'none';
            const timerControls = document.getElementById('timerControls');
            if (timerControls) timerControls.style.display = 'none';
        }
    },

    retake() {
        this.resetUI();
    },

    resetUI() {
        if (State.session.currentShot < State.config.shotLimit) {
            document.getElementById('snapBtn').style.display = 'block';
            const timerControls = document.getElementById('timerControls');
            if (timerControls) timerControls.style.display = 'flex';
        } else {
            document.getElementById('snapBtn').style.display = 'none';
        }

        document.getElementById('liveCanvas').classList.remove('hidden-element');
        document.getElementById('previewImg').classList.add('hidden-element');
        document.getElementById('postCaptureBtns').classList.add('hidden-element');
    }
};

