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
        capturedImages: [],
        isPaid: false,
        layoutId: null,
        paperSize: '6x2',
        totalShots: 3
    },
    assets: {
        activeStickerImg: null,
        currentFilterStr: 'none'
    },
    reset() {
        this.session.currentShot = 0;
        this.session.orderId = null;
        this.session.tempImgData = null;
        this.session.capturedImages = [];
        this.session.layoutId = null;
        this.session.paperSize = '6x2';
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        console.log("♻️ State Reset: Cleared for next session");
    }
};
// 🎯 ဒီထဲက window.selectCollage ကို ဖြုတ်လိုက်ပြီ (Collage.js မှာပဲ ထားမယ်)

