export const State = {
    config: {
        shotLimit: 8, // 👈 ၈ ပုံအဖြစ် ပြောင်းလိုက်ပြီ
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
        this.session.isPaid = false;
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        this.config.timerValue = 3;
        console.log("♻️ State has been reset for 8 shots.");
    }
};
