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
import { Events } from './modules/events.js'; // ✅ Events Module ကို Import လုပ်လိုက်ပြီ

// --- Global Actions (Window Bindings) ---
window.startPaymentFlow = Payment.startFlow.bind(Payment);
window.startCapture     = Capture.start.bind(Capture);
window.keepPhoto        = Capture.keep.bind(Capture);
window.retakePhoto      = Capture.retake.bind(Capture);
window.selectShots      = Setup.setShots.bind(Setup); 
window.toggleOrientation = Setup.toggleOrientation.bind(Setup);                                             

window.startCameraFlow = async () => {                    
    Nav.showScreen('mainApp');
    Setup.initGallery();
    const canvas = document.getElementById('liveCanvas');                                                       
    await Promise.all([Stickers.init(), Filters.init(canvas)]);
    await Camera.start(document.getElementById('video'), canvas);
};

window.resetAndBack = () => {
    State.reset();
    ['previewImg', 'postCaptureBtns', 'finishBtn'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden-element');
    });
    const snapBtn = document.getElementById('snapBtn');
    if(snapBtn) snapBtn.style.display = 'block';
    
    document.getElementById('liveCanvas').classList.remove('hidden-element');
    Nav.showScreen('setup');
    Nav.hideModal('backModal');
};

window.showScreen = Nav.showScreen;
window.showBackModal = () => Nav.showModal('backModal');
window.hideBackModal = () => Nav.hideModal('backModal');

// 🚀 အခုမှ ခလုတ်တွေ အသက်ဝင်မှာပါ
document.addEventListener('DOMContentLoaded', () => {
    console.log("⚙️ Initializing UI Events...");
    Events.init();
});

