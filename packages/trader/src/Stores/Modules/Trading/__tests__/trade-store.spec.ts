import { configure } from 'mobx';
import moment from 'moment';

import { ActiveSymbols } from '@deriv/api-types';
import { TRADE_TYPES } from '@deriv/shared';
import { mockStore } from '@deriv/stores';

import { TRootStore } from 'Types';
import TradeStore from '../trade-store';

configure({ safeDescriptors: false });

// Mock moment to return consistent time
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment');
    return (date?: any) => {
        if (!date) {
            return actualMoment('2024-02-26T11:59:59.488Z');
        }
        return actualMoment(date);
    };
});

// Mock ServerTime
jest.mock('_common/base/server_time', () => {
    const mockMoment = jest.requireActual('moment');
    return {
        get: () => mockMoment('2024-02-26T11:59:59.488Z'),
        timePromise: () => Promise.resolve(mockMoment('2024-02-26T11:59:59.488Z')),
    };
});

// Mock shared utilities
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    pickDefaultSymbol: jest.fn(() => Promise.resolve('1HZ100V')),
    isMarketClosed: jest.fn(() => false),
    WS: {
        authorized: {
            activeSymbols: () =>
                Promise.resolve({
                    active_symbols: [
                        {
                            symbol: '1HZ100V',
                            exchange_is_open: 1,
                            market: 'synthetic_index',
                            display_name: 'Volatility 100 (1s) Index',
                        },
                    ],
                }),
        },
        contractsFor: () =>
            Promise.resolve({
                contracts_for: {
                    available: [],
                    non_available: [],
                },
            }),
        storage: {
            contractsFor: () =>
                Promise.resolve({
                    contracts_for: {
                        available: [],
                        non_available: [],
                    },
                }),
        },
        subscribeProposal: jest.fn(),
        forgetAll: jest.fn(),
        wait: jest.fn(() => Promise.resolve({})),
    },
}));

// Mock ContractType helper
jest.mock('../Helpers/contract-type', () => ({
    ContractType: {
        buildContractTypesConfig: jest.fn(() => Promise.resolve()),
        getContractCategories: () => ({
            contract_types_list: {},
            non_available_contract_types_list: {},
        }),
        getContractValues: () => ({}),
    },
}));

// Mock ContractType Actions
jest.mock('../Actions/contract-type', () => ({
    ContractType: {
        getContractType: jest.fn(() => ({ categories: [], contract_types: [] })),
    },
}));

// Mock process helpers
jest.mock('../Helpers/process', () => ({
    processContractsForApi: jest.fn(() => Promise.resolve()),
    processPurchase: jest.fn(() => Promise.resolve()),
    processProposal: jest.fn(() => Promise.resolve()),
    processTradeParams: jest.fn(() => Promise.resolve()),
}));

describe('TradeStore', () => {
    let tradeStore: TradeStore, mockRootStore: TRootStore;

    beforeEach(() => {
        mockRootStore = mockStore({
            common: {
                server_time: moment('2024-02-26T11:59:59.488Z'),
                setServicesError: jest.fn(),
                setSelectedContractType: jest.fn(),
                showError: jest.fn(),
                is_language_changing: false,
            },
            client: {
                currency: 'USD',
                default_currency: 'USD',
                is_logged_in: false,
                is_logging_in: false,
                selectCurrency: jest.fn(),
            },
            ui: {
                advanced_expiry_type: 'duration',
                advanced_duration_unit: 'm',
                simple_duration_unit: 'm',
                is_mobile: false,
                is_advanced_duration: false,
                toggleUrlUnavailableModal: jest.fn(),
                openPositionsDrawer: jest.fn(),
                resetPurchaseStates: jest.fn(),
                toggleServicesErrorModal: jest.fn(),
            },
            active_symbols: {
                setActiveSymbols: jest.fn(),
            },
            notifications: {
                removeTradeNotifications: jest.fn(),
                setShouldShowPopups: jest.fn(),
                addTradeNotification: jest.fn(),
                is_notifications_visible: false,
                toggleNotificationsModal: jest.fn(),
            },
            contract_trade: {
                contracts: [],
                clearAccumulatorBarriersData: jest.fn(),
                addContract: jest.fn(),
                chart_type: 'mountain',
                granularity: 0,
                updateChartType: jest.fn(),
                updateGranularity: jest.fn(),
                savePreviousChartMode: jest.fn(),
                onUnmount: jest.fn(),
                updateAccumulatorBarriersData: jest.fn(),
            },
            portfolio: {
                barriers: [],
                setContractType: jest.fn(),
                onBuyResponse: jest.fn(),
                open_accu_contract: null,
                active_positions: [],
            },
            gtm: {
                pushDataLayer: jest.fn(),
            },
        }) as unknown as TRootStore;

        tradeStore = new TradeStore({ root_store: mockRootStore });
    });

    describe('Initialization', () => {
        it('should initialize with correct default values', () => {
            expect(tradeStore.amount).toBe(10);
            expect(tradeStore.duration).toBe(5);
            expect(tradeStore.is_trade_component_mounted).toBe(false);
            expect(tradeStore.is_purchase_enabled).toBe(false);
            expect(tradeStore.is_trade_enabled).toBe(false);
            expect(tradeStore.currency).toBe('');
            expect(tradeStore.basis).toBe('');
            expect(tradeStore.contract_type).toBe('');
            expect(tradeStore.symbol).toBe('');
        });

        it('should have MobX observable properties', () => {
            // Test that properties are observable by changing them
            const originalAmount = tradeStore.amount;
            tradeStore.amount = 50;
            expect(tradeStore.amount).toBe(50);
            expect(tradeStore.amount).not.toBe(originalAmount);
        });
    });

    describe('Contract Type Identification', () => {
        it('should identify accumulator contracts', () => {
            tradeStore.contract_type = TRADE_TYPES.ACCUMULATOR;
            expect(tradeStore.is_accumulator).toBe(true);
            expect(tradeStore.is_multiplier).toBe(false);
            expect(tradeStore.is_vanilla).toBe(false);
            expect(tradeStore.is_turbos).toBe(false);
        });

        it('should identify multiplier contracts', () => {
            tradeStore.contract_type = TRADE_TYPES.MULTIPLIER;
            expect(tradeStore.is_multiplier).toBe(true);
            expect(tradeStore.is_accumulator).toBe(false);
            expect(tradeStore.is_vanilla).toBe(false);
            expect(tradeStore.is_turbos).toBe(false);
        });

        it('should identify vanilla contracts', () => {
            tradeStore.contract_type = 'vanillalongcall';
            expect(tradeStore.is_vanilla).toBe(true);
            expect(tradeStore.is_accumulator).toBe(false);
            expect(tradeStore.is_multiplier).toBe(false);
            expect(tradeStore.is_turbos).toBe(false);
        });

        it('should identify turbos contracts', () => {
            tradeStore.contract_type = 'turboslong';
            expect(tradeStore.is_turbos).toBe(true);
            expect(tradeStore.is_accumulator).toBe(false);
            expect(tradeStore.is_multiplier).toBe(false);
            expect(tradeStore.is_vanilla).toBe(false);
        });

        it('should identify crypto multiplier contracts', () => {
            tradeStore.contract_type = TRADE_TYPES.MULTIPLIER;
            tradeStore.symbol = 'cryBTCUSD';
            expect(tradeStore.is_crypto_multiplier).toBe(true);

            tradeStore.symbol = '1HZ100V';
            expect(tradeStore.is_crypto_multiplier).toBe(false);
        });
    });

    describe('Basic Setters', () => {
        describe('setDigitStats', () => {
            it('should set digit stats array', () => {
                const stats = [120, 86, 105, 94, 85, 86, 124, 107, 90, 103];
                tradeStore.setDigitStats(stats);
                expect(tradeStore.digit_stats).toEqual(stats);
            });

            it('should handle empty array', () => {
                tradeStore.setDigitStats([]);
                expect(tradeStore.digit_stats).toEqual([]);
            });
        });

        describe('setTickData', () => {
            it('should set tick data', () => {
                const tickData = {
                    ask: 405.76,
                    bid: 405.56,
                    epoch: 1721636565,
                    id: 'test-id',
                    pip_size: 2,
                    quote: 405.66,
                    symbol: '1HZ100V',
                };

                tradeStore.setTickData(tickData);
                expect(tradeStore.tick_data).toEqual(tickData);
            });

            it('should handle null tick data', () => {
                tradeStore.setTickData(null);
                expect(tradeStore.tick_data).toBeNull();
            });
        });

        describe('setActiveSymbolsV2', () => {
            it('should set active symbols for V2', () => {
                const symbols: ActiveSymbols = [
                    {
                        symbol: 'R_100',
                        display_name: 'Volatility 100 Index',
                        market: 'synthetic_index',
                        exchange_is_open: 1,
                    },
                ] as ActiveSymbols;

                tradeStore.setActiveSymbolsV2(symbols);
                expect(tradeStore.active_symbols).toEqual(symbols);
                expect(tradeStore.has_symbols_for_v2).toBe(true);
            });

            it('should set has_symbols_for_v2 to false for empty array', () => {
                tradeStore.setActiveSymbolsV2([]);
                expect(tradeStore.has_symbols_for_v2).toBe(false);
            });
        });

        describe('setTradeTypeTab', () => {
            it('should set trade type tab', () => {
                tradeStore.setTradeTypeTab('rise_fall');
                expect(tradeStore.trade_type_tab).toBe('rise_fall');
            });

            it('should handle undefined parameter', () => {
                tradeStore.setTradeTypeTab();
                expect(tradeStore.trade_type_tab).toBe('');
            });
        });

        describe('setDefaultStake', () => {
            it('should set default stake', () => {
                tradeStore.setDefaultStake(25);
                expect(tradeStore.default_stake).toBe(25);
            });

            it('should handle undefined stake', () => {
                tradeStore.setDefaultStake(undefined);
                expect(tradeStore.default_stake).toBeUndefined();
            });
        });
    });

    describe('V2 Parameters Management', () => {
        beforeEach(() => {
            tradeStore.clearV2ParamsInitialValues();
        });

        it('should set growth rate in v2_params_initial_values', () => {
            tradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.03 });
            expect(tradeStore.v2_params_initial_values.growth_rate).toBe(0.03);
        });

        it('should set strike price in v2_params_initial_values', () => {
            tradeStore.setV2ParamsInitialValues({ name: 'strike', value: '+1.30' });
            expect(tradeStore.v2_params_initial_values.strike).toBe('+1.30');
        });

        it('should set multiplier in v2_params_initial_values', () => {
            tradeStore.setV2ParamsInitialValues({ name: 'multiplier', value: 100 });
            expect(tradeStore.v2_params_initial_values.multiplier).toBe(100);
        });

        it('should update existing values', () => {
            tradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.03 });
            tradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.05 });
            expect(tradeStore.v2_params_initial_values.growth_rate).toBe(0.05);
        });

        it('should clear all values', () => {
            tradeStore.setV2ParamsInitialValues({ name: 'strike', value: '+1.00' });
            tradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.05 });

            expect(tradeStore.v2_params_initial_values).toEqual({
                strike: '+1.00',
                growth_rate: 0.05,
            });

            tradeStore.clearV2ParamsInitialValues();
            expect(tradeStore.v2_params_initial_values).toEqual({});
        });
    });

    describe('Store State Management', () => {
        describe('Purchase Management', () => {
            it('should enable purchase', () => {
                tradeStore.is_purchase_enabled = false;
                tradeStore.enablePurchase();
                expect(tradeStore.is_purchase_enabled).toBe(true);
            });

            it('should clear purchase info', () => {
                tradeStore.purchase_info = { contract_id: 123 };
                tradeStore.proposal_requests = { CALL: {} };
                tradeStore.proposal_info = { CALL: {} as any };

                tradeStore.clearPurchaseInfo();

                expect(tradeStore.purchase_info).toEqual({});
                expect(tradeStore.proposal_requests).toEqual({});
                expect(tradeStore.proposal_info).toEqual({});
            });
        });

        describe('Market Status', () => {
            it('should set market status', () => {
                tradeStore.setMarketStatus(true);
                expect(tradeStore.is_market_closed).toBe(true);

                tradeStore.setMarketStatus(false);
                expect(tradeStore.is_market_closed).toBe(false);
            });
        });

        describe('Trade Status', () => {
            it('should set trade status', () => {
                tradeStore.setTradeStatus(true);
                expect(tradeStore.is_trade_enabled).toBe(true);

                tradeStore.setTradeStatus(false);
                expect(tradeStore.is_trade_enabled).toBe(false);
            });
        });

        describe('Store Refresh', () => {
            it('should refresh store state', () => {
                // Set up some state
                tradeStore.proposal_info = { CALL: {} as any };
                tradeStore.purchase_info = { contract_id: 123 };
                tradeStore.proposal_requests = { CALL: {} };

                // Refresh should clear everything
                tradeStore.refresh();

                expect(tradeStore.proposal_info).toEqual({});
                expect(tradeStore.purchase_info).toEqual({});
                expect(tradeStore.proposal_requests).toEqual({});
            });
        });
    });

    describe('Barrier Management', () => {
        describe('setBarrierChoices', () => {
            it('should set barrier choices', () => {
                const barriers = ['+0.1', '+0.2', '+0.3', '-0.1', '-0.2'];
                tradeStore.setBarrierChoices(barriers);
                expect(tradeStore.barrier_choices).toEqual(barriers);
            });

            it('should handle empty array', () => {
                tradeStore.setBarrierChoices([]);
                expect(tradeStore.barrier_choices).toEqual([]);
            });

            it('should handle null/undefined', () => {
                tradeStore.setBarrierChoices(null as any);
                expect(tradeStore.barrier_choices).toEqual([]);
            });

            it('should set strike price choices for vanilla contracts', () => {
                tradeStore.contract_type = 'vanillalongcall';
                const barriers = ['+0.1', '+0.2', '+0.3'];
                tradeStore.barrier_1 = '+0.1';

                tradeStore.setBarrierChoices(barriers);

                expect(tradeStore.barrier_choices).toEqual(barriers);
                expect(tradeStore.strike_price_choices).toEqual({
                    barrier: '+0.1',
                    barrier_choices: barriers,
                });
            });
        });

        describe('setPayoutChoices', () => {
            it('should set payout choices for long turbos', () => {
                tradeStore.contract_type = 'turboslong';
                const payouts = ['1', '2', '3', '4'];
                tradeStore.barrier_1 = '+0.1';

                tradeStore.setPayoutChoices(payouts);

                expect(tradeStore.payout_choices).toEqual(payouts);
                expect(tradeStore.long_barriers).toEqual({
                    barrier: '+0.1',
                    payout_choices: payouts,
                });
            });

            it('should set payout choices for short turbos', () => {
                tradeStore.contract_type = 'turbosshort';
                const payouts = ['1', '2', '3', '4'];
                tradeStore.barrier_1 = '-0.1';

                tradeStore.setPayoutChoices(payouts);

                expect(tradeStore.payout_choices).toEqual(payouts);
                expect(tradeStore.short_barriers).toEqual({
                    barrier: '-0.1',
                    payout_choices: payouts,
                });
            });
        });

        describe('findClosestBarrierValue', () => {
            it('should find exact match', () => {
                const choices = ['+0.1', '+0.2', '+0.5', '+1.0'];
                const result = tradeStore.findClosestBarrierValue('+0.5', choices);
                expect(result).toBe('+0.5');
            });

            it('should find closest relative barrier', () => {
                const choices = ['+0.1', '+0.2', '+0.5', '+1.0'];
                const result = tradeStore.findClosestBarrierValue('+0.3', choices);
                expect(result).toBe('+0.2');
            });

            it('should handle empty choices', () => {
                const result = tradeStore.findClosestBarrierValue('+0.3', []);
                expect(result).toBe('+0.3');
            });

            it('should return current value if already in choices', () => {
                const choices = ['+0.1', '+0.2', '+0.5'];
                const result = tradeStore.findClosestBarrierValue('+0.2', choices);
                expect(result).toBe('+0.2');
            });
        });
    });

    describe('Accumulator Methods', () => {
        describe('setDefaultGrowthRate', () => {
            it('should set growth rate when accumulator and rate not in range', () => {
                tradeStore.contract_type = TRADE_TYPES.ACCUMULATOR;
                tradeStore.accumulator_range_list = [0.01, 0.02, 0.03, 0.04, 0.05];
                tradeStore.growth_rate = 0.1; // Not in range

                tradeStore.setDefaultGrowthRate();

                expect(tradeStore.growth_rate).toBe(0.01); // First in range
            });

            it('should not change growth rate if already in range', () => {
                tradeStore.contract_type = TRADE_TYPES.ACCUMULATOR;
                tradeStore.accumulator_range_list = [0.01, 0.02, 0.03, 0.04, 0.05];
                tradeStore.growth_rate = 0.03; // In range

                tradeStore.setDefaultGrowthRate();

                expect(tradeStore.growth_rate).toBe(0.03); // Unchanged
            });

            it('should not change growth rate for non-accumulator contracts', () => {
                tradeStore.contract_type = TRADE_TYPES.MULTIPLIER;
                tradeStore.accumulator_range_list = [0.01, 0.02, 0.03];
                tradeStore.growth_rate = 0.1;

                tradeStore.setDefaultGrowthRate();

                expect(tradeStore.growth_rate).toBe(0.1); // Unchanged
            });
        });

        describe('resetAccumulatorData', () => {
            it('should call clearAccumulatorBarriersData', () => {
                tradeStore.resetAccumulatorData();
                expect(mockRootStore.contract_trade.clearAccumulatorBarriersData).toHaveBeenCalledWith(false, true);
            });
        });
    });

    describe('Mobile and UI State', () => {
        describe('setMobileDigitView', () => {
            it('should set mobile digit view', () => {
                tradeStore.setMobileDigitView(true);
                expect(tradeStore.is_mobile_digit_view_selected).toBe(true);

                tradeStore.setMobileDigitView(false);
                expect(tradeStore.is_mobile_digit_view_selected).toBe(false);
            });
        });

        describe('setIsTradeParamsExpanded', () => {
            it('should set trade params expanded state', () => {
                tradeStore.setIsTradeParamsExpanded(false);
                expect(tradeStore.is_trade_params_expanded).toBe(false);

                tradeStore.setIsTradeParamsExpanded(true);
                expect(tradeStore.is_trade_params_expanded).toBe(true);
            });
        });

        describe('setIsDigitsWidgetActive', () => {
            it('should set digits widget active state', () => {
                tradeStore.setIsDigitsWidgetActive(true);
                expect(tradeStore.is_digits_widget_active).toBe(true);

                tradeStore.setIsDigitsWidgetActive(false);
                expect(tradeStore.is_digits_widget_active).toBe(false);
            });
        });

        describe('togglePayoutWheelPicker', () => {
            it('should toggle payout wheel picker', () => {
                expect(tradeStore.open_payout_wheelpicker).toBe(false);

                tradeStore.togglePayoutWheelPicker();
                expect(tradeStore.open_payout_wheelpicker).toBe(true);

                tradeStore.togglePayoutWheelPicker();
                expect(tradeStore.open_payout_wheelpicker).toBe(false);
            });
        });

        describe('setPayoutPerPoint', () => {
            it('should set payout per point', () => {
                tradeStore.setPayoutPerPoint('10');
                expect(tradeStore.payout_per_point).toBe('10');
            });

            it('should not update if value is same', () => {
                tradeStore.payout_per_point = '10';
                const spy = jest.spyOn(tradeStore, 'onChange');

                tradeStore.setPayoutPerPoint('10');
                expect(spy).not.toHaveBeenCalled();

                spy.mockRestore();
            });

            it('should call onChange when value changes', () => {
                tradeStore.payout_per_point = '5';
                const spy = jest.spyOn(tradeStore, 'onChange');

                tradeStore.setPayoutPerPoint('10');
                expect(spy).toHaveBeenCalledWith({
                    target: {
                        name: 'payout_per_point',
                        value: '10',
                    },
                });

                spy.mockRestore();
            });
        });
    });

    describe('Chart and Status Methods', () => {
        describe('setChartStatus', () => {
            it('should set chart loading status directly', () => {
                tradeStore.setChartStatus(true);
                expect(tradeStore.is_chart_loading).toBe(true);

                tradeStore.setChartStatus(false);
                expect(tradeStore.is_chart_loading).toBe(false);
            });

            it('should use debounced method when called from chart', () => {
                const spy = jest.spyOn(tradeStore, 'debouncedSetChartStatus');

                tradeStore.setChartStatus(true, true);
                expect(spy).toHaveBeenCalledWith(true);

                spy.mockRestore();
            });
        });

        describe('setSkipPrePostLifecycle', () => {
            it('should set skip lifecycle flag', () => {
                tradeStore.setSkipPrePostLifecycle(true);
                expect(tradeStore.should_skip_prepost_lifecycle).toBe(true);

                tradeStore.setSkipPrePostLifecycle(false);
                expect(tradeStore.should_skip_prepost_lifecycle).toBe(false);
            });

            it('should not update if value is same', () => {
                tradeStore.should_skip_prepost_lifecycle = true;
                tradeStore.setSkipPrePostLifecycle(true);
                expect(tradeStore.should_skip_prepost_lifecycle).toBe(true);
            });
        });
    });

    describe('Symbol and Previous Symbol Management', () => {
        describe('setPreviousSymbol', () => {
            it('should set previous symbol', () => {
                tradeStore.setPreviousSymbol('R_100');
                expect(tradeStore.previous_symbol).toBe('R_100');
            });

            it('should not update if symbol is same', () => {
                tradeStore.previous_symbol = 'R_100';
                tradeStore.setPreviousSymbol('R_100');
                expect(tradeStore.previous_symbol).toBe('R_100');
            });
        });

        describe('is_symbol_in_active_symbols', () => {
            beforeEach(() => {
                tradeStore.active_symbols = [
                    {
                        symbol: 'R_100',
                        display_name: 'Volatility 100 Index',
                        display_order: 1,
                        exchange_is_open: 1,
                        market: 'synthetic_index',
                        symbol_type: 'stockindex',
                    },
                    {
                        symbol: '1HZ100V',
                        display_name: 'Volatility 100 (1s) Index',
                        display_order: 2,
                        exchange_is_open: 1,
                        market: 'synthetic_index',
                        symbol_type: 'stockindex',
                    },
                ] as ActiveSymbols;
            });

            it('should return true for existing symbol', () => {
                tradeStore.symbol = 'R_100';
                expect(tradeStore.is_symbol_in_active_symbols).toBe(true);
            });

            it('should return false for non-existing symbol', () => {
                tradeStore.symbol = 'NON_EXISTENT';
                expect(tradeStore.is_symbol_in_active_symbols).toBe(false);
            });

            it('should return false when exchange is closed', () => {
                tradeStore.active_symbols = [
                    {
                        symbol: 'R_100',
                        display_name: 'Volatility 100 Index',
                        display_order: 1,
                        exchange_is_open: 0, // Closed
                        market: 'synthetic_index',
                        symbol_type: 'stockindex',
                    },
                ] as ActiveSymbols;
                tradeStore.symbol = 'R_100';
                expect(tradeStore.is_symbol_in_active_symbols).toBe(false);
            });
        });
    });

    describe('Computed Properties', () => {
        describe('show_digits_stats', () => {
            it('should return true for digit trade types', () => {
                // Mock the isDigitTradeType function to return true
                const mockIsDigitTradeType = jest.fn(() => true);
                jest.doMock('Modules/Trading/Helpers/digits', () => ({
                    isDigitTradeType: mockIsDigitTradeType,
                }));

                tradeStore.contract_type = 'even_odd';
                expect(tradeStore.show_digits_stats).toBe(true);
            });
        });

        describe('is_dtrader_v2', () => {
            it('should return true when UI is mobile', () => {
                mockRootStore.ui.is_mobile = true;
                expect(tradeStore.is_dtrader_v2).toBe(true);
            });

            it('should return false when UI is not mobile', () => {
                mockRootStore.ui.is_mobile = false;
                expect(tradeStore.is_dtrader_v2).toBe(false);
            });
        });

        describe('is_synthetics_available', () => {
            it('should return true when synthetics market exists', () => {
                tradeStore.active_symbols = [
                    {
                        market: 'synthetic_index',
                        symbol: 'R_100',
                        display_name: 'Volatility 100 Index',
                        display_order: 1,
                        exchange_is_open: 1,
                        symbol_type: 'stockindex',
                    },
                ] as ActiveSymbols;
                expect(tradeStore.is_synthetics_available).toBe(true);
            });

            it('should return false when no synthetics market', () => {
                tradeStore.active_symbols = [
                    {
                        market: 'forex',
                        symbol: 'EURUSD',
                        display_name: 'EUR/USD',
                        display_order: 1,
                        exchange_is_open: 1,
                        symbol_type: 'forex',
                    },
                ] as ActiveSymbols;
                expect(tradeStore.is_synthetics_available).toBe(false);
            });
        });
    });
});
