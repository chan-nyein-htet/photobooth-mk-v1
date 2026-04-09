import { Setup } from './setup.js';
import { Capture } from './capture.js';
import { State } from './state.js';
import { UI } from './ui.js';

export const Events = {
    init() {
        console.log("⚙️ UI Events Module Loaded");
        this.bindCoreFlows();
        this.bindCaptureActions();
        this.bindSelectionLogic();
    },

    bindCoreFlows() {
        // Yes, Reset Button (Back Modal)
        const confirmBtn = document.getElementById('confirmResetBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                console.log("⚠️ Reset Confirmed.");
                Setup.resetSession();
            });
        }

        // No, Stay Button
        document.getElementById('hideBackModalBtn')?.addEventListener('click', () => {
            UI.hideModal('backModal');
        });

        // Other Navigation
        document.getElementById('startAppBtn')?.addEventListener('click', () => Setup.startCameraFlow());
        document.getElementById('showBackModalBtn')?.addEventListener('click', () => UI.showModal('backModal'));
        document.getElementById('toggleOrientationBtn')?.addEventListener('click', () => Setup.toggleOrientation());
    },

    bindCaptureActions() {
        document.getElementById('snapBtn')?.addEventListener('click', () => Capture.start());
        document.getElementById('retakeBtn')?.addEventListener('click', () => Capture.retake());
        document.getElementById('keepBtn')?.addEventListener('click', () => Capture.keep());
        document.getElementById('finishBtn')?.addEventListener('click', () => Capture.finish());
    },

    bindSelectionLogic() {
        const shotGrid = document.getElementById('shotSelectionGrid');
        if (shotGrid) {
            shotGrid.addEventListener('click', (e) => {
                const btn = e.target.closest('.num-btn');
                if (btn) {
                    const shots = parseInt(btn.dataset.shots);
                    this.updateActiveButton(shotGrid, btn);
                    Setup.selectShots(shots);
                }
            });
        }
    },

    updateActiveButton(parent, activeBtn) {
        parent.querySelectorAll('.num-btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
        });
        activeBtn.classList.add('btn-primary');
        activeBtn.classList.remove('btn-outline');
    }
};

