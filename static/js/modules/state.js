export const State = {
    config: {
        shotLimit: 8, // ၈ ပုံ ပြန်ပြောင်းလိုက်ပြီ
        orientation: 'portrait',
        timerValue: 3
    },
    session: {
        currentShot: 0,
        orderId: null,
        tempImgData: null,
        isPaid: false
    },
    assets: {
        activeStickerImg: null,
        currentFilterStr: 'none'
    },
    reset() {
        this.session.currentShot = 0;
        this.session.tempImgData = null;
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        console.log("♻️ State Reset: 8 Shots Mode Activated");
    }
};

