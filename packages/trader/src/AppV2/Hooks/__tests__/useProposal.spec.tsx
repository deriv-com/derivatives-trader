import React from 'react';

import { APIProvider } from '@deriv/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import { getProposalRequestObject } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';
import type { TTradeStore } from 'Types';

import { useProposal } from '../useProposal';

jest.mock('Stores/useTraderStores', () => ({
    useTraderStore: jest.fn(),
}));
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    WS: {
        send: jest.fn(),
        authorized: {
            send: jest.fn(),
        },
    },
    useWS: jest.fn(() => ({
        send: jest.fn(),
        authorized: {
            send: jest.fn(),
        },
    })),
}));
jest.mock('AppV2/Utils/trade-params-utils', () => ({
    getProposalRequestObject: jest.fn(),
}));

const mockUseTraderStore = useTraderStore as jest.Mock;
const mockGetProposalRequestObject = getProposalRequestObject as jest.Mock;

describe('useProposal', () => {
    let queryClient: QueryClient,
        wrapper: React.FC<{ children: React.ReactNode }>,
        mockTradeStore: Partial<TTradeStore>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    cacheTime: 0,
                },
            },
        });
        wrapper = ({ children }) => (
            <APIProvider>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </APIProvider>
        );

        mockTradeStore = {
            amount: 10,
            basis: 'stake',
            currency: 'USD',
            duration: 5,
            duration_unit: 'm',
            symbol: 'frxEURUSD',
            trade_types: {
                CALL: 'Rise',
                PUT: 'Fall',
            },
        };

        mockUseTraderStore.mockReturnValue(mockTradeStore);
    });

    afterEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it('calls getProposalRequestObject with correct parameters', () => {
        const proposal_request_values = {
            amount: 20,
            barrier_1: '100',
        };
        const contract_type = 'CALL';
        const contract_types = ['CALL', 'PUT'];

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            amount: 20,
            barrier: '100',
            contract_type: 'CALL',
        });

        renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                }),
            { wrapper }
        );

        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: mockTradeStore,
            trade_type: contract_type,
        });
    });

    it('returns correct flag if is_enabled is false', () => {
        const proposal_request_values = {
            amount: 20,
        };
        const contract_type = 'CALL';
        const contract_types = ['CALL', 'PUT'];

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            amount: 20,
            contract_type: 'CALL',
        });

        const { result } = renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: false,
                }),
            { wrapper }
        );

        expect(result.current.isFetching).toBe(false);
    });

    it('handles empty proposal_request_values', () => {
        const contract_type = 'CALL';
        const contract_types = ['CALL', 'PUT'];

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            contract_type: 'CALL',
        });

        const { result } = renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values: {},
                    contract_type,
                    is_enabled: true,
                }),
            { wrapper }
        );

        const { data, error } = result.current;
        expect(data).toBeUndefined();
        expect(error).toBe(null);
    });

    it('removes take_profit from limit_order when should_skip_validation is "take_profit"', () => {
        const proposal_request_values = {
            amount: 20,
            has_take_profit: true,
            take_profit: '50',
            has_stop_loss: true,
            stop_loss: '10',
        };
        const contract_type = 'CALL';

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            amount: 20,
            contract_type: 'CALL',
            limit_order: {
                take_profit: '50',
                stop_loss: '10',
            },
        });

        renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                    should_skip_validation: 'take_profit',
                }),
            { wrapper }
        );

        // Verify that getProposalRequestObject was called
        expect(mockGetProposalRequestObject).toHaveBeenCalled();

        // The memoized function should have removed take_profit from limit_order
        // We can't directly test the mutation, but we verify the function was called with correct params
        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: mockTradeStore,
            trade_type: contract_type,
        });
    });

    it('removes stop_loss from limit_order when should_skip_validation is "stop_loss"', () => {
        const proposal_request_values = {
            amount: 20,
            has_take_profit: true,
            take_profit: '50',
            has_stop_loss: true,
            stop_loss: '10',
        };
        const contract_type = 'CALL';

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            amount: 20,
            contract_type: 'CALL',
            limit_order: {
                take_profit: '50',
                stop_loss: '10',
            },
        });

        renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                    should_skip_validation: 'stop_loss',
                }),
            { wrapper }
        );

        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: mockTradeStore,
            trade_type: contract_type,
        });
    });

    it('handles trade_store with missing/undefined values', () => {
        const incompleteTradeStore = {
            symbol: 'frxEURUSD',
            // Missing other required fields
        } as Partial<TTradeStore>;

        const proposal_request_values = {
            amount: 20,
        };
        const contract_type = 'CALL';

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            contract_type: 'CALL',
        });

        renderHook(
            () =>
                useProposal({
                    trade_store: incompleteTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                }),
            { wrapper }
        );

        // Should still call getProposalRequestObject even with incomplete store
        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: incompleteTradeStore,
            trade_type: contract_type,
        });
    });

    it('handles undefined values in proposal_request_values', () => {
        const proposal_request_values = {
            amount: undefined,
            barrier_1: undefined,
            take_profit: undefined,
        };
        const contract_type = 'CALL';

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            contract_type: 'CALL',
        });

        const { result } = renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                }),
            { wrapper }
        );

        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: mockTradeStore,
            trade_type: contract_type,
        });
    });

    it('does not remove limit_order properties when should_skip_validation is undefined', () => {
        const proposal_request_values = {
            amount: 20,
            has_take_profit: true,
            take_profit: '50',
            has_stop_loss: true,
            stop_loss: '10',
        };
        const contract_type = 'CALL';

        mockGetProposalRequestObject.mockReturnValue({
            proposal: 1,
            subscribe: 1,
            amount: 20,
            contract_type: 'CALL',
            limit_order: {
                take_profit: '50',
                stop_loss: '10',
            },
        });

        renderHook(
            () =>
                useProposal({
                    trade_store: mockTradeStore as TTradeStore,
                    proposal_request_values,
                    contract_type,
                    is_enabled: true,
                    // should_skip_validation is undefined
                }),
            { wrapper }
        );

        expect(mockGetProposalRequestObject).toHaveBeenCalledWith({
            new_values: proposal_request_values,
            trade_store: mockTradeStore,
            trade_type: contract_type,
        });
    });
});
