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
import { Admin } from './modules/admin.js';

window.Admin = Admin;
window.selectCollage = (id, size, shots) => Collage.select(id, size, shots); // size ပါ ထည့်ထားပေးတယ်
window.startPaymentFlow = () => Payment.startFlow();
window.startCapture = () => Capture.start();
window.keepPhoto = () => Capture.keep();
window.retakePhoto = () => Capture.resetUI();
window.selectShots = (n, btn) => Setup.setShots(n, btn);
window.toggleOrientation = () => Setup.toggleOrientation();

// 🎯 Camera Flow ကို အသေအချာ ပြန်ညှိထားတယ်
window.startCameraFlow = async () => {
    console.log("📸 Starting Camera Flow...");
    
    // 1. Screen ပြောင်းမယ်
    Nav.showScreen('mainApp');

    // 2. Setup ထဲက initGallery ကို ခေါ်မယ် (Check လုပ်ပြီးမှ ခေါ်တာ ပိုစိတ်ချရတယ်)
    if (Setup && typeof Setup.initGallery === 'function') {
        Setup.initGallery();
    } else {
        console.warn("⚠️ Setup module is not fully loaded, retrying initGallery...");
        setTimeout(() => Setup.initGallery?.(), 100);
    }

    const canvas = document.getElementById('liveCanvas');
    const video = document.getElementById('video');

    // 3. Modules အကုန်လုံးကို Parallel load လုပ်မယ်
    try {
        await Promise.all([Stickers.init(), Filters.init(canvas)]);
        if (video && canvas) {
            await Camera.start(video, canvas);
            console.log("✅ Camera & Filters Active");
        }
    } catch (err) {
        console.error("❌ Camera Flow Error:", err);
    }
};

window.resetAndBack = () => {
    State.reset();
    location.reload();
};

window.showScreen = (id) => Nav.showScreen(id);
window.showBackModal = () => Nav.showModal('backModal');
window.hideBackModal = () => Nav.hideModal('backModal');

document.addEventListener('DOMContentLoaded', () => {
    console.log("⚙️ System booting...");
    Collage.init();
    Events.init();
    Admin.init();
    console.log("✅ All Modules Synchronized");
});

