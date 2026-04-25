import { State } from './state.js';
import { Camera } from './camera.js';
import { Nav } from './navigation.js';
import { Editor } from './editor.js';

export const Capture = {
    isProcessing: false,

    start() {
        if (State.session.isCapturing || State.session.currentShot >= State.config.shotLimit) return;
        State.session.isCapturing = true;

        // UI Reset
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

            if (liveCanvas) liveCanvas.classList.add('hidden-element');

            if (previewImg) {
                previewImg.src = capturedData;
                previewImg.classList.remove('hidden-element');
            }

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
            finishBtn.disabled = true;
        }

        try {
            // ✅ Layout ID ကို State ထဲကနေ သေချာဆွဲထုတ်မယ်
            const currentLayout = State.session.layoutId || '1000022813';

            const response = await fetch('/api/process_photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: State.session.orderId,
                    layout_id: currentLayout,
                    images: State.session.capturedImages
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                // ✅ အရေးကြီးဆုံး Sync: Backend က ရလာတဲ့ Slot positions နဲ့ Photo Paths တွေကို သိမ်းမယ်
                State.session.layout_details = result.layout_details;
                State.session.capturedImages = result.photo_urls; 
                
                console.log("✅ Photo Processing Complete. Syncing to Editor...");
                
                Nav.showScreen('photoEditorView');
                Editor.init();
            } else {
                throw new Error(result.message || "Server error");
            }
        } catch (error) {
            console.error("❌ Finish Error:", error);
            alert("Error processing photos. Please try again.");
            this.isProcessing = false;
            if (finishBtn) {
                finishBtn.innerText = "RETRY";
                finishBtn.disabled = false;
            }
        }
    }
};

window.startCapture = () => Capture.start();
window.keepPhoto = () => Capture.keep();
window.retakePhoto = () => Capture.resetUI();

