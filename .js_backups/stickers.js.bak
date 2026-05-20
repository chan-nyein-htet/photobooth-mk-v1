import { State } from './state.js';
import { UI } from './ui.js';

export const Stickers = {
    canvas: null,

    async init() {
        window.Stickers = this;
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            UI.renderStickers(data.stickers || [], (url) => this.addStickerToCanvas(url));

            document.getElementById('finalPrintBtn').onclick = () => this.finalize();
            document.getElementById('addTextBtn').onclick = () => this.addText();
            document.getElementById('deleteItemBtn').onclick = () => this.deleteSelected();
        } catch (err) { console.error("❌ Init Error:", err); }
    },

    initCanvas(baseImage) {
        if (this.canvas) this.canvas.dispose();

        this.canvas = new fabric.Canvas('stickerCanvas', {
            preserveObjectStacking: true,
            selection: true,
            renderOnAddRemove: true,
            imageSmoothingEnabled: true,
            stateful: false
        });

        // ✅ Resize Box တွေကို အကြီးဆုံးဖြစ်အောင် ဒီမှာ ပြင်ထားတယ်
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#00D1FF',
            cornerStyle: 'circle',
            borderColor: '#00D1FF',
            borderScaleFactor: 3, // Border လိုင်းကို ပိုထူလိုက်တယ်
            
            // Touch interface အတွက် အဓိက အချက်များ
            cornerSize: 45,       // အစက်လေးတွေကို မြင်သာအောင် အကြီးကြီးလုပ်ထားတယ်
            touchCornerSize: 60,  // လက်နဲ့ထိရင် ပိုမိအောင် touch area ကို ထပ်ချဲ့ထားတယ်
            padding: 20,          // Sticker နဲ့ control ကြား နေရာချန်တယ်
            hasRotatingPoint: true,
            rotatingPointOffset: 50
        });

        fabric.Image.fromURL(baseImage, (img) => {
            if (!img) return;
            this.canvas.setDimensions({ width: img.width, height: img.height });
            img.set({ selectable: false, evented: false });
            this.canvas.add(img);
            this.autoScale();
            this.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });

        window.addEventListener('resize', () => this.autoScale());
    },

    autoScale() {
        const wrapper = document.querySelector('#stickerOverlayView .editor-canvas-wrapper');
        const container = document.querySelector('#stickerOverlayView .canvas-container');
        if (wrapper && container && this.canvas) {
            const scale = Math.min(
                (wrapper.clientWidth - 40) / this.canvas.width,
                (wrapper.clientHeight - 40) / this.canvas.height
            );
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'center center';
            
            // ✅ Mouse/Touch coordinate တွေ မလွဲအောင် ပြန်ချိန်တာ
            this.canvas.calcOffset();
        }
    },

    addStickerToCanvas(url) {
        fabric.Image.fromURL(url, (img) => {
            const s = (this.canvas.width * 0.3) / img.width;
            img.set({
                left: this.canvas.width / 2,
                top: this.canvas.height / 2,
                originX: 'center', originY: 'center',
                scaleX: s, scaleY: s
            });
            this.canvas.add(img).setActiveObject(img);
            img.setCoords(); // ✅ Control box နေရာကို update လုပ်တာ
            this.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    addText() {
        const text = new fabric.Textbox('Type Here', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            width: this.canvas.width * 0.6,
            fill: '#ffffff',
            fontSize: 60,
            fontFamily: 'Arial',
            textAlign: 'center',
            originX: 'center', originY: 'center'
        });
        this.canvas.add(text).setActiveObject(text);
        text.setCoords();
        this.canvas.requestRenderAll();
    },

    deleteSelected() {
        const active = this.canvas.getActiveObject();
        if (active) {
            if (active.type === 'activeSelection') {
                active.forEachObject(obj => this.canvas.remove(obj));
            } else {
                this.canvas.remove(active);
            }
            this.canvas.discardActiveObject().requestRenderAll();
        }
    },

    async finalize() {
        const btn = document.getElementById('finalPrintBtn');
        btn.innerText = "PROCESSING...";
        btn.disabled = true;

        this.canvas.discardActiveObject().renderAll();
        const finalData = this.canvas.toDataURL({ format: 'png', multiplier: 2 });

        try {
            const res = await fetch('/api/process_final', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: State.session.orderId,
                    layout_id: State.session.layoutId,
                    final_image: finalData
                })
            });
            if ((await res.json()).status === 'success') {
                window.location.href = '/';
            } else { throw new Error(); }
        } catch (err) {
            alert("Print failed.");
            btn.innerText = "Print Final ✨";
            btn.disabled = false;
        }
    }
};

