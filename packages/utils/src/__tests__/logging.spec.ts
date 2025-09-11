import { logError } from '../logging';
import { TrackJS } from 'trackjs';

jest.mock('trackjs', () => ({
    TrackJS: {
        isInstalled: jest.fn(),
        track: jest.fn(),
        console: {
            log: jest.fn(),
        },
    },
}));

describe('logError', () => {
    const mockTrackJS = TrackJS as jest.Mocked<typeof TrackJS>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTrackJS.isInstalled.mockReturnValue(true);
    });

    it('should track error and log context when TrackJS is installed', () => {
        const testMessage = 'test error message';
        const testData = { foo: 'bar', userId: '123' };

        logError(testMessage, testData);

        expect(mockTrackJS.isInstalled).toHaveBeenCalled();
        expect(mockTrackJS.track).toHaveBeenCalledWith(new Error(testMessage));
        expect(mockTrackJS.console.log).toHaveBeenCalledWith('logError called:', {
            message: testMessage,
            ...testData,
        });
    });

    it('should handle empty data object', () => {
        const testMessage = 'test error without data';

        logError(testMessage);

        expect(mockTrackJS.track).toHaveBeenCalledWith(new Error(testMessage));
        expect(mockTrackJS.console.log).toHaveBeenCalledWith('logError called:', {
            message: testMessage,
        });
    });

    it('should not track when TrackJS is not installed', () => {
        mockTrackJS.isInstalled.mockReturnValue(false);

        logError('test message');

        expect(mockTrackJS.isInstalled).toHaveBeenCalled();
        expect(mockTrackJS.track).not.toHaveBeenCalled();
        expect(mockTrackJS.console.log).not.toHaveBeenCalled();
    });

    it('should handle TrackJS errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockTrackJS.track.mockImplementation(() => {
            throw new Error('TrackJS error');
        });

        expect(() => logError('test message')).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to log error with TrackJS:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should handle TrackJS.console.log errors gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        (mockTrackJS.console.log as jest.Mock).mockImplementation(() => {
            throw new Error('TrackJS console error');
        });

        expect(() => logError('test message')).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to log error with TrackJS:', expect.any(Error));

        consoleSpy.mockRestore();
    });
});
