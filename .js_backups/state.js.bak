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
        totalShots: 3,
        layout_details: null // 🎯 Editor အတွက် Slot Data သိမ်းမယ့်နေရာ
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
        this.session.isPaid = false;
        this.session.layoutId = null;
        this.session.paperSize = '6x2';
        this.session.totalShots = 3;
        this.session.layout_details = null;
        this.assets.activeStickerImg = null;
        this.assets.currentFilterStr = 'none';
        console.log("♻️ State Reset: Cleared for next session");
    }
};

