import useRemoteConfig from '../useRemoteConfig';
import { Analytics } from '@deriv-com/analytics';
import { act, renderHook } from '@testing-library/react-hooks';
import useIsGrowthbookIsLoaded from '../useIsGrowthbookLoaded';

jest.mock('@deriv-com/analytics');
jest.mock('../useRemoteConfig');

describe('useIsGrowthbookIsLoaded', () => {
    beforeEach(() => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        jest.spyOn(global, 'setInterval');
        jest.spyOn(global, 'clearInterval');
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        jest.clearAllMocks();
    });

    it('should return initial state correctly', () => {
        (useRemoteConfig as jest.Mock).mockReturnValue({ data: {} });

        const { result } = renderHook(() => useIsGrowthbookIsLoaded());

        expect(result.current.isGBLoaded).toBe(false); // isGBLoaded
    });

    it('should update state when data.marketing_growthbook is true and Analytics instance is available', () => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        (useRemoteConfig as jest.Mock).mockReturnValue({ data: { marketing_growthbook: true } });
        Analytics.getInstances = jest.fn(
            () =>
                ({
                    ab: {
                        GrowthBook: {
                            setRenderer: jest.fn(),
                        },
                    },
                    tracking: {},
                }) as any
        );
        const { result, rerender } = renderHook(() => useIsGrowthbookIsLoaded());

        expect(result.current.isGBLoaded).toBe(false); // isGBLoaded initially false

        act(() => {
            (Analytics.getInstances as jest.Mock).mockReturnValueOnce({ ab: true });

            jest.advanceTimersByTime(11000); // Move timer forward by 500ms
            rerender();
        });

        expect(result.current.isGBLoaded).toBe(true); // isGBLoaded should be true
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should clear interval after 10 seconds if Analytics instance is not available', () => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        (useRemoteConfig as jest.Mock).mockReturnValue({ data: { marketing_growthbook: false } });
        Analytics.getInstances = jest.fn(
            () =>
                ({
                    ab: {
                        GrowthBook: {
                            setRenderer: jest.fn(),
                        },
                    },
                    tracking: {},
                }) as any
        );

        const { result } = renderHook(() => useIsGrowthbookIsLoaded());

        expect(result.current.isGBLoaded).toBe(false); // isGBLoaded initially false

        act(() => {
            jest.advanceTimersByTime(11000); // Move timer forward by 11 seconds
        });

        expect(result.current.isGBLoaded).toBe(false); // isGBLoaded should still be false
    });

    it('should clear interval on unmount', () => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        const { unmount } = renderHook(useIsGrowthbookIsLoaded);
        unmount();

        expect(clearInterval).toHaveBeenCalledTimes(1);
    });
});
