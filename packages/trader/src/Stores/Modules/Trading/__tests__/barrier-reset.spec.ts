import { configure } from 'mobx';
import { mockStore } from '@deriv/stores';
import TradeStore from '../trade-store';
import { TRootStore } from 'Types';

configure({ safeDescriptors: false });

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock shared utilities
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    pickDefaultSymbol: jest.fn(() => Promise.resolve('1HZ100V')),
    isMarketClosed: jest.fn(() => false),
    WS: {
        authorized: {
            activeSymbols: () => Promise.resolve({ active_symbols: [] }),
        },
        contractsFor: () => Promise.resolve({ contracts_for: { available: [], non_available: [] } }),
        storage: {
            contractsFor: () => Promise.resolve({ contracts_for: { available: [], non_available: [] } }),
        },
        subscribeProposal: jest.fn(),
        forgetAll: jest.fn(),
        wait: jest.fn(() => Promise.resolve({})),
    },
}));

// Mock process helpers
jest.mock('../Helpers/process', () => ({
    processContractsForApi: jest.fn(() => Promise.resolve()),
    processPurchase: jest.fn(() => Promise.resolve()),
    processProposal: jest.fn(() => Promise.resolve()),
    processTradeParams: jest.fn(() => Promise.resolve()),
}));

describe('TradeStore - Barrier Reset on Symbol Change', () => {
    let trade_store: TradeStore, mockRootStore: TRootStore;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);

        mockRootStore = mockStore({
            ui: {
                is_mobile: true,
                advanced_expiry_type: 'duration',
                simple_duration_unit: 'm',
                advanced_duration_unit: 'm',
                is_advanced_duration: false,
            },
            client: {
                currency: 'USD',
                default_currency: 'USD',
                is_logged_in: false,
                is_logging_in: false,
            },
            common: {
                current_language: 'en',
                showError: jest.fn(),
                setSelectedContractType: jest.fn(),
            },
            portfolio: {
                setContractType: jest.fn(),
                barriers: [],
            },
            notifications: {
                removeTradeNotifications: jest.fn(),
            },
            contract_trade: {
                clearAccumulatorBarriersData: jest.fn(),
            },
            active_symbols: {
                setActiveSymbols: jest.fn(),
            },
        }) as unknown as TRootStore;

        trade_store = new TradeStore({ root_store: mockRootStore });

        // Mock active symbols with forex and synthetic symbols
        trade_store.active_symbols = [
            {
                symbol: 'EURUSD',
                display_name: 'EUR/USD',
                market: 'forex',
                symbol_type: 'forex',
                exchange_is_open: 1,
            },
            {
                symbol: '1HZ100V',
                display_name: 'Volatility 100 (1s) Index',
                market: 'synthetic_index',
                symbol_type: 'synthetic_index',
                exchange_is_open: 1,
            },
        ] as any;

        // Set up initial state using actions to avoid MobX warnings
        trade_store.updateStore({ symbol: '1HZ100V', barrier_1: '+1.17' });
    });

    describe('getSymbolBarrierSupport', () => {
        it('should return "absolute" for forex symbols', () => {
            const result = trade_store.getSymbolBarrierSupport('EURUSD');
            expect(result).toBe('absolute');
        });

        it('should return "relative" for synthetic symbols', () => {
            const result = trade_store.getSymbolBarrierSupport('1HZ100V');
            expect(result).toBe('relative');
        });

        it('should return "absolute" for unknown symbols', () => {
            const result = trade_store.getSymbolBarrierSupport('UNKNOWN');
            expect(result).toBe('absolute');
        });

        it('should be accessible as public method for component usage', () => {
            // Test that the method is now public and accessible from components
            expect(typeof trade_store.getSymbolBarrierSupport).toBe('function');

            // Test that it works correctly when called from external components
            expect(trade_store.getSymbolBarrierSupport('EURUSD')).toBe('absolute');
            expect(trade_store.getSymbolBarrierSupport('1HZ100V')).toBe('relative');
            expect(trade_store.getSymbolBarrierSupport('')).toBe('absolute');
        });
    });

    describe('getSymbolDurationSupport', () => {
        it('should return "endtime" for forex symbols', () => {
            const result = (trade_store as any).getSymbolDurationSupport('EURUSD');
            expect(result).toBe('endtime');
        });

        it('should return "ticks" for synthetic symbols', () => {
            const result = (trade_store as any).getSymbolDurationSupport('1HZ100V');
            expect(result).toBe('ticks');
        });

        it('should return "endtime" for unknown symbols', () => {
            const result = (trade_store as any).getSymbolDurationSupport('UNKNOWN');
            expect(result).toBe('endtime');
        });
    });

    describe('handleTradeParamsResetOnSymbolChange', () => {
        it('should reset barriers when switching from synthetic to forex', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('1HZ100V', 'EURUSD');

            // Should return barrier and duration reset values for forex
            expect(result).toEqual({
                barrier_1: '1.0000', // Default when no tick data available
                barrier_2: '',
                duration: 5,
                duration_unit: 'm',
                expiry_type: 'endtime',
            });

            // Should clear localStorage
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_spot_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_fixed_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_barrier_type_selection');
        });

        it('should reset barriers with spot-based value when tick data is available', () => {
            // Set up tick data
            trade_store.setTickData({ quote: 1.2345, pip_size: 5 });

            const result = trade_store.handleTradeParamsResetOnSymbolChange('1HZ100V', 'EURUSD');

            // Should return barrier and duration reset values with spot-based barrier
            expect(result).toEqual({
                barrier_1: '1.23460', // spot + pip_size increment
                barrier_2: '',
                duration: 5,
                duration_unit: 'm',
                expiry_type: 'endtime',
            });
        });

        it('should reset barriers when switching from forex to synthetic', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('EURUSD', '1HZ100V');

            expect(result).toEqual({
                barrier_1: '+0.1',
                barrier_2: '',
                duration: 5,
                duration_unit: 't',
                expiry_date: null,
                expiry_time: null,
                expiry_type: 'duration',
            });

            // Should clear localStorage
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_spot_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_fixed_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_barrier_type_selection');
        });

        it('should not reset barriers when switching between symbols with same barrier support', () => {
            // Add another synthetic symbol to active_symbols for this test
            trade_store.active_symbols.push({
                symbol: '1HZ200V',
                display_name: 'Volatility 200 (1s) Index',
                market: 'synthetic_index',
                symbol_type: 'synthetic_index',
                exchange_is_open: 1,
            } as any);

            const result = trade_store.handleTradeParamsResetOnSymbolChange('1HZ100V', '1HZ200V');

            expect(result).toBeNull();
            expect(localStorageMock.removeItem).not.toHaveBeenCalled();
        });

        it('should return null for same symbol', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('EURUSD', 'EURUSD');

            expect(result).toBeNull();
            expect(localStorageMock.removeItem).not.toHaveBeenCalled();
        });

        it('should return null for empty symbols', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('', 'EURUSD');

            expect(result).toBeNull();
            expect(localStorageMock.removeItem).not.toHaveBeenCalled();
        });

        it('should reset UI store duration units when switching from synthetic to forex', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('1HZ100V', 'EURUSD');

            // Should have reset UI store duration units to minutes for forex
            expect(mockRootStore.ui.advanced_duration_unit).toBe('m');
            expect(mockRootStore.ui.simple_duration_unit).toBe('m');
        });

        it('should reset UI store duration units when switching from forex to synthetic', () => {
            const result = trade_store.handleTradeParamsResetOnSymbolChange('EURUSD', '1HZ100V');

            // Should have reset UI store duration units to ticks for synthetic
            expect(mockRootStore.ui.advanced_duration_unit).toBe('t');
            expect(mockRootStore.ui.simple_duration_unit).toBe('t');
        });

        it('should clear all localStorage keys when switching markets', () => {
            trade_store.handleTradeParamsResetOnSymbolChange('1HZ100V', 'EURUSD');

            // Should clear all barrier-related localStorage keys
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_spot_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_fixed_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_barrier_type_selection');

            // Verify that localStorage.removeItem was called multiple times (for all the keys)
            expect(localStorageMock.removeItem).toHaveBeenCalledTimes(11);
        });
    });

    describe('processNewValuesAsync integration', () => {
        it('should apply barrier reset when symbol changes in processNewValuesAsync', async () => {
            // Set up initial state with synthetic symbol and relative barrier using actions
            trade_store.updateStore({ symbol: '1HZ100V', barrier_1: '+1.17' });

            // Mock the is_dtrader_v2 getter to return true by modifying the root store
            mockRootStore.ui.is_mobile = true;

            // Spy on the barrier reset method
            const handleTradeParamsResetSpy = jest.spyOn(trade_store, 'handleTradeParamsResetOnSymbolChange');

            // Process symbol change to forex
            await trade_store.processNewValuesAsync({ symbol: 'EURUSD' }, true);

            // Should have called the barrier reset method
            expect(handleTradeParamsResetSpy).toHaveBeenCalledWith('1HZ100V', 'EURUSD');

            // Should have cleared localStorage
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_spot_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_fixed_barrier_value');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('deriv_barrier_type_selection');
        });
    });
});
