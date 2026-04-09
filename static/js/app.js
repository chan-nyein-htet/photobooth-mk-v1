import { UI } from './modules/ui.js';
import { FaceDet } from './modules/faceDet.js';
import { Nav } from './modules/navigation.js';

// Global States
let shotLimit = 4;
let currentShot = 0;
let tempImgData = null;
let activeStickerImg = null;
let currentFilterStr = 'none';

// Dynamic URL Helper (IP ပြောင်းလည်း အလုပ်လုပ်အောင်)
const getBaseUrl = () => {
    const host = window.location.hostname;
    const port = window.location.port;
    return port ? `http://${host}:${port}` : `http://${host}`;
};

/**
 * Camera Flow Logic
 */
window.startCameraFlow = async () => {
    Nav.showScreen('mainApp');
    setupGallerySlots();
    const video = document.getElementById('video');
    const canvas = document.getElementById('liveCanvas');
    const ctx = canvas.getContext('2d');

    try {
        const res = await fetch('/api/assets');
        const data = await res.json();
        UI.renderEffects(data.effects, canvas, null, (f) => { currentFilterStr = f || 'none'; });
        UI.renderStickers(data.stickers, (img) => { activeStickerImg = img; });

        FaceDet.init(video);
        FaceDet.onResults((res) => {
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            }
            ctx.save();
            ctx.scale(-1, 1); ctx.translate(-canvas.width, 0);
            ctx.filter = currentFilterStr;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';
            if (res.detections?.length > 0 && activeStickerImg) {
                const det = res.detections[0].boundingBox;
                const size = (det.width * canvas.width) * 1.8;
                ctx.drawImage(activeStickerImg, (det.xCenter * canvas.width) - size/2, (det.yCenter * canvas.height) - size/2, size, size);
            }
            ctx.restore();
        });
    } catch (err) { console.error("Flow Error:", err); }
};

/**
 * Capture & UI Logic
 */
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
            const liveCanvas = document.getElementById('liveCanvas');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = liveCanvas.width; tempCanvas.height = liveCanvas.height;
            tempCanvas.getContext('2d').drawImage(liveCanvas, 0, 0);
            tempImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            document.getElementById('previewImg').src = tempImgData;
            liveCanvas.classList.add('hidden-element');
            document.getElementById('previewImg').classList.remove('hidden-element');
            document.getElementById('postCaptureBtns').classList.remove('hidden-element');
        }
    }, 1000);
};

window.keepPhoto = () => {
    const targetImg = document.getElementById(`shot-${currentShot}`);
    if (targetImg) { targetImg.src = tempImgData; targetImg.classList.remove('hidden-element'); }
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

/**
 * Payment Flow (The Redirect Version)
 */
window.startPaymentFlow = async () => {
    Nav.showScreen('paymentScreen');
    const res = await fetch('/api/create_order', { method: 'POST' });
    const data = await res.json();
    
    if (data.order_id) {
        document.getElementById('displayOrderID').innerText = data.order_id;
        
        // 🚀 အဓိကပြင်လိုက်တဲ့အပိုင်း: Scan ဖတ်လိုက်တာနဲ့ Browser က Redirect လုပ်သွားမှာ
        const paymentLink = `${getBaseUrl()}/api/pay/${data.order_id}`;
        document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;
        
        const itv = setInterval(async () => {
            const r = await fetch(`/api/check_payment/${data.order_id}`);
            const d = await r.json();
            if (d.status === 'completed' || d.status === 'paid') { 
                clearInterval(itv); 
                Nav.showScreen('setup'); 
            }
        }, 2000);
    }
};

// UI Support Functions
window.showScreen = Nav.showScreen;
window.showBackModal = () => Nav.showModal('backModal');
window.hideBackModal = () => Nav.hideModal('backModal');
window.selectShots = (n, b) => { shotLimit = n; document.querySelectorAll('.num-btn').forEach(x => x.classList.remove('btn-primary', 'btn-active')); b.classList.add('btn-primary', 'btn-active'); };

function setupGallerySlots() {
    const grid = document.getElementById('photoGrid');
    if(!grid) return; grid.innerHTML = '';
    for (let i = 0; i < shotLimit; i++) {
        const box = document.createElement('div');
        box.className = "gallery-item-box bg-white/5 rounded-2xl overflow-hidden aspect-[3/4]";
        box.innerHTML = `<img id="shot-${i}" class="w-full h-full object-cover hidden-element">`;
        grid.appendChild(box);
    }
}

window.resetAndBack = () => {
    currentShot = 0; activeStickerImg = null; currentFilterStr = 'none';
    document.getElementById('previewImg').classList.add('hidden-element');
    document.getElementById('postCaptureBtns').classList.add('hidden-element');
    document.getElementById('finishBtn').classList.add('hidden-element');
    document.getElementById('snapBtn').style.display = 'block';
    document.getElementById('liveCanvas').classList.remove('hidden-element');
    Nav.showScreen('setup'); Nav.hideModal('backModal');
};

window.toggleOrientation = () => {
    const v = document.getElementById('vfContainer');
    if (!v) return;
    v.classList.toggle('mode-landscape');
    v.classList.toggle('mode-portrait');
};

