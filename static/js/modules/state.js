export const State = {
    config: {
        shotLimit: 8,
        orientation: 'portrait',
        timerValue: 3
    },
    session: {
        currentShot: 0,
        orderId: null,
        tempImgData: null,
        capturedImages: [], // ✅ ကြိုတင် သတ်မှတ်ထားမယ်
        isPaid: false,
        layoutId: 'A+'
    },
    assets: {
        activeStickerImg: null,
        currentFilterStr: 'none'
    },
    reset() {
        this.session.currentShot = 0;
        this.session.tempImgData = null;
        this.session.capturedImages = []; // ✅ Reset လုပ်ရင် ပုံတွေပါ ရှင်းမယ်
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        console.log("♻️ State Reset: 8 Shots Mode Activated");
    }
};

