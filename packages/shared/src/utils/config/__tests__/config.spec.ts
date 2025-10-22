import { getAccountType, getSocketURL, isProduction } from '../config';

describe('getAccountType', () => {
    let originalLocation: Location, originalLocalStorage: Storage;

    beforeEach(() => {
        // Save original location and localStorage
        originalLocation = window.location;
        originalLocalStorage = window.localStorage;

        // Mock localStorage
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = value;
                },
                removeItem: (key: string) => {
                    delete store[key];
                },
                clear: () => {
                    store = {};
                },
            };
        })();

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });

        // Mock window.history.replaceState
        window.history.replaceState = jest.fn();
    });

    afterEach(() => {
        // Restore original location and localStorage
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
        jest.clearAllMocks();
    });

    it('should return "demo" from URL parameter and store it in localStorage', () => {
        // Mock URL with account_type=demo
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            search: '?account_type=demo',
            href: 'https://staging-dtrader.deriv.com?account_type=demo',
        } as Location;

        const result = getAccountType();

        expect(result).toBe('demo');
        expect(window.localStorage.getItem('account_type')).toBe('demo');
    });

    it('should return "real" from URL parameter and store it in localStorage', () => {
        // Mock URL with account_type=real
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            search: '?account_type=real',
            href: 'https://staging-dtrader.deriv.com?account_type=real',
        } as Location;

        const result = getAccountType();

        expect(result).toBe('real');
        expect(window.localStorage.getItem('account_type')).toBe('real');
    });

    it('should return value from localStorage when URL parameter is missing', () => {
        // Set localStorage value
        window.localStorage.setItem('account_type', 'real');

        // Mock URL without account_type parameter
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            search: '',
            href: 'https://staging-dtrader.deriv.com',
        } as Location;

        const result = getAccountType();

        expect(result).toBe('real');
    });

    it('should return "demo" as default when no URL parameter or localStorage value exists', () => {
        // Mock URL without account_type parameter
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            search: '',
            href: 'https://staging-dtrader.deriv.com',
        } as Location;

        const result = getAccountType();

        expect(result).toBe('demo');
    });

    it('should return "demo" as default when URL parameter is invalid', () => {
        // Mock URL with invalid account_type parameter
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            search: '?account_type=invalid',
            href: 'https://staging-dtrader.deriv.com?account_type=invalid',
        } as Location;

        const result = getAccountType();

        expect(result).toBe('demo');
    });
});

describe('getSocketURL', () => {
    let originalLocation: Location, originalLocalStorage: Storage;

    beforeEach(() => {
        // Save original location and localStorage
        originalLocation = window.location;
        originalLocalStorage = window.localStorage;

        // Mock localStorage
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = value;
                },
                removeItem: (key: string) => {
                    delete store[key];
                },
                clear: () => {
                    store = {};
                },
            };
        })();

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });

        // Mock window.history.replaceState
        window.history.replaceState = jest.fn();
    });

    afterEach(() => {
        // Restore original location and localStorage
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
        jest.clearAllMocks();
    });

    it('should return qa194.deriv.dev for staging with demo account', () => {
        // Mock staging-dtrader.deriv.com with account_type=demo
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
            search: '?account_type=demo',
            href: 'https://staging-dtrader.deriv.com?account_type=demo',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('qa194.deriv.dev');
    });

    it('should return qa197.deriv.dev for staging with real account', () => {
        // Mock staging-dtrader.deriv.com with account_type=real
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
            search: '?account_type=real',
            href: 'https://staging-dtrader.deriv.com?account_type=real',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('qa197.deriv.dev');
    });

    it('should return qa194.deriv.dev for staging with missing account_type (default to demo)', () => {
        // Mock staging-dtrader.deriv.com without account_type parameter
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
            search: '',
            href: 'https://staging-dtrader.deriv.com',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('qa194.deriv.dev');
    });

    it('should return qa194.deriv.dev for staging with invalid account_type (default to demo)', () => {
        // Mock staging-dtrader.deriv.com with invalid account_type parameter
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
            search: '?account_type=invalid',
            href: 'https://staging-dtrader.deriv.com?account_type=invalid',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('qa194.deriv.dev');
    });

    it('should return demov2.derivws.com for production with demo account', () => {
        // Mock dtrader.deriv.com with account_type=demo
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'dtrader.deriv.com',
            search: '?account_type=demo',
            href: 'https://dtrader.deriv.com?account_type=demo',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('demov2.derivws.com');
    });

    it('should return realv2.derivws.com for production with real account', () => {
        // Mock dtrader.deriv.com with account_type=real
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'dtrader.deriv.com',
            search: '?account_type=real',
            href: 'https://dtrader.deriv.com?account_type=real',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('realv2.derivws.com');
    });

    it('should return localStorage value when config.server_url is set', () => {
        // Set custom server URL in localStorage
        window.localStorage.setItem('config.server_url', 'custom.server.com');

        // Mock staging-dtrader.deriv.com
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
            search: '?account_type=real',
            href: 'https://staging-dtrader.deriv.com?account_type=real',
        } as Location;

        const result = getSocketURL();

        expect(result).toBe('custom.server.com');
    });
});

describe('isProduction', () => {
    let originalLocation: Location;

    beforeEach(() => {
        // Save original location
        originalLocation = window.location;
    });

    afterEach(() => {
        // Restore original location
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
    });

    it('should return true for production hostname dtrader.deriv.com', () => {
        // Mock production hostname
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'dtrader.deriv.com',
        } as Location;

        const result = isProduction();

        expect(result).toBe(true);
    });

    it('should return true for production hostname with www prefix', () => {
        // Mock production hostname with www
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'www.dtrader.deriv.com',
        } as Location;

        const result = isProduction();

        expect(result).toBe(true);
    });

    it('should return false for staging hostname staging-dtrader.deriv.com', () => {
        // Mock staging hostname
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'staging-dtrader.deriv.com',
        } as Location;

        const result = isProduction();

        expect(result).toBe(false);
    });

    it('should return false for staging hostname with www prefix', () => {
        // Mock staging hostname with www
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'www.staging-dtrader.deriv.com',
        } as Location;

        const result = isProduction();

        expect(result).toBe(false);
    });

    it('should return false for localhost', () => {
        // Mock localhost
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'localhost',
        } as Location;

        const result = isProduction();

        expect(result).toBe(false);
    });

    it('should return false for unsupported domain', () => {
        // Mock unsupported domain
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            hostname: 'example.com',
        } as Location;

        const result = isProduction();

        expect(result).toBe(false);
    });
});
