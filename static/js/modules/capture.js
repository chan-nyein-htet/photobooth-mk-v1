import { State } from './state.js';
import { Camera } from './camera.js';
import { Nav } from './navigation.js';
import { Editor } from './editor.js';

export const Capture = {
    isProcessing: false,

    start() {
        if (State.session.isCapturing || State.session.currentShot >= State.config.shotLimit) return;
        State.session.isCapturing = true;

        // Snap Button ကို ခေတ္တဖျောက်ထားမယ်
        document.getElementById('snapBtn')?.classList.add('hidden-element');

        let count = State.config.timerValue || 3;
        const el = document.getElementById('countdown');
        if (el) {
            el.style.display = 'flex';
            el.innerText = count;
        }

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                if (el) el.innerText = count;
            } else {
                clearInterval(timer);
                if (el) el.style.display = 'none';
                this.takePhoto();
            }
        }, 1000);
    },

    takePhoto() {
        const liveCanvas = document.getElementById('liveCanvas');
        const previewImg = document.getElementById('previewImg');
        const postBtns = document.getElementById('postCaptureBtns');

        const capturedData = Camera.capture(liveCanvas);

        if (capturedData) {
            State.session.tempImgData = capturedData;

            // ✅ Camera Feed ကို ဖျောက်ပြီး Preview ပုံကို တင်မယ်
            if (liveCanvas) liveCanvas.classList.add('hidden-element');
            
            if (previewImg) {
                previewImg.src = capturedData;
                previewImg.classList.remove('hidden-element');
            }

            // ✅ Save/Retake Button တွေကို ဖော်မယ်
            if (postBtns) {
                postBtns.classList.remove('hidden-element');
                postBtns.style.display = 'flex';
            }
        }
    },

    keep() {
        if (!State.session.tempImgData) return;

        if (!State.session.capturedImages) State.session.capturedImages = [];
        State.session.capturedImages.push(State.session.tempImgData);

        const targetImg = document.getElementById(`shot-${State.session.currentShot}`);
        if (targetImg) {
            targetImg.src = State.session.tempImgData;
            targetImg.classList.remove('hidden-element');
        }

        State.session.currentShot++;

        if (State.session.currentShot >= State.config.shotLimit) {
            this.finish();
        } else {
            this.resetUI();
        }
    },

    resetUI() {
        State.session.isCapturing = false;
        State.session.tempImgData = null;

        // ✅ UI ကို Reset လုပ်ပြီး Camera Feed ပြန်ဖွင့်မယ်
        document.getElementById('liveCanvas')?.classList.remove('hidden-element');
        document.getElementById('previewImg')?.classList.add('hidden-element');
        document.getElementById('snapBtn')?.classList.remove('hidden-element');
        
        const postBtns = document.getElementById('postCaptureBtns');
        if (postBtns) {
            postBtns.classList.add('hidden-element');
            postBtns.style.display = 'none';
        }
    },

    async finish() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.classList.remove('hidden-element');
            finishBtn.innerText = "PROCESSING...";
        }

        try {
            const response = await fetch('/api/process_photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: State.session.orderId,
                    images: State.session.capturedImages
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                Nav.showScreen('photoEditorView');
                Editor.init();
            }
        } catch (error) {
            console.error("❌ Finish Error:", error);
            this.isProcessing = false;
        }
    }
};

window.startCapture = () => Capture.start();
window.keepPhoto = () => Capture.keep();
window.retakePhoto = () => Capture.resetUI();

