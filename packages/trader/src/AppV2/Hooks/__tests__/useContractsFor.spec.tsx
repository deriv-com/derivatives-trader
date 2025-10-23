import React from 'react';

import { useQuery } from '@deriv/api';
import { cloneObject, getContractCategoriesConfig, getContractTypesConfig } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import TraderProviders from '../../../trader-providers';
import useContractsFor from '../useContractsFor';

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useQuery: jest.fn(() => ({
        data: null,
        error: null,
        isLoading: false,
    })),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getContractCategoriesConfig: jest.fn(),
    getContractTypesConfig: jest.fn(),
    cloneObject: jest.fn(),
}));

describe('useContractsFor', () => {
    let mocked_store: ReturnType<typeof mockStore>;

    const wrapper = ({ children }: { children: JSX.Element }) => (
        <TraderProviders store={mocked_store}>{children}</TraderProviders>
    );

    beforeEach(() => {
        mocked_store = {
            ...mockStore({}),
            client: {
                ...mockStore({}).client,
                landing_company_shortcode: 'maltainvest',
                loginid: 'CR1234',
            },
            modules: {
                trade: {
                    setContractTypesListV2: jest.fn(),
                    onChange: jest.fn(),
                    symbol: 'R_50',
                },
            },
        };

        (getContractCategoriesConfig as jest.Mock).mockReturnValue({
            category_1: { categories: ['type_1'] },
            category_2: { categories: ['type_2'] },
        });

        (getContractTypesConfig as jest.Mock).mockReturnValue({
            type_1: { trade_types: ['type_1'], title: 'Type 1', barrier_count: 0 },
            type_2: { trade_types: ['type_2'], title: 'Type 2', barrier_count: 1 },
        });

        (cloneObject as jest.Mock).mockImplementation(obj => JSON.parse(JSON.stringify(obj)));

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and set contract types for the company successfully', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: {
                contracts_for: {
                    available: [
                        { contract_type: 'type_1', underlying_symbol: 'EURUSD', default_stake: 10 },
                        { contract_type: 'type_2', underlying_symbol: 'GBPUSD', default_stake: 20 },
                    ],
                    hit_count: 2,
                },
            },
            error: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useContractsFor(), { wrapper });

        await waitFor(() => {
            expect(result.current.contract_types_list).toEqual({
                category_1: { categories: [{ value: 'type_1', text: 'Type 1' }] },
                category_2: { categories: [{ value: 'type_2', text: 'Type 2' }] },
            });
            expect(mocked_store.modules.trade.setContractTypesListV2).toHaveBeenCalledWith({
                category_1: { categories: [{ value: 'type_1', text: 'Type 1' }] },
                category_2: { categories: [{ value: 'type_2', text: 'Type 2' }] },
            });
        });
    });

    it('should handle API errors gracefully', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: null,
            error: { message: 'Some error' },
            isLoading: false,
        });

        const { result } = renderHook(() => useContractsFor(), { wrapper });

        await waitFor(() => {
            expect(result.current.contract_types_list).toEqual([]);
            expect(mocked_store.modules.trade.setContractTypesListV2).not.toHaveBeenCalled();
        });
    });

    it('should not set unsupported contract types', async () => {
        (useQuery as jest.Mock).mockReturnValue({
            data: {
                contracts_for: {
                    available: [{ contract_type: 'unsupported_type', underlying_symbol: 'UNSUPPORTED' }],
                    hit_count: 1,
                },
            },
            error: null,
            isLoading: false,
        });

        const { result } = renderHook(() => useContractsFor(), { wrapper });

        await waitFor(() => {
            expect(result.current.trade_types).toEqual([]);
        });
    });

    describe('Symbol validation fix', () => {
        it('should prevent query when symbol is undefined', async () => {
            mocked_store.modules.trade.symbol = undefined;

            renderHook(() => useContractsFor(), { wrapper });

            await waitFor(() => {
                expect(useQuery).toHaveBeenCalledWith(
                    'contracts_for',
                    expect.objectContaining({
                        options: expect.objectContaining({
                            enabled: false,
                        }),
                    })
                );
            });
        });

        it('should prevent query when symbol is null', async () => {
            mocked_store.modules.trade.symbol = null;

            renderHook(() => useContractsFor(), { wrapper });

            await waitFor(() => {
                expect(useQuery).toHaveBeenCalledWith(
                    'contracts_for',
                    expect.objectContaining({
                        options: expect.objectContaining({
                            enabled: false,
                        }),
                    })
                );
            });
        });

        it('should prevent query when symbol is empty string', async () => {
            mocked_store.modules.trade.symbol = '';

            renderHook(() => useContractsFor(), { wrapper });

            await waitFor(() => {
                expect(useQuery).toHaveBeenCalledWith(
                    'contracts_for',
                    expect.objectContaining({
                        options: expect.objectContaining({
                            enabled: false,
                        }),
                    })
                );
            });
        });

        it('should allow query when symbol is present', async () => {
            mocked_store.modules.trade.symbol = 'R_100';

            renderHook(() => useContractsFor(), { wrapper });

            await waitFor(() => {
                expect(useQuery).toHaveBeenCalledWith('contracts_for', {
                    payload: {
                        contracts_for: 'R_100',
                    },
                    options: {
                        enabled: true,
                        refetchOnWindowFocus: false,
                    },
                });
            });
        });
    });
});
