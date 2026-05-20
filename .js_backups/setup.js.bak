import { Nav } from './navigation.js';
import { State } from './state.js'; // State ကို လိုအပ်ရင် သုံးဖို့ import လုပ်ထားပါ

export const Setup = {
    // Tutorial မှာ ပြမယ့် အဆင့်ဆင့်
    steps: [
        { icon: 'fa-hand', title: 'RAISE PALM', desc: 'Add +5s to timer' },
        { icon: 'fa-fist-raised', title: 'MAKE FIST', desc: 'Reduce -5s from timer' },
        { icon: 'fa-hand-peace', title: 'SHOW PEACE', desc: 'Snap photo instantly' },
        { icon: 'fa-thumbs-up', title: 'THUMBS UP', desc: 'Keep & Save this photo' },
        { icon: 'fa-thumbs-down', title: 'THUMBS DOWN', desc: 'Retake a new shot' },
        { icon: 'fa-camera-retro', title: 'SMILE!', desc: 'Session starting now...' }
    ],

    async startTutorial() {
        const icon = document.getElementById('mainIcon');
        const title = document.getElementById('setupTitle');
        const desc = document.getElementById('setupDesc');
        const bar = document.getElementById('setupBar');

        if (!icon || !title) return;

        // အရောင် Animation တွေကို Activate လုပ်မယ်
        icon.classList.add('fast-color-cycle');
        title.classList.add('fast-color-cycle');
        bar.classList.add('active-cycle');

        // Tutorial အဆင့်တစ်ခုချင်းစီကို Loop ပတ်မယ်
        for (const step of this.steps) {
            // Animation Reset လုပ်ဖို့ Class အဟောင်းတွေ ခေတ္တဖြုတ်မယ်
            title.classList.remove('step-entry');
            bar.style.transition = 'none';
            bar.style.width = '0%';

            // Browser က Change ကို သိအောင် ခဏစောင့်မယ်
            await new Promise(r => setTimeout(r, 50));

            // Content အသစ်တွေ ထည့်မယ်
            icon.className = `fa-solid ${step.icon} text-[200px] fast-color-cycle gesture-icon-anim`;
            title.innerText = step.title;
            desc.innerText = step.desc;

            // စာသား ဝင်လာတဲ့ Animation ထည့်မယ်
            title.classList.add('step-entry');

            // Progress Bar ကို ၂ စက္ကန့်ခွဲ (2500ms) အပြည့်ပြေးခိုင်းမယ်
            // (Step တွေများလာလို့ 3000ms ကနေ နည်းနည်းလျှော့ထားတာ)
            bar.style.transition = 'width 2500ms linear';
            bar.style.width = '100%';

            // Step တစ်ခုအတွက် စောင့်ဆိုင်းချိန်
            await new Promise(r => setTimeout(r, 2500));
        }

        // Tutorial ပြီးရင် Camera Flow စတင်မယ်
        this.finish();
    },

    // ဘေးဘားက Gallery အကွက်လေးတွေ ဆောက်ထားပေးတာ
    initGallery() {
        const grid = document.getElementById('sidebarPhotoGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const box = document.createElement('div');
            box.className = "flex-none bg-white/5 rounded-2xl border border-white/10 w-20 h-28 overflow-hidden";
            box.innerHTML = `<img id="shot-${i}" class="w-full h-full object-cover hidden-element">`;
            grid.appendChild(box);
        }
    },

    finish() {
        console.log("🎬 Setup Complete. Starting Camera Flow...");
        if (window.startCameraFlow) window.startCameraFlow();
    }
};

