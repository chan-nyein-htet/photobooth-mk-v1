import { Capture } from './capture.js';
import { Nav } from './navigation.js';
import { State } from './state.js';

export const Events = {
    init() {
        console.log("⚙️ Events Module Initialized");
        this.bindCoreFlows();
        this.bindCaptureActions();
        this.bindTimerActions();
    },

    bindCoreFlows() {
        document.getElementById('startPaymentBtn')?.addEventListener('click', () => Nav.showScreen('collageSelect'));
        document.getElementById('backToWelcomeBtn')?.addEventListener('click', () => Nav.showScreen('welcomeScreen'));
        document.getElementById('startAppBtn')?.addEventListener('click', () => {
            if (window.startCameraFlow) window.startCameraFlow();
        });
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
        document.getElementById('snapBtn')?.addEventListener('click', () => Capture.start());
        document.getElementById('retakeBtn')?.addEventListener('click', () => Capture.resetUI());
        document.getElementById('keepBtn')?.addEventListener('click', () => Capture.keep());
        document.getElementById('finishBtn')?.addEventListener('click', () => Capture.finish());
    }
};

