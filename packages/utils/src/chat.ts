/* This utility function is responsible to handle Intercom chat operations. */

const Chat = {
    open: () => {
        if (typeof window !== 'undefined' && window.Intercom) {
            window.Intercom('show');
        }
    },

    clear: () => {
        if (typeof window !== 'undefined' && window.Intercom) {
            window.Intercom('shutdown');
            if (window.DerivInterCom) {
                window.DerivInterCom.initialize({
                    hideLauncher: true,
                    token: null,
                });
            }
        }
    },

    close: () => {
        if (typeof window !== 'undefined' && window.Intercom) {
            window.Intercom('hide');
        }
    },
};

export default Chat;
