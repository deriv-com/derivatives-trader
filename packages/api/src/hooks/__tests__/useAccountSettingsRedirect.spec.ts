import { renderHook } from '@testing-library/react-hooks';

import useAccountSettingsRedirect from '../useAccountSettingsRedirect';

// Mock process.env
const originalNodeEnv = process.env.NODE_ENV;

// Mock the dependencies
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getBrandUrl: jest.fn(() => 'https://staging-app.champion.trade/champion'),
}));

describe('useAccountSettingsRedirect', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set NODE_ENV to development for testing
        process.env.NODE_ENV = 'development';

        // Mock window.location.search for URL parameters
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                search: '?account=demo',
            },
        });
    });

    afterAll(() => {
        // Restore the original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('should return hub URL with default redirect_to=home', () => {
        const { result } = renderHook(() => useAccountSettingsRedirect());

        const expectedUrl =
            'https://staging-app.champion.trade/champion/accounts/redirect?action=redirect_to&redirect_to=home&account=demo';

        expect(result.current.redirect_url).toBe(expectedUrl);
        expect(result.current.mobile_redirect_url).toBe(expectedUrl);
    });

    it('should use custom redirect_to value when provided', () => {
        const { result } = renderHook(() => useAccountSettingsRedirect('account-limits'));

        const expectedUrl =
            'https://staging-app.champion.trade/champion/accounts/redirect?action=redirect_to&redirect_to=account-limits&account=demo';

        expect(result.current.redirect_url).toBe(expectedUrl);
        expect(result.current.mobile_redirect_url).toBe(expectedUrl);
    });

    it('should use different account ID from URL parameters', () => {
        // Set a different account ID in the URL
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                search: '?account=BTC',
            },
        });

        const { result } = renderHook(() => useAccountSettingsRedirect());

        const expectedUrl =
            'https://staging-app.champion.trade/champion/accounts/redirect?action=redirect_to&redirect_to=home&account=BTC';

        expect(result.current.redirect_url).toBe(expectedUrl);
        expect(result.current.mobile_redirect_url).toBe(expectedUrl);
    });

    it('should handle production environment', () => {
        process.env.NODE_ENV = 'production';

        const { result } = renderHook(() => useAccountSettingsRedirect());

        // Since getBrandUrl is mocked to return staging URL, the result will be the same
        const expectedUrl =
            'https://staging-app.champion.trade/champion/accounts/redirect?action=redirect_to&redirect_to=home&account=demo';

        expect(result.current.redirect_url).toBe(expectedUrl);
        expect(result.current.mobile_redirect_url).toBe(expectedUrl);
    });
});
