import React from 'react';

import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModulesProvider from 'Stores/Providers/modules-providers';

import TraderProviders from '../../../../../trader-providers';
import BarrierInput from '../barrier-input';

describe('BarrierInput', () => {
    const setInitialBarrierValue = jest.fn();
    const onChange = jest.fn();
    const onClose = jest.fn();

    // Mock localStorage
    const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset localStorage mock to return null by default
        localStorageMock.getItem.mockReturnValue(null);
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        localStorageMock.clear.mockClear();

        // Reset the default trade store
        default_trade_store.modules.trade.barrier_1 = '+10';
        default_trade_store.modules.trade.validation_errors.barrier_1 = [];

        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
    });
    const default_trade_store = {
        modules: {
            trade: {
                barrier_1: '+10',
                onChange,
                validation_errors: { barrier_1: [] },
                duration: 10,
                proposal_info: { CALL: { id: '123', message: 'test_message', has_error: true, spot: 12345 } },
                symbol: '1HZ100V', // Synthetic symbol to show barrier chips
                active_symbols: [
                    {
                        symbol: '1HZ100V',
                        display_name: 'Volatility 100 (1s) Index',
                        market: 'synthetic_index',
                        symbol_type: 'synthetic_index',
                        exchange_is_open: 1,
                    },
                    {
                        symbol: 'EURUSD',
                        display_name: 'EUR/USD',
                        market: 'forex',
                        symbol_type: 'forex',
                        exchange_is_open: 1,
                    },
                ],
                // Mock implementation of getSymbolBarrierSupport method
                getSymbolBarrierSupport: jest.fn((symbol: string) => {
                    if (!symbol) return 'absolute';

                    // Return 'relative' for synthetic symbols, 'absolute' for forex
                    if (symbol === '1HZ100V' || symbol.includes('HZ')) return 'relative';
                    if (symbol === 'EURUSD' || symbol.includes('USD')) return 'absolute';

                    // Default to absolute for unknown symbols
                    return 'absolute';
                }),
            },
        },
    };

    const mockBarrierInput = (mocked_store: TCoreStores) => {
        render(
            <TraderProviders store={mocked_store}>
                <ModulesProvider store={mocked_store}>
                    <BarrierInput isDays={false} setInitialBarrierValue={setInitialBarrierValue} onClose={onClose} />
                </ModulesProvider>
            </TraderProviders>
        );
    };

    it('renders BarrierInput component correctly', () => {
        mockBarrierInput(mockStore(default_trade_store));
        expect(screen.getByText('Above spot')).toBeInTheDocument();
        expect(screen.getByText('Below spot')).toBeInTheDocument();
        expect(screen.getByText('Fixed barrier')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Distance to spot')).toBeInTheDocument();
        expect(screen.getByText('Current spot')).toBeInTheDocument();
    });

    it('closes ActionSheet on pressing primary action when on first page', async () => {
        mockBarrierInput(mockStore(default_trade_store));
        await userEvent.click(screen.getByRole('textbox'));
        await userEvent.click(screen.getByText(/Save/));
        await waitFor(() => {
            expect(onClose).toBeCalledWith(true);
        });
    });

    it('calls setInitialBarrierValue and onChange on component mount', () => {
        mockBarrierInput(mockStore(default_trade_store));
        expect(setInitialBarrierValue).toHaveBeenCalledWith('+10');
    });

    it('handles chip selection correctly', async () => {
        mockBarrierInput(mockStore(default_trade_store));
        const aboveSpotChip = screen.getByText('Above spot');
        const belowSpotChip = screen.getByText('Below spot');
        const fixedPriceChip = screen.getByText('Fixed barrier');

        // With staging pattern, onChange should not be called during chip selection
        await userEvent.click(belowSpotChip);
        expect(onChange).not.toHaveBeenCalled();

        await userEvent.click(fixedPriceChip);
        expect(onChange).not.toHaveBeenCalled();

        await userEvent.click(aboveSpotChip);
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenCalledWith({ target: { name: 'barrier_1', value: '+10' } });
    });

    it('handles input change correctly', async () => {
        mockBarrierInput(mockStore(default_trade_store));
        const input = screen.getByPlaceholderText('Distance to spot');

        // With staging pattern, onChange should not be called during input change
        fireEvent.change(input, { target: { value: '20' } });
        expect(onChange).not.toHaveBeenCalled();

        const belowSpotChip = screen.getByText('Below spot');
        await userEvent.click(belowSpotChip);
        fireEvent.change(input, { target: { value: '15' } });
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenCalledWith({ target: { name: 'barrier_1', value: '-15' } });
    });

    it('sets initial barrier value and option correctly for a positive barrier', () => {
        mockBarrierInput(mockStore(default_trade_store));
        expect(setInitialBarrierValue).toHaveBeenCalledWith('+10');
        expect(screen.getAllByRole('button')[0]).toHaveAttribute('data-state', 'selected');
    });

    it('sets initial barrier value and option correctly for a negative barrier', () => {
        default_trade_store.modules.trade.barrier_1 = '-10';
        mockBarrierInput(mockStore(default_trade_store));
        expect(setInitialBarrierValue).toHaveBeenCalledWith('-10');
        expect(screen.getAllByRole('button')[1]).toHaveAttribute('data-state', 'selected');
    });

    it('sets initial barrier value and option correctly for a fixed price barrier', () => {
        default_trade_store.modules.trade.barrier_1 = '30';
        mockBarrierInput(mockStore(default_trade_store));
        expect(setInitialBarrierValue).toHaveBeenCalledWith('30');
        expect(screen.getAllByRole('button')[2]).toHaveAttribute('data-state', 'selected');
    });

    it('shows error when a validation error comes', () => {
        default_trade_store.modules.trade.validation_errors.barrier_1 = ['Something went wrong'] as never;
        mockBarrierInput(mockStore(default_trade_store));
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows error when a validation error comes for fixed price as well', () => {
        default_trade_store.modules.trade.validation_errors.barrier_1 = ['Something went wrong'] as never;
        default_trade_store.modules.trade.barrier_1 = '10';
        mockBarrierInput(mockStore(default_trade_store));
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles chip selection correctly for Above spot when initial barrier is negative', async () => {
        default_trade_store.modules.trade.barrier_1 = '-10';
        mockBarrierInput(mockStore(default_trade_store));

        const aboveSpotChip = screen.getByText('Above spot');
        await userEvent.click(aboveSpotChip);

        // With staging pattern, onChange should not be called during chip selection
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenCalledWith({ target: { name: 'barrier_1', value: '+10' } });
    });

    it('handles chip selection correctly for Below spot when initial barrier is positive', async () => {
        default_trade_store.modules.trade.barrier_1 = '+.6';
        mockBarrierInput(mockStore(default_trade_store));

        const belowSpotChip = screen.getByText('Below spot');
        await userEvent.click(belowSpotChip);

        // With staging pattern, onChange should not be called during chip selection
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenCalledWith({ target: { name: 'barrier_1', value: '-0.6' } });
    });

    it('handles chip selection correctly for Fixed barrier', async () => {
        default_trade_store.modules.trade.barrier_1 = '+.6';
        mockBarrierInput(mockStore(default_trade_store));

        const fixedPriceChip = screen.getByText('Fixed barrier');
        await userEvent.click(fixedPriceChip);

        // With staging pattern, onChange should not be called during chip selection
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenCalledWith({ target: { name: 'barrier_1', value: '' } });
    });

    it('handles chip selection correctly for Above spot when initial barrier is fixed price', async () => {
        default_trade_store.modules.trade.barrier_1 = '.6';
        mockBarrierInput(mockStore(default_trade_store));

        const aboveSpotChip = screen.getByText('Above spot');
        await userEvent.click(aboveSpotChip);

        // With staging pattern, onChange should not be called during chip selection
        expect(onChange).not.toHaveBeenCalled();

        // onChange should only be called when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(onChange).toHaveBeenLastCalledWith({ target: { name: 'barrier_1', value: '+' } });
    });

    it('restores barrier type from localStorage when available', () => {
        // Mock localStorage to return stored barrier type for Fixed barrier
        localStorageMock.getItem.mockImplementation(key => {
            if (key === 'deriv_barrier_type_selection') return '2'; // Fixed barrier
            if (key === 'deriv_fixed_barrier_value') return '999';
            return null;
        });

        default_trade_store.modules.trade.barrier_1 = '999';
        mockBarrierInput(mockStore(default_trade_store));

        expect(setInitialBarrierValue).toHaveBeenCalledWith('999');
        expect(screen.getAllByRole('button')[2]).toHaveAttribute('data-state', 'selected');
    });

    it('stores barrier type in localStorage when chip is selected and saved', async () => {
        mockBarrierInput(mockStore(default_trade_store));

        const fixedBarrierChip = screen.getByText('Fixed barrier');
        await userEvent.click(fixedBarrierChip);

        // With staging pattern, localStorage should not be updated during chip selection
        expect(localStorageMock.setItem).not.toHaveBeenCalledWith('deriv_barrier_type_selection', '2');

        // localStorage should only be updated when Save is clicked
        await userEvent.click(screen.getByText(/Save/));
        expect(localStorageMock.setItem).toHaveBeenCalledWith('deriv_barrier_type_selection', '2');
    });
});
