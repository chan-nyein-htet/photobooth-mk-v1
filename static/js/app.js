import { Debug } from './modules/debug.js';
Debug.init();

import { Nav } from './modules/navigation.js';
import { State } from './modules/state.js';
import { Payment } from './modules/payment.js';
import { Camera } from './modules/camera.js';
import { Stickers } from './modules/stickers.js';
import { Filters } from './modules/filters.js';
import { Capture } from './modules/capture.js';
import { Setup } from './modules/setup.js';
import { Events } from './modules/events.js';
import { Collage } from './modules/collage.js';

// --- Global Actions (Window Bindings) ---
window.selectCollage = (id, shots) => Collage.select(id, shots); // 🎯 Ensure binding
window.startPaymentFlow = () => Payment.startFlow();
window.startCapture     = () => Capture.start();
window.keepPhoto        = () => Capture.keep();
window.retakePhoto      = () => Capture.resetUI();
window.selectShots      = (n, btn) => Setup.setShots(n, btn);
window.toggleOrientation = () => Setup.toggleOrientation();

window.startCameraFlow = async () => {
    Nav.showScreen('mainApp');                        
    Setup.initGallery();
    const canvas = document.getElementById('liveCanvas');
    await Promise.all([Stickers.init(), Filters.init(canvas)]);
    const video = document.getElementById('video');
    if (video && canvas) {
        await Camera.start(video, canvas);
    }
};

window.resetAndBack = () => {
    State.reset();
    location.reload();
};

window.showScreen = (id) => Nav.showScreen(id);
window.showBackModal = () => Nav.showModal('backModal');
window.hideBackModal = () => Nav.hideModal('backModal');

// 🚀 App စတင်မယ်
document.addEventListener('DOMContentLoaded', () => {
    console.log("⚙️ System booting...");
    // 🎯 Collage ကို အရင် Boot ပြီးမှ Events ကို ခေါ်မယ်
    Collage.init(); 
    Events.init();
});

