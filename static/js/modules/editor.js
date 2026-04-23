import { State } from './state.js';

export const Editor = {
    canvas: null,

    init() {
        console.log("🎨 Editor Engine Starting...");
        // ၁။ Canvas တည်ဆောက်ခြင်း
        if (!this.canvas) {
            this.canvas = new fabric.Canvas('editorCanvas', {
                width: 450,
                height: 675,
                backgroundColor: '#111',
                preserveObjectStacking: true
            });
        }
        this.bindEvents();
    },

    async loadProject() {
        if (!this.canvas) return;
        this.canvas.clear();

        // ၂။ Template Path ကို Dynamic ဆောက်ခြင်း (Fix: State.layouts Error)
        const l_id = State.session.layoutId;
        const l_type = State.session.paperSize || '6x2';
        const templatePath = `/static/templates/${l_type}/${l_id}.png`;

        console.log(`🖼️ Loading Template: ${templatePath}`);

        fabric.Image.fromURL(templatePath, (img) => {
            img.set({
                selectable: false,
                evented: false,
                scaleX: this.canvas.width / img.width,
                scaleY: this.canvas.height / img.height,
                opacity: 1
            });
            this.canvas.add(img);
            img.bringToFront();
            this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });

        // ၃။ ရိုက်ထားတဲ့ ပုံတွေကို Canvas ပေါ်တင်ခြင်း
        State.session.capturedImages.forEach((dataUrl, index) => {
            fabric.Image.fromURL(dataUrl, (img) => {
                img.set({
                    left: 50 + (index * 30),
                    top: 100 + (index * 30),
                    scaleX: 0.25,
                    scaleY: 0.25,
                    cornerColor: '#FFD700',
                    transparentCorners: false,
                    cornerSize: 10
                });
                this.canvas.add(img);
                img.sendToBack(); 
                this.canvas.renderAll();
            });
        });
    },

    bindEvents() {
        // ၄။ Sticker Items Logic
        document.querySelectorAll('.sticker-item').forEach(item => {
            item.onclick = () => {
                const emoji = item.innerText;
                const textObj = new fabric.Text(emoji, {
                    left: 150,
                    top: 150,
                    fontSize: 60
                });
                this.canvas.add(textObj);
                textObj.bringToFront();
                this.canvas.renderAll();
            };
        });

        // ၅။ Delete Button (Safe Check)
        const deleteBtn = document.getElementById('deleteObjBtn');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    this.canvas.remove(activeObject);
                    this.canvas.requestRenderAll();
                }
            };
        }

        // ၆။ Save/Print Button (Safe Check)
        const saveBtn = document.getElementById('saveEditBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const dataURL = this.canvas.toDataURL({
                    format: 'png',
                    quality: 1.0
                });
                console.log("📸 Final Image Ready!");
                // နေရာမှာ Backend ကို ပို့မယ့် logic ဆက်ရေးလို့ရပြီ
            };
        }
    }
};

