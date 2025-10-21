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
});
