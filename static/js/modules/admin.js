export const Admin = {
    clickCount: 0,
    lastClickTime: 0,

    init() {
        console.log("🛠️ Admin Module Initializing...");
        window.Admin = this;
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
                e.preventDefault();
                this.toggle();
            }
        });

        const welcome = document.getElementById('welcomeScreen');
        if (welcome) {
            welcome.style.cursor = 'pointer';
            welcome.addEventListener('click', () => {
                const now = Date.now();
                if (now - this.lastClickTime < 500) {
                    this.clickCount++;
                } else {
                    this.clickCount = 1;
                }

                this.lastClickTime = now;
                console.log(`Click Count: ${this.clickCount}`);

                if (this.clickCount === 5) {
                    this.clickCount = 0;
                    this.toggle();
                }
            });
        }

        const fileInput = document.getElementById('admin_tpl_file');
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        const sizeSelect = document.getElementById('admin_size_type');
        if (sizeSelect) sizeSelect.addEventListener('change', () => this.generateSlotsJson(sizeSelect.value));
    },

    toggle() {
        const p = document.getElementById('admin-panel');
        if (p) {
            p.classList.toggle('hidden');
            if (!p.classList.contains('hidden')) {
                this.loadLayouts();
                console.log("🔓 Admin Panel Opened");
            }
        }
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        const previewImg = document.getElementById('admin_tpl_preview');
        const placeholder = document.getElementById('preview-placeholder');
        const idInput = document.getElementById('admin_layout_id');
        const nameInput = document.getElementById('admin_layout_name');

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            previewImg.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);

        document.getElementById('file-name-display').innerText = file.name;
        const cleanName = file.name.replace('.png', '').replace(/\s+/g, '_');
        idInput.value = cleanName;
        if (!nameInput.value) nameInput.value = file.name.replace('.png', '').replace(/_/g, ' ');

        this.generateSlotsJson(document.getElementById('admin_size_type').value);
    },

    generateSlotsJson(type) {
        let slots = (type === '6x2') ?
            [{"id":1, "x":60, "y":60, "w":480, "h":360}, {"id":2, "x":60, "y":480, "w":480, "h":360}, {"id":3, "x":60, "y":900, "w":480, "h":360}] :
            [{"id":1, "x":50, "y":50, "w":350, "h":250}, {"id":2, "x":450, "y":50, "w":350, "h":250}, {"id":3, "x":50, "y":350, "w":350, "h":250}, {"id":4, "x":450, "y":350, "w":350, "h":250}];

        document.getElementById('admin_slots_json').value = JSON.stringify(slots, null, 2);
    },

    async loadLayouts() {
        const list = document.getElementById('admin_layout_list');
        if (!list) return;
        list.innerHTML = '<div class="col-span-full text-center py-4 text-gray-500 text-xs">Syncing...</div>';

        try {
            // 🎯 FIXED URL with /api prefix
            const res = await fetch('/api/admin/get_layouts');
            const data = await res.json();
            list.innerHTML = '';

            Object.entries(data.active_layouts).forEach(([type, ids]) => {
                ids.forEach(id => {
                    const details = data.layout_details[id] || {};
                    const displayName = (typeof details === 'object' && details.name) ? details.name : id;
                    const imgPath = `/static/templates/${type}/${id}.png?t=${Date.now()}`;

                    const card = document.createElement('div');
                    card.className = "bg-gray-800 rounded-xl overflow-hidden border border-gray-700 group relative";
                    card.innerHTML = `
                        <div class="aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
                            <img src="${imgPath}" class="w-full h-full object-contain transition-transform group-hover:scale-105">
                        </div>
                        <div class="p-2 bg-gray-900 flex justify-between items-center">
                            <div class="truncate pr-2">
                                <p class="text-[10px] font-bold text-white truncate">${displayName}</p>
                                <p class="text-[8px] text-gray-500 uppercase">${type}</p>
                            </div>
                            <button onclick="Admin.deleteLayout('${id}', '${type}')" class="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    `;
                    list.appendChild(card);
                });
            });
        } catch (e) { list.innerHTML = "Error loading."; }
    },

    async deleteLayout(id, type) {
        if (!confirm(`Delete "${id}"?`)) return;
        try {
            // 🎯 FIXED URL with /api prefix
            const res = await fetch('/api/admin/delete_layout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id, type})
            });
            if ((await res.json()).status === 'success') this.loadLayouts();
        } catch (e) { alert("Error deleting."); }
    },

    async save() {
        const btn = document.getElementById('admin_save_btn');
        const l_id = document.getElementById('admin_layout_id').value;
        const l_name = document.getElementById('admin_layout_name').value;
        const fileInput = document.getElementById('admin_tpl_file');
        const file = fileInput.files[0];
        const slots = document.getElementById('admin_slots_json').value;

        if (!l_id || !file) return alert("Please select a file and enter name!");

        btn.disabled = true;
        btn.innerText = "Registering...";

        const fd = new FormData();
        fd.append('layout_id', l_id);
        fd.append('layout_name', l_name);
        fd.append('size_type', document.getElementById('admin_size_type').value);
        fd.append('file', file);
        fd.append('slots', slots);

        try {
            // 🎯 FIXED URL with /api prefix
            const res = await fetch('/api/admin/upload_template', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                alert("✅ Success!");
                this.loadLayouts();
                document.getElementById('admin_layout_name').value = '';
                document.getElementById('admin_layout_id').value = '';
                fileInput.value = '';
                document.getElementById('admin_tpl_preview').classList.add('hidden');
                document.getElementById('preview-placeholder').classList.remove('hidden');
                document.getElementById('file-name-display').innerText = 'No file chosen';
            } else alert("Error: " + data.message);
        } catch (e) { alert("Server Error!"); }
        finally {
            btn.disabled = false;
            btn.innerText = "🚀 Register New Template";
        }
    }
};

