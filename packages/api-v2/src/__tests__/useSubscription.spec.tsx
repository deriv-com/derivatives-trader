import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import APIProvider from '../APIProvider';
import AuthProvider from '../AuthProvider';
import useSubscription from '../useSubscription';

jest.mock('../AuthProvider', () => ({
    __esModule: true,
    ...jest.requireActual('../AuthProvider'),

    useAuthContext: () => {
        return {
            subscribe() {
                return {
                    subscribe: async (onData: (response: unknown) => void) => {
                        const delay = (ms: number) => new Promise<never>(resolve => setTimeout(resolve, ms));
                        await delay(500);
                        onData({ balance: { balance: 1000, currency: 'USD' } });
                        await delay(500);
                        onData({ balance: { balance: 1500, currency: 'USD' } });
                        await delay(500);
                        onData({ balance: { balance: 2000, currency: 'USD' } });
                        await delay(500);
                        onData({ balance: { balance: 2500, currency: 'USD' } });
                        return { unsubscribe: () => Promise.resolve() };
                    },
                };
            },
        };
    },
}));

describe('useSubscription', () => {
    test('should subscribe to balance and get the balance updates', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <AuthProvider>{children}</AuthProvider>
            </APIProvider>
        );

        const { result, waitForNextUpdate } = renderHook(() => useSubscription('balance'), { wrapper });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isIdle).toBe(false);
        expect(result.current.error).toBe(undefined);
        expect(result.current.data?.balance).toBe(undefined);

        act(() => {
            result.current.subscribe({ payload: {} });
        });

        await waitForNextUpdate();
        expect(result.current.data?.balance).toStrictEqual({ balance: 1000, currency: 'USD' });
        await waitForNextUpdate();
        expect(result.current.data?.balance).toStrictEqual({ balance: 1500, currency: 'USD' });
        await waitForNextUpdate();
        expect(result.current.data?.balance).toStrictEqual({ balance: 2000, currency: 'USD' });
        await waitForNextUpdate();
        expect(result.current.data?.balance).toStrictEqual({ balance: 2500, currency: 'USD' });
    });
});
