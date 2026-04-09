import { State } from './state.js';
import { FaceDet } from './faceDet.js';

export const Camera = {
    async start(video, canvas) {
        const ctx = canvas.getContext('2d');
        FaceDet.init(video);
        FaceDet.onResults((res) => {
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.filter = State.assets.currentFilterStr || 'none';
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';
            if (res.detections?.length > 0 && State.assets.activeStickerImg) {
                const det = res.detections[0].boundingBox;
                const size = (det.width * canvas.width) * 1.8;
                ctx.drawImage(
                    State.assets.activeStickerImg,
                    (det.xCenter * canvas.width) - size/2,
                    (det.yCenter * canvas.height) - size/2,
                    size, size
                );
            }
            ctx.restore();
        });
    },
    capture(liveCanvas) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = liveCanvas.width;
        tempCanvas.height = liveCanvas.height;
        tempCanvas.getContext('2d').drawImage(liveCanvas, 0, 0);
        return tempCanvas.toDataURL('image/jpeg', 0.95);
    }
};

