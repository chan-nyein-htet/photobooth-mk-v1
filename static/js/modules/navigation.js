export const Nav = {
    showScreen: (screenId) => {
        ['welcomeScreen', 'paymentScreen', 'setup', 'mainApp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden-element');
                if (id === 'mainApp') el.style.display = 'none';
            }
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden-element');
            if (screenId === 'mainApp') target.style.display = 'flex';
        }
    },
    showModal: (id) => document.getElementById(id)?.classList.remove('hidden-element'),
    hideModal: (id) => document.getElementById(id)?.classList.add('hidden-element')
};

