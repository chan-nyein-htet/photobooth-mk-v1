export const FaceDet = {
    handInstance: null,
    results: { multiHandLandmarks: [] },

    async init(videoElement) {
        if (this.handInstance) return;

        console.log("✋ Initializing Hand Detection Only...");

        // Hand Detection Setup (✌️ Gesture အတွက်)
        this.handInstance = new Hands({
            locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
        });

        this.handInstance.setOptions({
            maxNumHands: 1,           // လက်တစ်ဖက်ပဲ စစ်မယ် (Performance ပိုကောင်းအောင်)
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        // Result ရရင် သိမ်းထားမယ်
        this.handInstance.onResults(res => { 
            this.results.multiHandLandmarks = res.multiHandLandmarks || []; 
            
            // Camera.js ထဲက callback ဆီကို ပို့ပေးမယ်
            if (this.externalCallback) {
                this.externalCallback(this.results);
            }
        });

        // Camera Utils ကို သုံးပြီး Frame တိုင်းမှာ Hand Engine ဆီ ပို့မယ်
        const camera = new window.Camera(videoElement, {
            onFrame: async () => {
                await this.handInstance.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });

        await camera.start();
        console.log("✅ Hand Detection Engine Ready (Face Disabled)");
    },

    externalCallback: null,
    onResults(callback) {
        this.externalCallback = callback;
    }
};

