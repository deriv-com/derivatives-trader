import React from 'react';
import { useWS } from '@deriv/shared';
import { act, renderHook } from '@testing-library/react-hooks';
import APIProvider from '../APIProvider';
import useSubscription from '../useSubscription';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    useWS: jest.fn(),
}));

const mockUseWS = useWS as jest.MockedFunction<typeof useWS>;

describe('useSubscription', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should subscribe to proposal_open_contract and get the contract updates', async () => {
        mockUseWS.mockReturnValue({
            subscribe: jest.fn(() => {
                return {
                    subscribe: async (onData: (response: unknown) => void, onError: (response: unknown) => void) => {
                        const delay = (ms: number) => new Promise<never>(resolve => setTimeout(resolve, ms));
                        await delay(100);
                        onData({ proposal_open_contract: { contract_id: '123', status: 'open' } });
                        await delay(100);
                        onData({ proposal_open_contract: { contract_id: '123', status: 'sold', profit: 10 } });
                        await delay(100);
                        onError({ error: { code: 'ContractNotFound', message: 'Contract not found' } });
                        return { unsubscribe: () => Promise.resolve() };
                    },
                };
            }),
        });

        const wrapper = ({ children }: { children: JSX.Element }) => <APIProvider>{children}</APIProvider>;

        const { result, waitForNextUpdate } = renderHook(() => useSubscription('proposal_open_contract'), { wrapper });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isIdle).toBe(false);
        expect(result.current.error).toBe(undefined);
        expect(result.current.data?.proposal_open_contract).toBe(undefined);

        act(() => {
            result.current.subscribe({ payload: { contract_id: 123 } });
        });

        await waitForNextUpdate();
        expect(result.current.data?.proposal_open_contract).toStrictEqual({ contract_id: '123', status: 'open' });
        await waitForNextUpdate();
        expect(result.current.data?.proposal_open_contract).toStrictEqual({
            contract_id: '123',
            status: 'sold',
            profit: 10,
        });
        await waitForNextUpdate();
        expect(result.current.error).toStrictEqual({ code: 'ContractNotFound', message: 'Contract not found' });
    });
});
