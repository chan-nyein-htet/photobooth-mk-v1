import { State } from './state.js';

export const Editor = {
    canvas: null,
    selectedSlot: null,
    selectedGalleryImg: null,

    async init() {
        console.log("🚀 Editor Engine Starting...");
        // Fabric.js filter setup
        if (typeof fabric !== 'undefined') {
            fabric.filterBackend = fabric.initFilterBackend();
        }
        await Editor.loadProject();
    },

    async loadProject() {
        const { layoutId, paperSize, capturedImages } = State.session;

        // Safety loop: Data မရောက်မချင်း 0.1s စောင့်မယ်
        if (!State.session.layout_details) {
            console.warn("⏳ Waiting for layout data...");
            setTimeout(() => Editor.loadProject(), 100);
            return;
        }

        const backendSlots = State.session.layout_details.slots || [];
        const templatePath = `/static/templates/${paperSize}/${layoutId}.png`;

        return new Promise((resolve) => {
            fabric.Image.fromURL(templatePath, (img) => {
                if (!img) {
                    console.error("❌ Template not found at:", templatePath);
                    return resolve();
                }

                // Canvas တည်ဆောက်ခြင်း (သို့မဟုတ် clear လုပ်ခြင်း)
                if (!Editor.canvas) {
                    Editor.canvas = new fabric.Canvas('editorCanvas', {
                        width: img.width,
                        height: img.height,
                        backgroundColor: null,
                        preserveObjectStacking: true,
                        selection: false
                    });
                } else {
                    Editor.canvas.clear();
                    Editor.canvas.setDimensions({ width: img.width, height: img.height });
                }

                // UI Scale ညှိမယ် (Wrapper ထဲ ကွက်တိဖြစ်အောင်)
                const wrapper = document.querySelector('.editor-canvas-wrapper');
                if (wrapper) {
                    const scale = Math.min((wrapper.clientWidth - 20) / img.width, (wrapper.clientHeight - 20) / img.height);
                    const container = document.querySelector('.canvas-container');
                    if (container) container.style.transform = `scale(${scale})`;
                }

                // Template ကို အပေါ်ဆုံးကနေ အုပ်မယ် (Overlay)
                Editor.canvas.setOverlayImage(img, () => {
                    Editor.canvas.requestRenderAll();
                }, { crossOrigin: 'anonymous' });

                // Slots ထဲ ပုံတွေ စီထည့်မယ်
                Editor.syncToSlots(backendSlots, capturedImages);

                Editor.bindEvents();
                Editor.bindCanvasSelection();
                resolve();
            }, { crossOrigin: 'anonymous' });
        });
    },

    syncToSlots(slots, images) {
        // Slot အရေအတွက်အတိုင်း ပုံတွေကို ယူမယ်
        const imagesForSlots = (images || []).slice(0, slots.length);
        imagesForSlots.forEach((url, i) => Editor.addImageToSlot(url, slots[i]));

        // ပိုတဲ့ပုံတွေကို ဘေးက Gallery Tray မှာ ပြမယ်
        const imagesForGallery = (images || []).slice(slots.length);
        Editor.renderGalleryTray(imagesForGallery);
    },

    addImageToSlot(dataUrl, slot) {
        fabric.Image.fromURL(dataUrl, (img) => {
            // ပုံကို Slot ထဲ ကွက်တိဖြစ်အောင် Scale တွက်မယ် (Aspect Ratio မပျက်စေရ)
            const scale = Math.max(slot.w / img.width, slot.h / img.height);
            
            img.set({
                left: slot.x + (slot.w / 2),
                top: slot.y + (slot.h / 2),
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                isPhoto: true,
                selectable: true,
                hasControls: true, // User က ပုံကို ရွှေ့ချင်ရွှေ့လို့ရအောင်
                hasBorders: false,
                customSrc: dataUrl,
                slotData: slot
            });

            // Masking (အစိမ်းကွက်မထွက်အောင် ပုံကို Slot ဘောင်အတွင်းပဲ ဖြတ်မယ်)
            img.clipPath = new fabric.Rect({
                left: slot.x,
                top: slot.y,
                width: slot.w,
                height: slot.h,
                absolutePositioned: true
            });

            Editor.canvas.add(img);
            img.sendToBack(); // Template အောက်ကို ပို့မယ်
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    renderGalleryTray(images) {
        const tray = document.getElementById('galleryList');
        if (!tray) return;
        tray.innerHTML = '';
        images.forEach(url => {
            const div = document.createElement('div');
            div.className = "gallery-item w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent cursor-pointer";
            div.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
            div.onclick = () => Editor.handleGalleryAction(url, div);
            tray.appendChild(div);
        });
    },

    handleGalleryAction(url, el) {
        if (Editor.selectedSlot) {
            Editor.swapPhoto(Editor.selectedSlot, url);
        } else {
            Editor.selectedGalleryImg = url;
            document.querySelectorAll('.gallery-item').forEach(d => d.classList.remove('border-primary'));
            el.classList.add('border-primary');
        }
    },

    swapPhoto(slotObj, newUrl) {
        const slot = slotObj.slotData;
        fabric.Image.fromURL(newUrl, (newImg) => {
            const scale = Math.max(slot.w / newImg.width, slot.h / newImg.height);
            newImg.set({
                left: slotObj.left,
                top: slotObj.top,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                isPhoto: true,
                hasControls: true,
                hasBorders: false,
                clipPath: slotObj.clipPath,
                customSrc: newUrl,
                slotData: slot
            });
            Editor.canvas.remove(slotObj);
            Editor.canvas.add(newImg);
            newImg.sendToBack();
            Editor.canvas.discardActiveObject();
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    bindCanvasSelection() {
        Editor.canvas.on('selection:created', (e) => {
            const obj = e.selected[0];
            if (obj && obj.isPhoto) {
                Editor.selectedSlot = obj;
                // Gallery က ပုံကို အရင် select ထားရင် swap လုပ်မယ်
                if (Editor.selectedGalleryImg) {
                    Editor.swapPhoto(obj, Editor.selectedGalleryImg);
                    Editor.selectedGalleryImg = null;
                }
            }
        });
        
        Editor.canvas.on('selection:cleared', () => {
            Editor.selectedSlot = null;
        });
    },

    bindEvents() {
        const btn = document.getElementById('saveEditBtn');
        if (btn) {
            btn.onclick = () => Editor.finalize();
        }
    },

    async finalize() {
        console.log("🛠️ Generating Final Print...");
        const btn = document.getElementById('saveEditBtn');
        if (btn) {
            btn.innerText = "GENERATING PDF...";
            btn.disabled = true;
        }

        // Canvas ကို Base64 ပြောင်းမယ် (Quality အမြင့်ဆုံး)
        const finalData = Editor.canvas.toDataURL({
            format: 'jpeg',
            quality: 1.0,
            multiplier: 1 // Original size အတိုင်းပဲ ထွက်မယ်
        });

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
            const result = await res.json();
            if (result.status === 'success') {
                console.log("✅ PDF Generated:", result.pdf_url);
                // Print modal သို့မဟုတ် success screen ပြရန် logic
                alert("Printing Started!");
            }
        } catch (err) {
            console.error("❌ Finalize Error:", err);
        } finally {
            if (btn) {
                btn.innerText = "PRINT";
                btn.disabled = false;
            }
        }
    }
};

