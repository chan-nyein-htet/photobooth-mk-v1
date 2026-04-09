// static/js/modules/state.js

export const State = {
    // App ရဲ့ Settings ပိုင်း
    config: {
        shotLimit: 4,
        orientation: 'portrait'
    },
    // လက်ရှိ Session ရဲ့ အခြေအနေ (ရိုက်လက်စပုံများ၊ ပိုက်ဆံပေးပြီး/မပြီး)
    session: {
        currentShot: 0,
        orderId: null,
        tempImgData: null,
        isPaid: false
    },
    // ရွေးချယ်ထားတဲ့ Sticker နဲ့ Effect များ
    assets: {
        activeStickerImg: null,
        currentFilterStr: 'none'
    },

    // Session တစ်ခုပြီးတိုင်း data တွေကို အရင်အတိုင်းပြန်ဖြစ်အောင် လုပ်ဖို့
    reset() {
        this.session.currentShot = 0;
        this.session.tempImgData = null;
        this.session.isPaid = false;
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        console.log("♻️ State has been reset to default.");
    }
};

