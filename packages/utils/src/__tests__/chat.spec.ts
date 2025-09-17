import Chat from '../chat';

// Mock window.Intercom and window.DerivInterCom before importing
const mockIntercom = jest.fn();
const mockDerivInterCom = {
    initialize: jest.fn(),
};

describe('Chat utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup window mocks
        Object.defineProperty(window, 'Intercom', {
            value: mockIntercom,
            writable: true,
            configurable: true,
        });

        Object.defineProperty(window, 'DerivInterCom', {
            value: mockDerivInterCom,
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('open', () => {
        it('should call window.Intercom("show") when Intercom is available', () => {
            Chat.open();

            expect(mockIntercom).toHaveBeenCalledWith('show');
        });

        it('should not call window.Intercom when window.Intercom is undefined', () => {
            delete window.Intercom;

            Chat.open();

            expect(mockIntercom).not.toHaveBeenCalled();
        });

        it('should not throw error when window is undefined', () => {
            const originalWindow = global.window;
            // @ts-expect-error - Testing edge case
            delete global.window;

            expect(() => Chat.open()).not.toThrow();

            // Restore window
            global.window = originalWindow;
        });
    });

    describe('clear', () => {
        it('should call Intercom shutdown and DerivInterCom initialize when both are available', () => {
            Chat.clear();

            expect(mockIntercom).toHaveBeenCalledWith('shutdown');
            expect(mockDerivInterCom.initialize).toHaveBeenCalledWith({
                hideLauncher: true,
                token: null,
            });
        });

        it('should call Intercom shutdown but not DerivInterCom when DerivInterCom is undefined', () => {
            // @ts-expect-error - Testing runtime scenario
            delete window.DerivInterCom;

            Chat.clear();

            expect(mockIntercom).toHaveBeenCalledWith('shutdown');
            expect(mockDerivInterCom.initialize).not.toHaveBeenCalled();
        });

        it('should not call any methods when window.Intercom is undefined', () => {
            delete window.Intercom;

            Chat.clear();

            expect(mockIntercom).not.toHaveBeenCalled();
            expect(mockDerivInterCom.initialize).not.toHaveBeenCalled();
        });

        it('should not throw error when window is undefined', () => {
            const originalWindow = global.window;
            // @ts-expect-error - Testing edge case
            delete global.window;

            expect(() => Chat.clear()).not.toThrow();

            // Restore window
            global.window = originalWindow;
        });
    });

    describe('close', () => {
        it('should call window.Intercom("hide") when Intercom is available', () => {
            Chat.close();

            expect(mockIntercom).toHaveBeenCalledWith('hide');
        });

        it('should not call window.Intercom when window.Intercom is undefined', () => {
            delete window.Intercom;

            Chat.close();

            expect(mockIntercom).not.toHaveBeenCalled();
        });

        it('should not throw error when window is undefined', () => {
            const originalWindow = global.window;
            // @ts-expect-error - Testing edge case
            delete global.window;

            expect(() => Chat.close()).not.toThrow();

            // Restore window
            global.window = originalWindow;
        });
    });

    describe('Integration tests', () => {
        it('should handle complete chat lifecycle correctly', () => {
            // Test opening chat
            Chat.open();
            expect(mockIntercom).toHaveBeenCalledWith('show');

            // Test closing chat
            Chat.close();
            expect(mockIntercom).toHaveBeenCalledWith('hide');

            // Test clearing chat
            Chat.clear();
            expect(mockIntercom).toHaveBeenCalledWith('shutdown');
            expect(mockDerivInterCom.initialize).toHaveBeenCalledWith({
                hideLauncher: true,
                token: null,
            });

            expect(mockIntercom).toHaveBeenCalledTimes(3);
        });

        it('should handle missing Intercom gracefully across all methods', () => {
            delete window.Intercom;

            Chat.open();
            Chat.close();
            Chat.clear();

            expect(mockIntercom).not.toHaveBeenCalled();
            expect(mockDerivInterCom.initialize).not.toHaveBeenCalled();
        });
    });

    describe('Error handling and edge cases', () => {
        it('should handle undefined window object gracefully', () => {
            const originalWindow = global.window;
            // @ts-expect-error - Testing edge case
            delete global.window;

            // These should not throw errors even when window is undefined
            expect(() => {
                Chat.open();
                Chat.close();
                Chat.clear();
            }).not.toThrow();

            // Restore window
            global.window = originalWindow;

            // Verify no methods were called since window was undefined
            expect(mockIntercom).not.toHaveBeenCalled();
            expect(mockDerivInterCom.initialize).not.toHaveBeenCalled();
        });

        it('should handle concurrent method calls correctly', () => {
            // Since methods are now synchronous, we can call them directly
            Chat.open();
            Chat.close();
            Chat.clear();

            expect(mockIntercom).toHaveBeenCalledWith('show');
            expect(mockIntercom).toHaveBeenCalledWith('hide');
            expect(mockIntercom).toHaveBeenCalledWith('shutdown');
            expect(mockDerivInterCom.initialize).toHaveBeenCalledWith({
                hideLauncher: true,
                token: null,
            });
        });
    });
});
