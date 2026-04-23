import { Setup } from './setup.js';
import { Capture } from './capture.js';
import { UI } from './ui.js';
import { State } from './state.js';
import { Nav } from './navigation.js';

export const Events = {
    init() {
        console.log("⚙️ UI Events Module Loaded");
        this.bindCoreFlows();
        this.bindCaptureActions();
        this.bindTimerActions();
    },

    bindCoreFlows() {
        // Welcome -> Collage Selection
        document.getElementById('startPaymentBtn')?.addEventListener('click', () => {
            Nav.showScreen('collageSelect');
        });

        // Layout Selection (Double call ရှောင်ရန် simple listener သုံးမယ်)
        const layoutBtns = document.querySelectorAll('.layout-card-btn');
        layoutBtns.forEach(btn => {
            btn.onclick = () => {
                const layout = btn.dataset.layout;
                const shots = btn.dataset.shots;
                import('./collage.js').then(m => m.Collage.select(layout, shots));
            };
        });

        document.getElementById('backToWelcomeBtn')?.addEventListener('click', () => {
            Nav.showScreen('welcomeScreen');
        });

        document.getElementById('startAppBtn')?.addEventListener('click', () => {
            window.startCameraFlow();
        });

        document.getElementById('confirmResetBtn')?.addEventListener('click', () => window.resetAndBack());
        document.getElementById('toggleOrientationBtn')?.addEventListener('click', () => window.toggleOrientation());
    },

    bindTimerActions() {
        const timerOpts = document.querySelectorAll('.timer-opt');
        timerOpts.forEach(btn => {
            btn.addEventListener('click', () => {
                timerOpts.forEach(b => b.classList.remove('active-timer'));
                btn.classList.add('active-timer');
                State.config.timerValue = parseInt(btn.dataset.sec);
            });
        });
    },

    bindCaptureActions() {
        document.getElementById('snapBtn')?.addEventListener('click', () => window.startCapture());
        document.getElementById('retakeBtn')?.addEventListener('click', () => window.retakePhoto());
        document.getElementById('keepBtn')?.addEventListener('click', () => window.keepPhoto());

        document.getElementById('finishBtn')?.addEventListener('click', () => {
            if (window.handleContinue) window.handleContinue();
            else Capture.finish();
        });
    }
};

