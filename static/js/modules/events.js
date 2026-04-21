import { Setup } from './setup.js';
import { Capture } from './capture.js';
import { UI } from './ui.js';

export const Events = {
    init() {
        console.log("⚙️ UI Events Module Loaded & Synced");
        this.bindCoreFlows();
        this.bindCaptureActions();
        this.bindSelectionLogic();
    },

    bindCoreFlows() {
        // Welcome -> Payment
        document.getElementById('startPaymentBtn')?.addEventListener('click', () => {
            window.startPaymentFlow();
        });

        // Setup -> Camera
        document.getElementById('startAppBtn')?.addEventListener('click', () => {
            window.startCameraFlow();
        });

        // Modals
        document.getElementById('showBackModalBtn')?.addEventListener('click', () => window.showBackModal());
        document.getElementById('hideBackModalBtn')?.addEventListener('click', () => window.hideBackModal());
        document.getElementById('confirmResetBtn')?.addEventListener('click', () => window.resetAndBack());

        // UI Orientation
        document.getElementById('toggleOrientationBtn')?.addEventListener('click', () => window.toggleOrientation());
    },

    bindCaptureActions() {
        document.getElementById('snapBtn')?.addEventListener('click', () => window.startCapture());
        document.getElementById('retakeBtn')?.addEventListener('click', () => window.retakePhoto());
        document.getElementById('keepBtn')?.addEventListener('click', () => window.keepPhoto());
        document.getElementById('finishBtn')?.addEventListener('click', () => {
            if (window.handleContinue) window.handleContinue();
            else Capture.finish();
        });
    },

    bindSelectionLogic() {
        const shotGrid = document.getElementById('shotSelectionGrid');
        if (shotGrid) {
            shotGrid.addEventListener('click', (e) => {
                const btn = e.target.closest('.num-btn');
                if (btn) {
                    const shots = parseInt(btn.dataset.shots);
                    this.updateActiveButton(shotGrid, btn);
                    window.selectShots(shots, btn);
                }
            });
        }
    },

    updateActiveButton(parent, activeBtn) {
        parent.querySelectorAll('.num-btn').forEach(b => {
            b.classList.remove('btn-primary', 'btn-active');
            b.classList.add('btn-outline');
        });
        activeBtn.classList.add('btn-primary', 'btn-active');
        activeBtn.classList.remove('btn-outline');
    }
};

