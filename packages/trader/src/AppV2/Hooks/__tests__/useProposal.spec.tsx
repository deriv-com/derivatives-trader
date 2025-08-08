import React from 'react';

import { useQuery } from '@deriv/api';
import { mockStore } from '@deriv/stores';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import TraderProviders from '../../../trader-providers';
import useProposal from '../useProposal';

// Mock the API package
jest.mock('@deriv/api', () => ({
    useQuery: jest.fn(() => ({
        data: {
            proposal: {
                ask_price: 10.5,
                barrier_spot_distance: '+5.37',
                date_expiry: 1640995200,
            },
        },
        error: null,
        isLoading: false,
    })),
}));

const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

// Mock the trade params utils
jest.mock('AppV2/Utils/trade-params-utils', () => ({
    getProposalRequestObject: jest.fn(() => ({
        proposal: 1,
        amount: '10',
        basis: 'stake',
        contract_type: 'CALL',
        currency: 'USD',
        duration: 5,
        duration_unit: 'm',
        symbol: 'R_50',
        underlying_symbol: 'R_50',
    })),
}));

describe('useProposal', () => {
    let mocked_store: ReturnType<typeof mockStore>;

    const wrapper = ({ children }: { children: JSX.Element }) => (
        <TraderProviders store={mocked_store}>{children}</TraderProviders>
    );

    beforeEach(() => {
        mocked_store = mockStore({
            modules: {
                trade: {
                    ...mockStore({}).modules.trade,
                    trade_types: { CALL: 'Higher' },
                    symbol: 'R_50',
                    amount: 10,
                    duration: 5,
                    duration_unit: 'm',
                    contract_type: 'CALL',
                    currency: 'USD',
                },
            },
        });

        jest.clearAllMocks();
    });

    it('should return proposal data successfully', async () => {
        const { result } = renderHook(() => useProposal(), { wrapper });

        await waitFor(() => {
            expect(result.current.data).toEqual({
                proposal: {
                    ask_price: 10.5,
                    barrier_spot_distance: '+5.37',
                    date_expiry: 1640995200,
                },
            });
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(result.current.proposal_req).toBeDefined();
        });
    });

    it('should handle custom options correctly', async () => {
        const options = {
            enabled: false,
            new_values: { amount: '20' },
            trade_type: 'PUT',
        };

        const { result } = renderHook(() => useProposal(options), { wrapper });

        await waitFor(() => {
            expect(result.current.proposal_req).toBeDefined();
        });
    });

    it('should use default values when no options provided', async () => {
        const { result } = renderHook(() => useProposal(), { wrapper });

        await waitFor(() => {
            expect(result.current.data).toBeDefined();
            expect(result.current.proposal_req).toBeDefined();
        });
    });

    it('should handle error states', async () => {
        // @ts-expect-error need to come up with a way to mock the return type of useQuery
        mockedUseQuery.mockReturnValue({
            data: undefined,
            error: {
                echo_req: {},
                error: {
                    code: 'ValidationError',
                    message: 'Invalid amount',
                    details: { field: 'amount' },
                },
                msg_type: 'proposal',
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useProposal(), { wrapper });

        await waitFor(() => {
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toEqual({
                echo_req: {},
                error: {
                    code: 'ValidationError',
                    message: 'Invalid amount',
                    details: { field: 'amount' },
                },
                msg_type: 'proposal',
            });
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('should handle loading states', async () => {
        // @ts-expect-error need to come up with a way to mock the return type of useQuery
        mockedUseQuery.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: true,
        });

        const { result } = renderHook(() => useProposal(), { wrapper });

        await waitFor(() => {
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(true);
        });
    });
});
