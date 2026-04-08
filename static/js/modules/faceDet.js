export const FaceDet = {
    instance: null,

    // app.js ထဲက FaceDet.init(video) နဲ့ ချိတ်ဖို့
    init: function(videoElement) {
        console.log("Face Detection Initializing...");
        
        this.instance = new FaceDetection({
            locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${f}`
        });

        this.instance.setOptions({
            model: 'short',
            minDetectionConfidence: 0.6
        });

        // Camera Utils နဲ့ ချိတ်ဆက်ပြီး frame တစ်ခုချင်းစီကို detect လုပ်မယ်
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.instance.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        
        camera.start();
        console.log("Face Detection Camera Started.");
    },

    // Results တွေကို ပြန်ယူဖို့ (လိုအပ်ရင် သုံးရန်)
    onResults: function(callback) {
        if (this.instance) {
            this.instance.onResults(callback);
        }
    }
};

