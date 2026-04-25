import { FaceDet } from './faceDet.js';
import { State } from './state.js';

export const Camera = {
    isVictoryGesture: false,
    holdStartTime: null,
    lastUpdateTime: 0,
    overlayTimeout: null,

    async start(video, canvas) {
        const ctx = canvas.getContext('2d');
        FaceDet.init(video);
        this.createTimerOverlay();

        FaceDet.onResults((res) => {
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
                const landmarks = res.multiHandLandmarks[0];
                this.handleTimerControl(landmarks);
                this.checkGesture(landmarks);
            } else {
                this.isVictoryGesture = false;
                this.holdStartTime = null;
            }
        });
    },

    createTimerOverlay() {
        if (document.getElementById('gestureTimerOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'gestureTimerOverlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: '9999', pointerEvents: 'none',
            opacity: '0', transition: 'all 0.3s ease', transform: 'scale(0.95)'
        });
        overlay.innerHTML = `
            <div style="background: rgba(0,0,0,0.5); backdrop-filter: blur(15px); width: 180px; height: 180px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid #FFD700; box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);">
                <span id="gestureTimerValue" style="color: #FFD700; font-size: 5rem; font-weight: 900; font-style: italic;">5s</span>
                <span id="gestureActionLabel" style="color: white; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Selected</span>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    handleTimerControl(landmarks) {
        if (State.session.isCapturing || State.session.tempImgData) return;
        const tips = [8, 12, 16, 20], bases = [6, 10, 14, 18];
        let fingersUp = 0;
        tips.forEach((tip, i) => { if (landmarks[tip].y < landmarks[bases[i]].y) fingersUp++; });

        if (fingersUp === 4 || fingersUp === 0) {
            if (!this.holdStartTime) this.holdStartTime = Date.now();
            if (Date.now() - this.holdStartTime > 1000 && Date.now() - this.lastUpdateTime > 1000) {
                this.cycleTimer(fingersUp === 4 ? 1 : -1);
                this.lastUpdateTime = Date.now();
            }
        } else { this.holdStartTime = null; }
    },

    cycleTimer(direction) {
        const options = [3, 5, 10, 20];
        let nextIndex = (options.indexOf(State.config.timerValue) + direction + options.length) % options.length;
        State.config.timerValue = options[nextIndex];
        
        document.querySelectorAll('.timer-opt').forEach(btn => btn.classList.toggle('active-timer', parseInt(btn.dataset.sec) === State.config.timerValue));
        
        const text = document.getElementById('gestureTimerValue');
        const overlay = document.getElementById('gestureTimerOverlay');
        if (text && overlay) {
            text.innerText = State.config.timerValue + "s";
            overlay.style.opacity = '1';
            setTimeout(() => overlay.style.opacity = '0', 800);
        }
    },

    checkGesture(landmarks) {
        // ✌️ Victory (Start)
        const isVictory = landmarks[8].y < landmarks[6].y && landmarks[12].y < landmarks[10].y && 
                          landmarks[16].y > landmarks[14].y && landmarks[20].y > landmarks[18].y;

        // 👍 Thumb Up (Keep) - လက်မက လက်ညှိုးထက် မြင့်နေရမယ်
        const isThumbUp = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[8].y && landmarks[8].y > landmarks[6].y;

        // 👎 Thumb Down (Retake) - လက်မက လက်ညှိုးအောက် နိမ့်နေရမယ်
        const isThumbDown = landmarks[4].y > landmarks[3].y && landmarks[4].y > landmarks[8].y && landmarks[8].y < landmarks[6].y;

        if (isVictory && !State.session.isCapturing && !State.session.tempImgData) {
            if (!this.isVictoryGesture) {
                this.isVictoryGesture = true;
                if (window.startCapture) window.startCapture();
            }
        } else if (isThumbUp && State.session.tempImgData) {
            window.keepPhoto();
        } else if (isThumbDown && State.session.tempImgData) {
            window.retakePhoto();
        } else {
            this.isVictoryGesture = false;
        }
    },

    capture(liveCanvas) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = liveCanvas.width;
        tempCanvas.height = liveCanvas.height;
        tempCanvas.getContext('2d').drawImage(liveCanvas, 0, 0);
        return tempCanvas.toDataURL('image/jpeg', 0.95);
    }
};

