export const Nav = {
    showScreen: (screenId) => {
        // 'photoEditorView' ကို စာရင်းထဲ ထည့်ပေးလိုက်တယ်
        ['welcomeScreen', 'collageSelect', 'paymentScreen', 'setup', 'mainApp', 'photoEditorView'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden-element');
                if (id === 'mainApp') el.style.display = 'none';
                // Editor View အတွက်လည်း display style ကို လိုအပ်ရင် reset လုပ်မယ်
                if (id === 'photoEditorView') el.style.display = 'none';
            }
        });

        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden-element');
            // Editor ပွင့်လာရင် screen တစ်ခုလုံး အပြည့် (flex) ပြပေးမယ်
            if (screenId === 'mainApp' || screenId === 'photoEditorView') {
                target.style.display = 'flex';
            }
        }
    },
    showModal: (id) => document.getElementById(id)?.classList.remove('hidden-element'),
    hideModal: (id) => document.getElementById(id)?.classList.add('hidden-element')
};

