import React from 'react';

import { cloneObject, getContractCategoriesConfig, getContractTypesConfig, WS } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import TraderProviders from '../../../trader-providers';
import useContractsFor from '../useContractsFor';
import { invalidateDTraderCache } from '../useDtraderQuery';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getContractCategoriesConfig: jest.fn(),
    getContractTypesConfig: jest.fn(),
    cloneObject: jest.fn(),
    WS: {
        send: jest.fn(),
        authorized: {
            send: jest.fn(),
        },
    },
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
        invalidateDTraderCache(['contracts_for', mocked_store.client.loginid ?? '', mocked_store.modules.trade.symbol]);
    });

    it('should fetch and set contract types for the company successfully', async () => {
        WS.authorized.send.mockResolvedValue({
            contracts_for: {
                available: [
                    { contract_type: 'type_1', underlying_symbol: 'EURUSD' },
                    { contract_type: 'type_2', underlying_symbol: 'GBPUSD' },
                ],
                hit_count: 2,
            },
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
        WS.authorized.send.mockResolvedValue({
            error: { message: 'Some error' },
        });

        const { result } = renderHook(() => useContractsFor(), { wrapper });

        await waitFor(() => {
            expect(result.current.contract_types_list).toEqual([]);
            expect(mocked_store.modules.trade.setContractTypesListV2).not.toHaveBeenCalled();
        });
    });

    it('should not set unsupported contract types', async () => {
        WS.authorized.send.mockResolvedValue({
            contracts_for: {
                available: [{ contract_type: 'unsupported_type', underlying_symbol: 'UNSUPPORTED' }],
                hit_count: 1,
            },
        });

        const { result } = renderHook(() => useContractsFor(), { wrapper });

        await waitFor(() => {
            expect(result.current.contract_types_list).toEqual([]);
            expect(mocked_store.modules.trade.setContractTypesListV2).not.toHaveBeenCalled();
        });
    });

    describe('Symbol validation fix', () => {
        it('should prevent API calls when symbol is undefined', async () => {
            // Set up store with undefined symbol
            mocked_store.modules.trade.symbol = undefined;

            const { result } = renderHook(() => useContractsFor(), { wrapper });

            // Wait a bit to ensure no API call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify that no API call was made
            expect(WS.authorized.send).not.toHaveBeenCalled();
            expect(result.current.contract_types_list).toEqual([]);
        });

        it('should prevent API calls when symbol is null', async () => {
            // Set up store with null symbol
            mocked_store.modules.trade.symbol = null;

            const { result } = renderHook(() => useContractsFor(), { wrapper });

            // Wait a bit to ensure no API call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify that no API call was made
            expect(WS.authorized.send).not.toHaveBeenCalled();
            expect(result.current.contract_types_list).toEqual([]);
        });

        it('should prevent API calls when symbol is empty string', async () => {
            // Set up store with empty string symbol
            mocked_store.modules.trade.symbol = '';

            const { result } = renderHook(() => useContractsFor(), { wrapper });

            // Wait a bit to ensure no API call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify that no API call was made
            expect(WS.authorized.send).not.toHaveBeenCalled();
            expect(result.current.contract_types_list).toEqual([]);
        });

        it('should allow API calls when symbol is present regardless of loginid status', async () => {
            // Set up store with undefined loginid but valid symbol
            mocked_store.client.loginid = undefined;
            mocked_store.modules.trade.symbol = 'R_100';

            WS.authorized.send.mockResolvedValue({
                contracts_for: {
                    available: [{ contract_type: 'type_1', underlying_symbol: 'R_100' }],
                    hit_count: 1,
                },
            });

            const { result } = renderHook(() => useContractsFor(), { wrapper });

            await waitFor(() => {
                // Verify that API call was made with correct symbol
                expect(WS.authorized.send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        contracts_for: 'R_100',
                    })
                );
            });
        });

        it('should prevent API calls when no symbol is provided', async () => {
            // Set up store with no symbol
            mocked_store.modules.trade.symbol = '';

            const { result } = renderHook(() => useContractsFor(), { wrapper });

            // Wait a bit to ensure no API call is made
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify that no API call was made due to switching
            expect(WS.authorized.send).not.toHaveBeenCalled();
            expect(result.current.contract_types_list).toEqual([]);
        });
    });
});
