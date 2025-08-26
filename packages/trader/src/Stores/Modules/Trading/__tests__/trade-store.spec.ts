import { configure } from 'mobx';
import moment from 'moment';

import { ActiveSymbols } from '@deriv/api-types';
import { CONTRACT_TYPES } from '@deriv/shared';
import { mockStore } from '@deriv/stores';

import { TRootStore } from 'Types';

import { ContractType } from '../Helpers/contract-type';
import TradeStore from '../trade-store';

configure({ safeDescriptors: false });

const symbol = '1HZ100V';
const activeSymbols = [
    {
        allow_forward_starting: 1,
        display_name: 'Volatility 100 (1s) Index',
        display_order: 3,
        exchange_is_open: 1,
        is_trading_suspended: 0,
        market: 'synthetic_index',
        market_display_name: 'Derived',
        pip: 0.01,
        subgroup: 'synthetics',
        subgroup_display_name: 'Synthetics',
        submarket: 'random_index',
        submarket_display_name: 'Continuous Indices',
        symbol,
        symbol_type: 'stockindex',
    },
] as ActiveSymbols;

jest.mock('@deriv/shared', () => {
    const commonRiseFallProperties = {
        barriers: 0,
        exchange_name: 'RANDOM',
        market: 'synthetic_index',
        submarket: 'random_index',
        underlying_symbol: symbol,
    };
    const commonNonEqualProperties = {
        contract_category: 'callput',
        contract_category_display: 'Up/Down',
    };
    const commonEqualProperties = {
        contract_category: 'callputequal',
        contract_category_display: 'Rise/Fall Equal',
    };
    const commonRiseProperties = {
        contract_display: 'Higher',
        sentiment: 'up',
    };
    const commonFallProperties = {
        contract_display: 'Lower',
        sentiment: 'down',
    };
    const forwardStartingOptions = [
        {
            close: '1708991999',
            date: '1708905600',
            open: '1708905600',
        },
        {
            close: '1709078399',
            date: '1708992000',
            open: '1708992000',
        },
        {
            close: '1709164799',
            date: '1709078400',
            open: '1709078400',
        },
    ];
    const commonForwardStartingProperties = {
        expiry_type: 'intraday',
        forward_starting_options: forwardStartingOptions,
        max_contract_duration: '1d',
        min_contract_duration: '2m',
        start_type: 'forward',
    };
    const commonDailyExpiryProperties = {
        expiry_type: 'daily',
        max_contract_duration: '365d',
        min_contract_duration: '1d',
        start_type: 'spot',
    };
    const commonIntradayExpiryProperties = {
        expiry_type: 'intraday',
        max_contract_duration: '1d',
        min_contract_duration: '15s',
        start_type: 'spot',
    };
    const commonTickExpiryProperties = {
        expiry_type: 'tick',
        max_contract_duration: '10t',
        min_contract_duration: '1t',
        start_type: 'spot',
    };
    const riseFallProperties = {
        ...commonRiseFallProperties,
        ...commonNonEqualProperties,
    };
    const riseFallEqualProperties = {
        ...commonRiseFallProperties,
        ...commonEqualProperties,
    };
    const contractsForResponse = {
        contracts_for: {
            available: [
                {
                    ...riseFallProperties,
                    ...commonRiseProperties,
                    ...commonDailyExpiryProperties,
                    contract_type: 'CALL',
                },
                {
                    ...riseFallProperties,
                    ...commonFallProperties,
                    ...commonDailyExpiryProperties,
                    contract_type: 'PUT',
                },
                {
                    ...riseFallProperties,
                    ...commonRiseProperties,
                    ...commonForwardStartingProperties,
                    contract_type: 'CALL',
                },
                {
                    ...riseFallProperties,
                    ...commonFallProperties,
                    ...commonForwardStartingProperties,
                    contract_type: 'PUT',
                },
                {
                    ...riseFallProperties,
                    ...commonRiseProperties,
                    ...commonIntradayExpiryProperties,
                    contract_type: 'CALL',
                },
                {
                    ...riseFallProperties,
                    ...commonFallProperties,
                    ...commonIntradayExpiryProperties,
                    contract_type: 'PUT',
                },
                {
                    ...riseFallProperties,
                    ...commonRiseProperties,
                    ...commonTickExpiryProperties,
                    contract_type: 'CALL',
                },
                {
                    ...riseFallProperties,
                    ...commonFallProperties,
                    ...commonTickExpiryProperties,
                    contract_type: 'PUT',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonRiseProperties,
                    ...commonDailyExpiryProperties,
                    contract_type: 'CALLE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonFallProperties,
                    ...commonDailyExpiryProperties,
                    contract_type: 'PUTE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonRiseProperties,
                    ...commonForwardStartingProperties,
                    contract_type: 'CALLE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonFallProperties,
                    ...commonForwardStartingProperties,
                    contract_type: 'PUTE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonRiseProperties,
                    ...commonIntradayExpiryProperties,
                    contract_type: 'CALLE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonFallProperties,
                    ...commonIntradayExpiryProperties,
                    contract_type: 'PUTE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonRiseProperties,
                    ...commonTickExpiryProperties,
                    contract_type: 'CALLE',
                },
                {
                    ...riseFallEqualProperties,
                    ...commonFallProperties,
                    ...commonTickExpiryProperties,
                    contract_type: 'PUTE',
                },
            ],
            close: 1708991999,
            feed_license: 'realtime',
            hit_count: 72,
            non_available: [
                {
                    contract_category: 'accumulator',
                    contract_display_name: 'Accumulator Up',
                    contract_type: 'ACCU',
                },
            ],
            open: 1708905600,
            spot: 10412.03,
        },
        echo_req: {
            contracts_for: symbol,
            req_id: 31,
        },
        msg_type: 'contracts_for',
        req_id: 31,
    };
    return {
        ...jest.requireActual('@deriv/shared'),
        pickDefaultSymbol: jest.fn(() => Promise.resolve(symbol)),
        WS: {
            authorized: {
                activeSymbols: () => Promise.resolve({ active_symbols: activeSymbols }),
            },
            contractsFor: () => Promise.resolve(contractsForResponse),
            storage: {
                contractsFor: () => Promise.resolve(contractsForResponse),
            },
            subscribeProposal: jest.fn(),
            wait: (...payload: []) => Promise.resolve([...payload]),
        },
    };
});

let mockedTradeStore: TradeStore;

beforeAll(async () => {
    mockedTradeStore = new TradeStore({
        root_store: mockStore({
            common: {
                server_time: moment('2024-02-26T11:59:59.488Z'),
            },
        }) as unknown as TRootStore,
    });
    await ContractType.buildContractTypesConfig(symbol);
    mockedTradeStore.onMount();
});

describe('TradeStore', () => {
    describe('setDigitStats', () => {
        const digit_stats = [120, 86, 105, 94, 85, 86, 124, 107, 90, 103];
        it('should set digit_stats', () => {
            expect(mockedTradeStore.digit_stats).toEqual([]);

            mockedTradeStore.setDigitStats(digit_stats);

            expect(mockedTradeStore.digit_stats).toEqual(digit_stats);
        });
    });
    describe('setTickData', () => {
        const tick_data = {
            ask: 405.76,
            bid: 405.56,
            epoch: 1721636565,
            id: 'f90a93f8-965a-28ab-a830-6253bff4cc98',
            pip_size: 2,
            quote: 405.66,
            symbol,
        };
        it('should set tick_data', () => {
            expect(mockedTradeStore.tick_data).toBeNull();

            mockedTradeStore.setTickData(tick_data);

            expect(mockedTradeStore.tick_data).toEqual(tick_data);
        });
    });
    describe('setActiveSymbolsV2', () => {
        it('should set active_symbols and has_symbols_for_v2', () => {
            expect(mockedTradeStore.active_symbols).toEqual(activeSymbols);
            expect(mockedTradeStore.has_symbols_for_v2).toEqual(false);

            mockedTradeStore.setActiveSymbolsV2([...activeSymbols, ...activeSymbols]);

            expect(mockedTradeStore.active_symbols).toEqual([...activeSymbols, ...activeSymbols]);
            expect(mockedTradeStore.has_symbols_for_v2).toEqual(true);
        });
    });
    describe('setTradeTypeTab', () => {
        beforeEach(() => {
            mockedTradeStore.trade_type_tab = '';
        });
        it('should set trade_type_tab when called with a defined contract_type', () => {
            expect(mockedTradeStore.trade_type_tab).toEqual('');

            mockedTradeStore.setTradeTypeTab(CONTRACT_TYPES.TOUCH.NO_TOUCH);

            expect(mockedTradeStore.trade_type_tab).toEqual(CONTRACT_TYPES.TOUCH.NO_TOUCH);
        });
        it('should set trade_type_tab to empty string when called with undefined', () => {
            expect(mockedTradeStore.trade_type_tab).toEqual('');

            mockedTradeStore.setTradeTypeTab();

            expect(mockedTradeStore.trade_type_tab).toEqual('');
        });
    });
    describe('setV2ParamsInitialValues', () => {
        beforeEach(() => {
            mockedTradeStore.clearV2ParamsInitialValues();
        });
        it('should set growth rate into a v2_params_initial_values', () => {
            expect(mockedTradeStore.v2_params_initial_values).toEqual({});

            mockedTradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.03 });

            expect(mockedTradeStore.v2_params_initial_values.growth_rate).toEqual(0.03);
        });
        it('should set strike into a v2_params_initial_values', () => {
            expect(mockedTradeStore.v2_params_initial_values).toEqual({});

            mockedTradeStore.setV2ParamsInitialValues({ name: 'strike', value: '+1.30' });

            expect(mockedTradeStore.v2_params_initial_values.strike).toEqual('+1.30');
        });
        it('should clear all values when clearV2ParamsInitialValues is called', () => {
            mockedTradeStore.setV2ParamsInitialValues({ name: 'strike', value: '+1.00' });
            mockedTradeStore.setV2ParamsInitialValues({ name: 'growth_rate', value: 0.05 });

            expect(mockedTradeStore.v2_params_initial_values.strike).toEqual('+1.00');
            expect(mockedTradeStore.v2_params_initial_values.growth_rate).toEqual(0.05);

            mockedTradeStore.clearV2ParamsInitialValues();

            expect(mockedTradeStore.v2_params_initial_values).toEqual({});
        });
    });

    describe('Vanilla contract expiry type reset behavior', () => {
        beforeEach(() => {
            // Reset trade store to a clean state
            mockedTradeStore.contract_type = 'rise_fall';
            mockedTradeStore.expiry_type = 'endtime';
            mockedTradeStore.expiry_time = '23:59:59';
            mockedTradeStore.expiry_date = '2024-12-31';
            mockedTradeStore.duration = 10;
            mockedTradeStore.duration_unit = 'd';
            mockedTradeStore.barrier_1 = '100';
        });

        it('should reset expiry_type to duration when switching from non-Vanilla to Vanilla Call', () => {
            // Initial state: non-Vanilla contract with endtime
            expect(mockedTradeStore.contract_type).toBe('rise_fall');
            expect(mockedTradeStore.expiry_type).toBe('endtime');
            expect(mockedTradeStore.expiry_time).toBe('23:59:59');
            expect(mockedTradeStore.expiry_date).toBe('2024-12-31');

            // Switch to Vanilla Call
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset expiry type and clear end time values
            expect(mockedTradeStore.expiry_type).toBe('duration');
            expect(mockedTradeStore.expiry_time).toBeNull();
            expect(mockedTradeStore.expiry_date).toBeNull();
            // Should also reset UI store's advanced_expiry_type
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('duration');
            // Should also reset other defaults for new Vanilla contract
            expect(mockedTradeStore.duration).toBe(5);
            expect(mockedTradeStore.duration_unit).toBe('m');
            expect(mockedTradeStore.barrier_1).toBe('+0.1');
        });

        it('should reset expiry_type to duration when switching from non-Vanilla to Vanilla Put', () => {
            // Initial state: non-Vanilla contract with endtime
            expect(mockedTradeStore.contract_type).toBe('rise_fall');
            expect(mockedTradeStore.expiry_type).toBe('endtime');

            // Switch to Vanilla Put
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongput' } });

            // Should reset expiry type and clear end time values
            expect(mockedTradeStore.expiry_type).toBe('duration');
            expect(mockedTradeStore.expiry_time).toBeNull();
            expect(mockedTradeStore.expiry_date).toBeNull();
            // Should also reset UI store's advanced_expiry_type
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('duration');
        });

        it('should reset expiry_type to duration when switching from Vanilla Call to Vanilla Put', () => {
            // Set initial state to Vanilla Call with endtime
            mockedTradeStore.contract_type = 'vanillalongcall';
            mockedTradeStore.expiry_type = 'endtime';
            mockedTradeStore.expiry_time = '15:30:00';
            mockedTradeStore.expiry_date = '2024-12-25';
            mockedTradeStore.duration = 5;
            mockedTradeStore.duration_unit = 'm';
            mockedTradeStore.barrier_1 = '+0.5';
            // Set UI store advanced_expiry_type to endtime as well
            mockedTradeStore.root_store.ui.advanced_expiry_type = 'endtime';

            expect(mockedTradeStore.contract_type).toBe('vanillalongcall');
            expect(mockedTradeStore.expiry_type).toBe('endtime');
            expect(mockedTradeStore.expiry_time).toBe('15:30:00');
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('endtime');

            // Switch to Vanilla Put
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongput' } });

            // Should reset expiry type and clear end time values
            expect(mockedTradeStore.expiry_type).toBe('duration');
            expect(mockedTradeStore.expiry_time).toBeNull();
            expect(mockedTradeStore.expiry_date).toBeNull();
            // Should also reset UI store's advanced_expiry_type
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('duration');
            // Should NOT reset other values since we're switching within Vanilla contracts
            expect(mockedTradeStore.duration).toBe(5);
            expect(mockedTradeStore.duration_unit).toBe('m');
            expect(mockedTradeStore.barrier_1).toBe('+0.5');
        });

        it('should reset expiry_type to duration when switching from Vanilla Put to Vanilla Call', () => {
            // Set initial state to Vanilla Put with endtime
            mockedTradeStore.contract_type = 'vanillalongput';
            mockedTradeStore.expiry_type = 'endtime';
            mockedTradeStore.expiry_time = '12:00:00';
            mockedTradeStore.expiry_date = '2024-11-15';
            mockedTradeStore.duration = 15;
            mockedTradeStore.duration_unit = 'm';
            mockedTradeStore.barrier_1 = '-0.2';
            // Set UI store advanced_expiry_type to endtime as well
            mockedTradeStore.root_store.ui.advanced_expiry_type = 'endtime';

            expect(mockedTradeStore.contract_type).toBe('vanillalongput');
            expect(mockedTradeStore.expiry_type).toBe('endtime');
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('endtime');

            // Switch to Vanilla Call
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset expiry type and clear end time values
            expect(mockedTradeStore.expiry_type).toBe('duration');
            expect(mockedTradeStore.expiry_time).toBeNull();
            expect(mockedTradeStore.expiry_date).toBeNull();
            // Should also reset UI store's advanced_expiry_type
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('duration');
            // Should NOT reset other values since we're switching within Vanilla contracts
            expect(mockedTradeStore.duration).toBe(15);
            expect(mockedTradeStore.duration_unit).toBe('m');
            expect(mockedTradeStore.barrier_1).toBe('-0.2');
        });

        it('should reset expiry_type to duration even when already on Vanilla Call and selecting it again', () => {
            // Set initial state to Vanilla Call with endtime
            mockedTradeStore.contract_type = 'vanillalongcall';
            mockedTradeStore.expiry_type = 'endtime';
            mockedTradeStore.expiry_time = '18:45:00';
            mockedTradeStore.expiry_date = '2024-10-30';
            // Set UI store advanced_expiry_type to endtime as well
            mockedTradeStore.root_store.ui.advanced_expiry_type = 'endtime';

            expect(mockedTradeStore.expiry_type).toBe('endtime');
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('endtime');

            // Select Vanilla Call again (simulating user clicking on the same contract type)
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should still reset expiry type and clear end time values
            expect(mockedTradeStore.expiry_type).toBe('duration');
            expect(mockedTradeStore.expiry_time).toBeNull();
            expect(mockedTradeStore.expiry_date).toBeNull();
            // Should also reset UI store's advanced_expiry_type
            expect(mockedTradeStore.root_store.ui.advanced_expiry_type).toBe('duration');
        });

        it('should not affect non-Vanilla contracts when switching between them', () => {
            // Set initial state to Rise/Fall with endtime
            mockedTradeStore.contract_type = 'rise_fall';
            mockedTradeStore.expiry_type = 'endtime';
            mockedTradeStore.expiry_time = '20:00:00';
            mockedTradeStore.expiry_date = '2024-09-15';

            expect(mockedTradeStore.expiry_type).toBe('endtime');

            // Switch to another non-Vanilla contract
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'high_low' } });

            // Should NOT reset expiry type for non-Vanilla contracts
            expect(mockedTradeStore.expiry_type).toBe('endtime');
            expect(mockedTradeStore.expiry_time).toBe('20:00:00');
            expect(mockedTradeStore.expiry_date).toBe('2024-09-15');
        });
    });

    describe('Vanilla contract duration_unit reset behavior', () => {
        beforeEach(() => {
            // Reset trade store to a clean state
            mockedTradeStore.contract_type = 'rise_fall';
            mockedTradeStore.duration = 10;
            mockedTradeStore.duration_unit = 'd';
            mockedTradeStore.barrier_1 = '100';
        });

        it('should always reset duration_unit to minutes when switching from non-Vanilla to Vanilla Call', () => {
            // Initial state: non-Vanilla contract with days duration
            expect(mockedTradeStore.contract_type).toBe('rise_fall');
            expect(mockedTradeStore.duration).toBe(10);
            expect(mockedTradeStore.duration_unit).toBe('d');

            // Switch to Vanilla Call
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset duration_unit to minutes and duration to 5
            expect(mockedTradeStore.duration).toBe(5);
            expect(mockedTradeStore.duration_unit).toBe('m');
        });

        it('should always reset duration_unit to minutes when switching from non-Vanilla to Vanilla Put', () => {
            // Initial state: non-Vanilla contract with hours duration
            mockedTradeStore.duration_unit = 'h';
            expect(mockedTradeStore.contract_type).toBe('rise_fall');
            expect(mockedTradeStore.duration_unit).toBe('h');

            // Switch to Vanilla Put
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongput' } });

            // Should reset duration_unit to minutes
            expect(mockedTradeStore.duration_unit).toBe('m');
        });

        it('should reset duration_unit to minutes when switching between Vanilla contracts with different duration units', () => {
            // Set initial state to Vanilla Call with days duration (simulating the problematic scenario)
            mockedTradeStore.contract_type = 'vanillalongcall';
            mockedTradeStore.duration = 5;
            mockedTradeStore.duration_unit = 'd'; // This simulates the bug scenario
            mockedTradeStore.barrier_1 = '+0.1';

            expect(mockedTradeStore.contract_type).toBe('vanillalongcall');
            expect(mockedTradeStore.duration).toBe(5);
            expect(mockedTradeStore.duration_unit).toBe('d');

            // Switch to Vanilla Put (this should reset duration_unit to minutes)
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongput' } });

            // Should reset duration_unit to minutes but keep other values
            expect(mockedTradeStore.duration).toBe(5); // Should not change
            expect(mockedTradeStore.duration_unit).toBe('m'); // Should reset to minutes
            expect(mockedTradeStore.barrier_1).toBe('+0.1'); // Should not change
        });

        it('should reset duration_unit to minutes when switching from Vanilla Put with days to Vanilla Call', () => {
            // Set initial state to Vanilla Put with days duration
            mockedTradeStore.contract_type = 'vanillalongput';
            mockedTradeStore.duration = 7;
            mockedTradeStore.duration_unit = 'd';
            mockedTradeStore.barrier_1 = '-0.2';

            expect(mockedTradeStore.contract_type).toBe('vanillalongput');
            expect(mockedTradeStore.duration_unit).toBe('d');

            // Switch to Vanilla Call
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset duration_unit to minutes
            expect(mockedTradeStore.duration).toBe(7); // Should not change
            expect(mockedTradeStore.duration_unit).toBe('m'); // Should reset to minutes
            expect(mockedTradeStore.barrier_1).toBe('-0.2'); // Should not change
        });

        it('should reset duration_unit to minutes even when selecting the same Vanilla contract with non-minutes duration', () => {
            // Set initial state to Vanilla Call with hours duration
            mockedTradeStore.contract_type = 'vanillalongcall';
            mockedTradeStore.duration = 3;
            mockedTradeStore.duration_unit = 'h';
            mockedTradeStore.barrier_1 = '+0.5';

            expect(mockedTradeStore.duration_unit).toBe('h');

            // Select the same Vanilla Call again (simulating user re-selecting)
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset duration_unit to minutes
            expect(mockedTradeStore.duration).toBe(3); // Should not change
            expect(mockedTradeStore.duration_unit).toBe('m'); // Should reset to minutes
            expect(mockedTradeStore.barrier_1).toBe('+0.5'); // Should not change
        });

        it('should simulate the exact problematic scenario: Vanilla -> Days -> Non-Vanilla -> Vanilla', () => {
            // Step 1: Start with Vanilla Call
            mockedTradeStore.contract_type = 'vanillalongcall';
            mockedTradeStore.duration = 5;
            mockedTradeStore.duration_unit = 'm';
            mockedTradeStore.barrier_1 = '+0.1';

            expect(mockedTradeStore.contract_type).toBe('vanillalongcall');
            expect(mockedTradeStore.duration_unit).toBe('m');

            // Step 2: User changes duration unit to days (simulating UI interaction)
            mockedTradeStore.duration_unit = 'd';
            expect(mockedTradeStore.duration_unit).toBe('d');

            // Step 3: Switch to non-Vanilla contract
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'rise_fall' } });
            expect(mockedTradeStore.contract_type).toBe('rise_fall');
            expect(mockedTradeStore.duration_unit).toBe('d'); // Should remain as days

            // Step 4: Switch back to Vanilla - this should reset duration_unit to minutes
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'vanillalongcall' } });

            // Should reset duration_unit to minutes (fixing the bug)
            expect(mockedTradeStore.duration_unit).toBe('m');
            expect(mockedTradeStore.duration).toBe(5); // Should reset to default
            expect(mockedTradeStore.barrier_1).toBe('+0.1'); // Should reset to default
        });

        it('should not affect duration_unit for non-Vanilla contracts', () => {
            // Set initial state to non-Vanilla with days duration
            mockedTradeStore.contract_type = 'rise_fall';
            mockedTradeStore.duration = 10;
            mockedTradeStore.duration_unit = 'd';

            expect(mockedTradeStore.duration_unit).toBe('d');

            // Switch to another non-Vanilla contract
            mockedTradeStore.onChange({ target: { name: 'contract_type', value: 'high_low' } });

            // Should NOT reset duration_unit for non-Vanilla contracts
            expect(mockedTradeStore.duration_unit).toBe('d');
            expect(mockedTradeStore.duration).toBe(10);
        });
    });
});
