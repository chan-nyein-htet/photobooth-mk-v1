export const Nav = {
    showScreen: (screenId) => {
        ['welcomeScreen', 'collageSelect', 'paymentScreen', 'setup', 'mainApp', 'photoEditorView'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden-element');
                // 🎯 setup ပါ ဖျောက်မယ်
                if (id === 'mainApp' || id === 'photoEditorView' || id === 'setup') {
                    el.style.display = 'none';
                }
            }
        });

        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden-element');
            // 🎯 setup ပါရင် display: flex နဲ့ ပြမယ်
            if (screenId === 'mainApp' || screenId === 'photoEditorView' || screenId === 'setup') {
                target.style.display = 'flex';
            }
        }
    },
    showModal: (id) => document.getElementById(id)?.classList.remove('hidden-element'),
    hideModal: (id) => document.getElementById(id)?.classList.add('hidden-element')
};

