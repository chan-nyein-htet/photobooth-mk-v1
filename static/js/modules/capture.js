import { State } from './state.js';
import { Camera } from './camera.js';
import { Nav } from './navigation.js'; // ✅ Screen ပြောင်းဖို့ Nav သွင်းမယ်

export const Capture = {
    isProcessing: false,

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
        if (targetImg) {
            targetImg.src = State.session.tempImgData;
            targetImg.classList.remove('hidden-element');
        }

        if (!State.session.capturedImages) State.session.capturedImages = [];
        State.session.capturedImages.push(State.session.tempImgData);

        State.session.currentShot++;

        if (State.session.currentShot >= State.config.shotLimit) {
            this.finish(); // ✅ events.js က ခေါ်တဲ့အတိုင်း
        } else {
            this.resetUI();
        }
    },

    resetUI() {
        document.getElementById('snapBtn').classList.remove('hidden-element');
        document.getElementById('timerControls').classList.remove('hidden-element');
        document.getElementById('liveCanvas').classList.remove('hidden-element');
        document.getElementById('previewImg').classList.add('hidden-element');
        document.getElementById('postCaptureBtns').classList.add('hidden-element');
    },

    // ✅ events.js က Capture.finish() ဆိုပြီး လှမ်းခေါ်တဲ့ function
    finish() {
        this.finishAndProcess();
    },

    async finishAndProcess() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        console.log("🚀 Starting processing...");

        // UI Fix: Save/Retake Button များကို ဖျောက်မည်
        const postBtns = document.getElementById('postCaptureBtns');
        if (postBtns) postBtns.classList.add('hidden-element');

        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.classList.remove('hidden-element');
            finishBtn.innerText = "PROCESSING...";
            finishBtn.disabled = true;
        }

        const payload = {
            order_id: State.session.orderId || State.session.order_id,
            layout_id: State.session.layoutId || 'A+',
            images: State.session.capturedImages
        };

        try {
            const response = await fetch('/api/process_photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status === 'success') {
                console.log("✅ Backend processed photos");
                if (finishBtn) {
                    finishBtn.innerText = "NEXT ➔";
                    finishBtn.disabled = false;
                    // ✅ NEXT ကို နှိပ်လိုက်ရင် Edit Screen ကို သွားမယ်
                    finishBtn.onclick = () => {
                        console.log("Moving to Edit Screen");
                        Nav.showScreen('editScreen'); 
                    };
                }
            } else {
                console.error("❌ Backend Error:", result.message);
                if (finishBtn) {
                    finishBtn.innerText = "RETRY";
                    finishBtn.disabled = false;
                }
                this.isProcessing = false;
            }
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            this.isProcessing = false;
        }
    }
};

// Global mapping
window.startCapture = () => Capture.start();
window.retakePhoto = () => Capture.resetUI();
window.keepPhoto = () => Capture.keep();
window.finishCapture = () => Capture.finish();

