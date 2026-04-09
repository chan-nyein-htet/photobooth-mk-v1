export const FaceDet = {
    instance: null,

    async init(videoElement) {
        if (this.instance) return;

        this.instance = new FaceDetection({
            locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${f}`
        });

        this.instance.setOptions({
            model: 'short',
            minDetectionConfidence: 0.6
        });

        // MediaPipe ရဲ့ library ကို ညွှန်းဖို့ window.Camera လို့ ပြောင်းထားတယ်
        const camera = new window.Camera(videoElement, {
            onFrame: async () => {
                await this.instance.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });

        await camera.start();
        console.log("✅ Face Detection Engine Ready");
    },

    onResults(callback) {
        if (this.instance) {
            this.instance.onResults(callback);
        }
    }
};

