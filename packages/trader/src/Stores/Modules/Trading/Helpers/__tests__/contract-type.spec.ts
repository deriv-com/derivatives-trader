import moment from 'moment';

import { TRADE_TYPES } from '@deriv/shared';
import { mockStore } from '@deriv/stores';

import { ContractType } from '../contract-type';

import ServerTime from '_common/base/server_time';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    WS: {
        contractsFor: jest.fn(() =>
            Promise.resolve({
                contracts_for: {
                    available: [
                        {
                            barriers: 0,
                            contract_category: 'callput',
                            contract_category_display: 'Up/Down',
                            contract_display: 'Higher',
                            contract_type: 'CALL',
                            exchange_name: 'FOREX',
                            expiry_type: 'daily',
                            market: 'forex',
                            max_contract_duration: '365d',
                            min_contract_duration: '1d',
                            sentiment: 'up',
                            start_type: 'spot',
                            submarket: 'major_pairs',
                            underlying_symbol: 'frxAUDJPY',
                        },
                        {
                            barriers: 2,
                            contract_category: 'endsinout',
                            contract_category_display: 'Ends Between/Ends Outside',
                            contract_display: 'Ends Outside',
                            contract_type: 'EXPIRYMISS',
                            exchange_name: 'FOREX',
                            expiry_type: 'daily',
                            forward_starting_options: [
                                {
                                    close: '1701302399',
                                    date: '1701216000',
                                    open: '1701216000',
                                },
                                {
                                    close: '1701388799',
                                    date: '1701302400',
                                    open: '1701302400',
                                },
                                {
                                    close: '1701475199',
                                    date: '1701388800',
                                    open: '1701388800',
                                },
                            ],
                            high_barrier: '98.745',
                            low_barrier: '97.672',
                            market: 'forex',
                            max_contract_duration: '365d',
                            min_contract_duration: '1d',
                            sentiment: 'high_vol',
                            start_type: 'spot',
                            submarket: 'major_pairs',
                            underlying_symbol: 'frxAUDJPY',
                        },
                        {
                            barriers: 0,
                            contract_category: 'callputequal',
                            contract_category_display: 'Rise/Fall Equal',
                            contract_display: 'Higher',
                            contract_type: 'CALLE',
                            default_stake: 10,
                            exchange_name: 'FOREX',
                            expiry_type: 'daily',
                            market: 'forex',
                            max_contract_duration: '365d',
                            min_contract_duration: '1d',
                            sentiment: 'up',
                            start_type: 'spot',
                            submarket: 'major_pairs',
                            underlying_symbol: 'frxAUDJPY',
                        },
                        {
                            barrier: '101.389',
                            barriers: 1,
                            contract_category: 'callput',
                            contract_category_display: 'Up/Down',
                            contract_display: 'Higher',
                            contract_type: 'CALL',
                            default_stake: 10,
                            exchange_name: 'FOREX',
                            expiry_type: 'daily',
                            market: 'forex',
                            max_contract_duration: '365d',
                            min_contract_duration: '1d',
                            sentiment: 'up',
                            start_type: 'spot',
                            submarket: 'major_pairs',
                            underlying_symbol: 'frxAUDJPY',
                        },
                    ],
                    close: 1701215999,
                    feed_license: 'realtime',
                    hit_count: 22,
                    non_available: [
                        {
                            contract_category: 'accumulator',
                            contract_display_name: 'Accumulator Up',
                            contract_type: 'ACCU',
                        },
                        {
                            contract_category: 'asian',
                            contract_display_name: 'Asian Down',
                            contract_type: 'ASIAND',
                        },
                    ],
                    open: 1701129600,
                    spot: 98.076,
                },
            })
        ),
        tradingTimes: jest.fn(() =>
            Promise.resolve({
                trading_times: {
                    markets: [
                        {
                            name: 'Forex',
                            submarkets: [
                                {
                                    name: 'Major Pairs',
                                    symbols: [
                                        {
                                            events: [
                                                {
                                                    dates: 'Fridays',
                                                    descrip: 'Closes early (at 20:55)',
                                                },
                                                {
                                                    dates: '2023-12-25',
                                                    descrip: 'Christmas Day',
                                                },
                                                {
                                                    dates: '2024-01-01',
                                                    descrip: "New Year's Day",
                                                },
                                            ],
                                            name: 'AUD/JPY',
                                            symbol: 'frxAUDJPY',
                                            times: {
                                                close: ['23:59:59'],
                                                open: ['00:00:00'],
                                                settlement: '23:59:59',
                                            },
                                            trading_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                        },
                                    ],
                                },
                                {
                                    name: 'Minor Pairs',
                                    symbols: [
                                        {
                                            events: [
                                                {
                                                    dates: 'Fridays',
                                                    descrip: 'Closes early (at 20:55)',
                                                },
                                                {
                                                    dates: '2023-12-25',
                                                    descrip: 'Christmas Day',
                                                },
                                                {
                                                    dates: '2024-01-01',
                                                    descrip: "New Year's Day",
                                                },
                                            ],
                                            name: 'AUD/AED',
                                            symbol: 'frxAUDAED',
                                            times: {
                                                close: ['23:59:59'],
                                                open: ['00:00:00'],
                                                settlement: '23:59:59',
                                            },
                                            trading_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                echo_req: {
                    trading_times: '2023-12-01',
                },
            })
        ),
    },
}));

jest.mock('_common/base/server_time', () => ({
    get: jest.fn(() => ({
        isBefore: jest.fn(),
        clone: jest.fn(),
        get: jest.fn(),
    })),
}));

const server_time_get_spy = jest.spyOn(ServerTime, 'get');
describe('ContractType.getBarriers', () => {
    it('should return barriers based on contract type and expiry type', async () => {
        const contract_type = 'end';
        const expiry_type = 'daily';
        const stored_barrier_value = undefined;
        const symbol = 'frxAUDJPY';
        await ContractType.buildContractTypesConfig(symbol);

        const result = ContractType.getBarriers(contract_type, expiry_type, stored_barrier_value);

        expect(result.barrier_count).toBe(2);
        expect(result.barrier_1).toBe('98.745');
        expect(result.barrier_2).toBe('97.672');
    });
});

describe('ContractType.getContractType', () => {
    it('should return contract_type object from contract_type specified from the input', async () => {
        const list = {
            'Ups & Downs': {
                name: 'Ups & Downs',
                categories: [
                    {
                        value: 'rise_fall',
                        text: 'Rise/Fall',
                    },
                    {
                        value: 'rise_fall_equal',
                        text: 'Rise/Fall',
                    },
                ],
            },
            'Touch & No Touch': {
                name: 'Touch & No Touch',
                categories: [
                    {
                        value: 'high_low',
                        text: 'Higher/Lower',
                    },
                    {
                        value: 'touch',
                        text: 'Touch/No Touch',
                    },
                ],
            },
        };
        const contract_type = 'high_low';
        const result = ContractType.getContractType(list, contract_type);
        expect(result).toEqual({ contract_type: 'high_low' });
    });
});
describe('ContractType.getContractValues', () => {
    const trade_store = mockStore({}).modules.trade;
    it('should return empty object if contract_type is null', () => {
        const result = ContractType.getContractValues(trade_store);
        expect(result).toEqual({});
    });
    it('given available contract types according to symbol should return object of contract values', async () => {
        const symbol = 'frxAUDJPY';
        await ContractType.buildContractTypesConfig(symbol);
        trade_store.contract_type = 'rise_fall';
        const result = ContractType.getContractValues(trade_store);
        expect(result).toEqual({
            form_components: ['duration', 'amount', 'start_date'],
            basis_list: [
                { text: 'Stake', value: 'stake' },
                { text: 'Payout', value: 'payout' },
            ],
            basis: 'stake',
            trade_types: { CALL: 'CALL' },
            start_date: 0,
            start_dates_list: [{ text: 'Now', value: 0 }],
            contract_start_type: 'spot',
            barrier_count: 0,
            barrier_1: '',
            barrier_2: '',
            duration_unit: 'm', // Updated: Vanilla contracts now always return 'm'
            duration_units_list: [{ text: 'Days', value: 'd' }],
            duration_min_max: { daily: { min: 86400, max: 31536000 } },
            expiry_type: 'duration',
            accumulator_range_list: [],
            barrier_choices: [],
            multiplier_range_list: [],
            multiplier: undefined,
            cancellation_duration: undefined,
            cancellation_range_list: [],
            cached_multiplier_cancellation_list: [],
            has_cancellation: false,
        });
    });
    it('should use strike value from v2_params_initial_values for Vanillas contract as barrier_1 if on mobile (DTrader V2)', async () => {
        const symbol = '1HZ100V';
        trade_store.contract_type = 'vanillalongcall';
        trade_store.v2_params_initial_values = { strike: '+1.80' };
        trade_store.root_store = { ui: { is_mobile: true } };
        await ContractType.buildContractTypesConfig(symbol);

        const result = ContractType.getContractValues(trade_store);

        expect(result.barrier_1).toBe('+1.80');
    });
});
describe('ContractType.getDurationMinMax', () => {
    const symbol = 'frxAUDJPY';
    const contract_type = 'end';
    const contract_start_type = 'spot';
    it('should return an empty object if contract_expiry_type is given', async () => {
        await ContractType.buildContractTypesConfig(symbol);
        const contract_expiry_type = 'daily';
        const result = ContractType.getDurationMinMax(contract_type, contract_expiry_type);
        expect(result).toEqual({ duration_min_max: {} });
    });
    it('should return if contract_expiry_type is not given', async () => {
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getDurationMinMax(contract_type, contract_start_type);
        expect(result).toEqual({ duration_min_max: { daily: { max: 31536000, min: 86400 } } });
    });
});

describe('ContractType.getDurationUnit', () => {
    const symbol = 'frxAUDJPY';
    const duration_unit = 'd';
    const contract_type = 'rise_fall';
    const contract_start_type = 'spot';

    beforeEach(async () => {
        await ContractType.buildContractTypesConfig(symbol);
    });

    it('should return correct duration_unit given the input for non-Vanilla contracts', async () => {
        // Use a non-Vanilla contract type for this test
        const non_vanilla_contract_type = 'multiplier';
        const result = ContractType.getDurationUnit(duration_unit, non_vanilla_contract_type);
        expect(result).toEqual({ duration_unit: 'd' });
    });

    it('should return minutes (m) for rise_fall contract type (Vanilla)', async () => {
        // rise_fall is a Vanilla contract type, so it should always return 'm'
        const result = ContractType.getDurationUnit(duration_unit, contract_type);
        expect(result).toEqual({ duration_unit: 'm' });
    });

    it('should always return minutes (m) for all Vanilla contract types regardless of input duration_unit', async () => {
        const vanillaContractTypes = [
            'rise_fall',
            'call_put',
            'vanilla_call',
            'vanilla_put',
            'vanillalongcall',
            'vanillalongput',
            'higher_lower',
            'call',
            'put',
        ];

        // Test with different input duration units to ensure they all get reset to 'm'
        const inputDurationUnits = ['d', 'h', 't', 's'];

        vanillaContractTypes.forEach(vanilla_contract_type => {
            inputDurationUnits.forEach(input_duration => {
                const result = ContractType.getDurationUnit(input_duration, vanilla_contract_type);
                expect(result).toEqual({
                    duration_unit: 'm',
                });
            });
        });
    });

    it('should preserve original duration_unit for non-Vanilla contract types', async () => {
        const nonVanillaContractTypes = [
            'multiplier',
            'accumulator',
            'turboslong',
            'turbosshort',
            'end',
            'stay',
            'touch',
            'notouch',
        ];

        const testDurationUnit = 'h';

        nonVanillaContractTypes.forEach(non_vanilla_contract_type => {
            const result = ContractType.getDurationUnit(testDurationUnit, non_vanilla_contract_type);
            expect(result).toEqual({
                duration_unit: testDurationUnit,
            });
        });
    });

    it('should handle edge cases for Vanilla contract detection', async () => {
        // Test case sensitivity and variations
        const edgeCases = [
            { contract_type: 'RISE_FALL', expected: 'm' },
            { contract_type: 'Call_Put', expected: 'm' },
            { contract_type: 'VANILLA_CALL', expected: 'm' },
            { contract_type: 'unknown_vanilla_type', expected: 'd' }, // Should not be treated as Vanilla
            { contract_type: '', expected: 'd' }, // Empty string
        ];

        edgeCases.forEach(({ contract_type, expected }) => {
            const result = ContractType.getDurationUnit('d', contract_type);
            expect(result).toEqual({
                duration_unit: expected,
            });
        });

        // Test null and undefined separately with proper type handling
        const nullResult = ContractType.getDurationUnit('d', null as any);
        expect(nullResult).toEqual({ duration_unit: 'd' });

        const undefinedResult = ContractType.getDurationUnit('d', undefined as any);
        expect(undefinedResult).toEqual({ duration_unit: 'd' });
    });
});

describe('ContractType.getDurationUnitsList', () => {
    const symbol = 'frxAUDJPY';
    const contract_type = 'end';
    const contract_start_type = 'spot';
    it('should return correct duration_unit_list given the input', async () => {
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getDurationUnitsList(contract_type);
        expect(result).toEqual({ duration_units_list: [{ text: 'Days', value: 'd' }] });
    });
});

describe('ContractType.getFullContractTypes', () => {
    const symbol = 'frxAUDJPY';
    it('should return available_contract_types', async () => {
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getFullContractTypes();
        expect(result).not.toEqual({});
    });
});

describe('ContractType.getExpiryDate', () => {
    let duration_units_list: Parameters<typeof ContractType.getExpiryDate>[0];
    beforeEach(() => {
        duration_units_list = [
            {
                text: 'Minutes',
                value: 'm',
            },
            {
                text: 'Hours',
                value: 'h',
            },
            {
                text: 'Days',
                value: 'd',
            },
        ];
    });
    it('returns proper expiry date for endtime expiry type with intraday duration units', () => {
        const expiry_date = '2023-12-01';
        const expiry_type = 'endtime';
        const start_date = moment('2023-12-03T11:00:00') as unknown as number;
        const result = ContractType.getExpiryDate(duration_units_list, expiry_date, expiry_type, start_date);

        expect(result.expiry_date).toBe('2023-12-03');
    });
    it('returns proper expiry date for endtime expiry type without intraday duration units', () => {
        duration_units_list = [
            {
                text: 'Days',
                value: 'd',
            },
        ];
        const expiry_date = '2022-11-30';
        const expiry_type = 'endtime';
        const start_date = moment('2022-11-25') as unknown as number;
        const result = ContractType.getExpiryDate(duration_units_list, expiry_date, expiry_type, start_date);

        expect(result.expiry_date).toBe('2022-11-30');
    });
    it('returns null for non-endtime expiry types', () => {
        const expiry_date = '2023-11-30';
        const expiry_type = 'other';
        const start_date = 0;
        const result = ContractType.getExpiryDate(duration_units_list, expiry_date, expiry_type, start_date);

        expect(result.expiry_date).toBe(null);
    });
});

describe('ContractType.getExpiryTime', () => {
    type TExpiryTimeParams = Parameters<typeof ContractType.getExpiryTime>;

    let expiry_date: TExpiryTimeParams[0],
        expiry_time: TExpiryTimeParams[1],
        expiry_type: TExpiryTimeParams[2],
        market_close_times: TExpiryTimeParams[3],
        sessions: TExpiryTimeParams[4],
        start_date: TExpiryTimeParams[5],
        start_time: TExpiryTimeParams[6];

    beforeEach(() => {
        expiry_date = null;
        expiry_time = '21:00:00';
        expiry_type = 'endtime';
        market_close_times = undefined;
        sessions = [];
        start_date = 0;
        start_time = null;
    });

    it('should return null if expiry_type is not endtime', () => {
        expiry_type = 'duration';
        const result = ContractType.getExpiryTime(
            expiry_date,
            expiry_time,
            expiry_type,
            market_close_times,
            sessions,
            start_date,
            start_time
        );
        expect(result).toEqual({ expiry_time: null });
    });
    it('end_time should be first item in market_close_times array return null if its not undefined', () => {
        market_close_times = ['21:00:00'];
        (server_time_get_spy as jest.Mock).mockImplementation(
            jest.fn(() => ({
                isBefore: jest.fn(() => true),
            }))
        );
        expiry_date = '2023-12-14';
        const result = ContractType.getExpiryTime(
            expiry_date,
            expiry_time,
            expiry_type,
            market_close_times,
            sessions,
            start_date,
            start_time
        );
        expect(result).toEqual({ expiry_time: '21:00:00' });
    });
    it('should return expiry_time to be 23:55', () => {
        (server_time_get_spy as jest.Mock).mockImplementation(
            jest.fn(() => ({
                isBefore: jest.fn(() => false),
                clone: jest.fn(() => ({
                    add: () => '123',
                    subtract: () => '123',
                })),
                get: jest.fn(() => 123),
            }))
        );
        const result = ContractType.getExpiryTime(
            expiry_date,
            expiry_time,
            expiry_type,
            market_close_times,
            sessions,
            start_date,
            start_time
        );
        expect(result).toEqual({ expiry_time: '23:55' });
    });
});
describe('ContractType.getExpiryType', () => {
    let duration_units_list: Parameters<typeof ContractType.getExpiryDate>[0];
    beforeEach(() => {
        duration_units_list = [
            {
                text: 'Minutes',
                value: 'm',
            },
            {
                text: 'Hours',
                value: 'h',
            },
            {
                text: 'Days',
                value: 'd',
            },
        ];
    });
    it('should return duration as expiry type if expiry_type is null and duration_units_list.length > 0', () => {
        const expiry_type = '';
        const result = ContractType.getExpiryType(duration_units_list, expiry_type);
        expect(result).toEqual({ expiry_type: 'duration' });
    });
    it('should return duration as expiry type if duration_units_list.length is 1 and value is t', () => {
        const expiry_type = 'test';
        duration_units_list = [
            {
                text: 'Ticks',
                value: 't',
            },
        ];
        const result = ContractType.getExpiryType(duration_units_list, expiry_type);
        expect(result).toEqual({ expiry_type: 'duration' });
    });
    it('should return expiry_type null from input if duration_units_list is empty', () => {
        const expiry_type = 'test';
        duration_units_list = [];
        const result = ContractType.getExpiryType(duration_units_list, expiry_type);
        expect(result).toEqual({ expiry_type: null });
    });
});
describe('ContractType.getSessions', () => {
    const symbol = 'frxAUDJPY';
    let contract_type = 'end';
    const start_date = 1701388800;
    it('should return if array of sessions object if contract has forward_starting_options', async () => {
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getSessions(contract_type, start_date);
        expect(result).not.toEqual({});
    });
    it('should return undefined if contract does not have forward_starting_options', async () => {
        contract_type = 'high_low';
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getSessions(contract_type, start_date);
        expect(result).toEqual({ sessions: undefined });
    });
});
describe('ContractType.getStartTime', () => {
    const sessions = [{ open: moment(1234), close: moment(12345) }];
    let start_date = 1701388800;
    const start_time = '03:03';
    it('should return start_time if start_date is valid number', () => {
        const result = ContractType.getStartTime(undefined, start_date, start_time);
        expect(result).toEqual({ start_time: '23:55' });
    });
    it('should return start_time null if start_date is 0', () => {
        start_date = 0;
        const result = ContractType.getStartTime(undefined, start_date, start_time);
        expect(result).toEqual({ start_time: null });
    });
});
// getStartType function has been removed since all contracts now default to spot behavior
// This test is no longer needed as the functionality is hardcoded to 'spot'
describe('ContractType.getTradingEvents', () => {
    it('return empty array if date is empty', async () => {
        const result = await ContractType.getTradingEvents('', 'frxAUDJPY');
        expect(result).toEqual([]);
    });
    it('return proper arrays of dates and description if date is not empty', async () => {
        const result = await ContractType.getTradingEvents('2023-12-01', 'frxAUDJPY');
        expect(result).toEqual([
            { dates: 'Fridays', descrip: 'Closes early (at 20:55)' },
            { dates: '2023-12-25', descrip: 'Christmas Day' },
            { dates: '2024-01-01', descrip: "New Year's Day" },
        ]);
    });
});
describe('ContractType.getTradingTimes', () => {
    const mocked_response = { close: ['23:59:59'], open: ['00:00:00'] };
    it('return empty object if date is empty', async () => {
        const result = await ContractType.getTradingTimes('', 'frxAUDJPY');
        expect(result).toEqual({});
    });
    it('return proper array trading times for specific symbol if date and underlying are not empty', async () => {
        const result = await ContractType.getTradingTimes('2023-12-01', 'frxAUDJPY');
        expect(result).toEqual(mocked_response);
    });
    it('return array trading times for all symbols if underlying is empty', async () => {
        const result = await ContractType.getTradingTimes('2023-12-01', '');
        expect(result).toEqual({
            frxAUDAED: {
                ...mocked_response,
            },
            frxAUDJPY: {
                ...mocked_response,
            },
        });
    });
});
describe('ContractType.getContractCategories', () => {
    it('Should return non empty result object', async () => {
        const symbol = 'frxAUDJPY';
        await ContractType.buildContractTypesConfig(symbol);
        const result = ContractType.getContractCategories();
        expect(result.contract_types_list).not.toEqual({});
        expect(result.non_available_contract_types_list).not.toEqual({});
    });
});
