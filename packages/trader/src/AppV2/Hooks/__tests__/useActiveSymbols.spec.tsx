import React from 'react';

import { useQuery } from '@deriv/api';
import { CONTRACT_TYPES, TRADE_TYPES } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import TraderProviders from '../../../trader-providers';
import useActiveSymbols from '../useActiveSymbols';

const not_logged_in_active_symbols = [
    { symbol: 'EURUSD', display_name: 'EUR/USD', exchange_is_open: 1 },
    { symbol: 'GBPUSD', display_name: 'GBP/USD', exchange_is_open: 0 },
    { symbol: 'CADAUD', display_name: 'CAD/AUD', exchange_is_open: 0 },
];
const logged_in_active_symbols = [
    { symbol: '1HZ100', display_name: 'Volatility 100', exchange_is_open: 1 },
    { symbol: '1HZ200', display_name: 'Volatility 200', exchange_is_open: 0 },
    { symbol: '1HZ300', display_name: 'Volatility 300', exchange_is_open: 0 },
];

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useQuery: jest.fn(() => ({
        data: {
            active_symbols: not_logged_in_active_symbols,
        },
        error: null,
        isLoading: false,
    })),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    pickDefaultSymbol: jest.fn(() => Promise.resolve('EURUSD')),
}));

jest.mock('@deriv/components', () => ({
    usePrevious: jest.fn(),
}));

jest.mock('AppV2/Hooks/useContractsFor', () => ({
    ...jest.requireActual('AppV2/Hooks/useContractsFor'),
    __esModule: true,
    default: jest.fn(() => ({
        available_contract_types: [{ contract_type: 'accumulator' }, { contract_type: 'rise_fall' }],
        is_fetching_ref: { current: false },
    })),
}));

let mocked_store: ReturnType<typeof mockStore>;
describe('useActiveSymbols', () => {
    const wrapper = ({ children }: { children: JSX.Element }) => {
        return <TraderProviders store={mocked_store}>{children}</TraderProviders>;
    };
    beforeEach(() => {
        mocked_store = {
            ...mockStore({}),
            client: {
                ...mockStore({}).client,
                is_logged_in: false,
            },
            modules: {
                trade: {
                    active_symbols: not_logged_in_active_symbols,
                    has_symbols_for_v2: true,
                    is_turbos: false,
                    is_vanilla: false,
                    contract_type: TRADE_TYPES.RISE_FALL,
                    onChange: jest.fn(),
                    processContractsForV2: jest.fn(),
                    setActiveSymbolsV2: jest.fn(),
                    symbol: '',
                },
            },
        };
        mocked_store.client.is_logged_in = false;
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch active symbols when not logged in', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: { active_symbols: not_logged_in_active_symbols },
            error: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useActiveSymbols(), {
            wrapper,
        });
        await waitFor(() => {
            expect(result.current.activeSymbols).toEqual(not_logged_in_active_symbols);
        });
    });
    it('should fetch active symbols when logged in', async () => {
        mocked_store.client.is_logged_in = true;
        mocked_store.client.loginid = 'CR123456';
        mocked_store.modules.trade.active_symbols = logged_in_active_symbols;
        mocked_store.modules.trade.has_symbols_for_v2 = true;

        (useQuery as jest.Mock).mockReturnValue({
            data: { active_symbols: logged_in_active_symbols },
            error: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useActiveSymbols(), {
            wrapper,
        });
        await waitFor(() => {
            expect(result.current.activeSymbols).toEqual(logged_in_active_symbols);
        });
    });
    it('should return empty array when no response from query', async () => {
        const storeSymbols = [{ symbol: 'fromStore' }];
        mocked_store.modules.trade.active_symbols = storeSymbols;
        mocked_store.modules.trade.has_symbols_for_v2 = true;

        (useQuery as jest.Mock).mockReturnValue({
            data: null, // No response yet
            error: null,
            isLoading: true,
        });

        const { result } = renderHook(() => useActiveSymbols(), {
            wrapper,
        });

        await waitFor(() => {
            // Hook returns data from React Query, not from store
            expect(result.current.activeSymbols).toEqual([]);
            expect(result.current.isLoading).toBe(true);
        });
    });
    it('should call useQuery with correct payload for Vanillas', async () => {
        mocked_store.modules.trade.is_vanilla = true;

        renderHook(() => useActiveSymbols(), { wrapper });

        await waitFor(() => {
            expect(useQuery).toHaveBeenCalledWith('active_symbols', {
                payload: {
                    active_symbols: 'brief',
                    contract_type: [CONTRACT_TYPES.VANILLA.CALL, CONTRACT_TYPES.VANILLA.PUT],
                },
                options: {
                    enabled: true,
                    staleTime: 5 * 60 * 1000,
                    cacheTime: 10 * 60 * 1000,
                    refetchOnWindowFocus: false,
                },
            });
        });
    });

    it('should call useQuery with correct payload for Turbos', async () => {
        mocked_store.modules.trade.is_turbos = true;

        renderHook(() => useActiveSymbols(), { wrapper });

        await waitFor(() => {
            expect(useQuery).toHaveBeenCalledWith('active_symbols', {
                payload: {
                    active_symbols: 'brief',
                    contract_type: [CONTRACT_TYPES.TURBOS.LONG, CONTRACT_TYPES.TURBOS.SHORT],
                },
                options: {
                    enabled: true,
                    staleTime: 5 * 60 * 1000,
                    cacheTime: 10 * 60 * 1000,
                    refetchOnWindowFocus: false,
                },
            });
        });
    });
});
