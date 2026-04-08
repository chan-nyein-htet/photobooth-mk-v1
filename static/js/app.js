import { UI } from './modules/ui.js';
import { FaceDet } from './modules/faceDet.js';

let shotLimit = 4;
let currentShot = 0;
let tempImgData = null;
let activeStickerImg = null;
let pollingInterval = null;                           

window.showScreen = (screenId) => {
    ['welcomeScreen', 'paymentScreen', 'setup', 'mainApp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden-element');
            if (id === 'mainApp') el.style.display = 'none';
        }
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden-element');
        if (screenId === 'mainApp') target.style.display = 'flex';                                              
    }
};                                                     

window.toggleOrientation = () => {
    const container = document.getElementById('vfContainer');
    const text = document.getElementById('orientationText');                                                    
    if (container.classList.contains('mode-portrait')) {                                                            
        container.classList.replace('mode-portrait', 'mode-landscape');                                             
        text.innerText = "LANDSCAPE";
    } else {
        container.classList.replace('mode-landscape', 'mode-portrait');                                             
        text.innerText = "PORTRAIT";
    }
};

window.startPaymentFlow = async () => {
    window.showScreen('paymentScreen');
    try {
        const res = await fetch('/api/create_order', { method: 'POST' });                                           
        const data = await res.json();
        if (data.order_id) {                                      
            document.getElementById('displayOrderID').innerText = data.order_id;                                        
            startPaymentPolling(data.order_id);
        }                                                 
    } catch (err) { console.error(err); }
};                                                    

function startPaymentPolling(orderId) {                   
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
        try {                                                     
            const res = await fetch(`/api/check_payment/${orderId}`);                                                   
            const data = await res.json();
            if (data.status === 'paid') {
                clearInterval(pollingInterval);
                window.showScreen('setup');                              
            }
        } catch (err) { console.error(err); }
    }, 2000);
}

window.selectShots = (num, btn) => {
    shotLimit = num;
    document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('btn-primary', 'btn-active'));
    btn.classList.add('btn-primary', 'btn-active');
};

window.startCameraFlow = async () => {
    window.showScreen('mainApp');
    setupGallerySlots();
    const video = document.getElementById('video');
    const canvas = document.getElementById('liveCanvas');
    const previewImg = document.getElementById('previewImg');                                                   
    const res = await fetch('/api/assets');
    const data = await res.json();                        
    UI.renderEffects(data.effects, canvas, previewImg);
    UI.renderStickers(data.stickers, (imgObj) => { activeStickerImg = imgObj; });                               
    FaceDet.init(video);
    FaceDet.onResults((res) => {
        const ctx = canvas.getContext('2d');
        if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        }
        ctx.save();
        ctx.scale(-1, 1); ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (res.detections.length > 0 && activeStickerImg) {
            const det = res.detections[0].boundingBox;            
            const size = (det.width * canvas.width) * 1.8;                                                              
            ctx.drawImage(activeStickerImg, (det.xCenter * canvas.width) - size/2, (det.yCenter * canvas.height) - size/2, size, size);
        }                                                     
        ctx.restore();
    });
};

window.startCapture = () => {
    if (currentShot >= shotLimit) return;                 
    document.getElementById('snapBtn').style.display = 'none';                                                  
    let count = 3;
    const el = document.getElementById('countdown');
    el.style.display = 'flex'; el.innerText = count;
    const timer = setInterval(() => {
        count--;
        if (count > 0) el.innerText = count;
        else if (count === 0) el.innerText = "📸";
        else {
            clearInterval(timer); el.style.display = 'none';
            const canvas = document.getElementById('liveCanvas');                                                       
            tempImgData = canvas.toDataURL('image/jpeg', 0.95);                                                         
            const preview = document.getElementById('previewImg');
            preview.src = tempImgData;
            canvas.classList.add('hidden-element');               
            preview.classList.remove('hidden-element');
            document.getElementById('postCaptureBtns').classList.remove('hidden-element');                          
        }
    }, 1000);
};

window.keepPhoto = () => {
    const targetImg = document.getElementById(`shot-${currentShot}`);
    if (targetImg) { 
        targetImg.src = tempImgData; 
        targetImg.classList.remove('hidden-element'); 
    }
    currentShot++;
    
    document.getElementById('snapBtn').style.display = 'block';
    document.getElementById('liveCanvas').classList.remove('hidden-element');
    document.getElementById('previewImg').classList.add('hidden-element');
    document.getElementById('postCaptureBtns').classList.add('hidden-element');

    if (currentShot >= shotLimit) {
        document.getElementById('finishBtn').classList.remove('hidden-element');
        document.getElementById('snapBtn').style.display = 'none';
    }
};

window.retakePhoto = () => {
    document.getElementById('snapBtn').style.display = 'block';
    document.getElementById('liveCanvas').classList.remove('hidden-element');
    document.getElementById('previewImg').classList.add('hidden-element');
    document.getElementById('postCaptureBtns').classList.add('hidden-element');
};

function setupGallerySlots() {
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '';
    for (let i = 0; i < shotLimit; i++) {
        const box = document.createElement('div');
        box.className = "gallery-item-box bg-white/5 rounded-2xl overflow-hidden border border-white/10 aspect-[3/4]";
        box.innerHTML = `<img id="shot-${i}" class="w-full h-full object-cover hidden-element">`;
        grid.appendChild(box);
    }
}

window.showBackModal = () => document.getElementById('backModal').classList.remove('hidden-element');
window.hideBackModal = () => document.getElementById('backModal').classList.add('hidden-element');
window.resetAndBack = () => window.location.reload();

// ✅ Disable Desktop Zooming
window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) e.preventDefault();
});

