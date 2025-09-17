module.exports = {
    // Auth and account related functions
    getAccountsFromLocalStorage: jest.fn(() => ({})),
    getAccountListWithAuthToken: jest.fn(() => []),
    getActiveLoginIDFromLocalStorage: jest.fn(() => 'mock_login_id'),

    // Local storage functions
    safeParse: jest.fn(value => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }),
    getLocalStorage: jest.fn(key => localStorage.getItem(key)),

    // Token functions
    getToken: jest.fn(() => 'mock_token'),

    // Feature flag functions
    getFeatureFlag: jest.fn(() => false),

    // URL and link functions
    isExternalLink: jest.fn(url => {
        if (!url) return false;
        return /^https?:\/\//.test(url) || url.startsWith('//');
    }),

    // Chat functions
    Chat: {
        open: jest.fn(),
        close: jest.fn(),
        clear: jest.fn(),
    },

    // Moment functions (from moment export)
    toMoment: jest.fn(date => date),
};
