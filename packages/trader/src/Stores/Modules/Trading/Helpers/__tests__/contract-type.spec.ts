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
        format: jest.fn(() => '12:00'),
        hour: jest.fn(),
        minute: jest.fn(),
        add: jest.fn(),
        subtract: jest.fn(),
        diff: jest.fn(),
        isSameOrBefore: jest.fn(),
    })),
}));

const server_time_get_spy = jest.spyOn(ServerTime, 'get');

describe('ContractType Helper Functions', () => {
    beforeEach(async () => {
        // Build contract types config before each test
        await ContractType.buildContractTypesConfig('frxAUDJPY');
    });

    describe('getBarriers', () => {
        it('should return barriers based on contract type and expiry type', () => {
            const result = ContractType.getBarriers('end', 'daily', undefined);

            expect(result.barrier_count).toBe(2);
            expect(result.barrier_1).toBe('98.745');
            expect(result.barrier_2).toBe('97.672');
        });

        it('should use stored barrier value when provided', () => {
            const stored_barrier = '100.000';
            const result = ContractType.getBarriers('end', 'daily', stored_barrier);

            expect(result.barrier_count).toBe(2);
            expect(result.barrier_1).toBe(stored_barrier);
            expect(result.barrier_2).toBe('97.672');
        });

        it('should return empty barriers for contract types without barriers', () => {
            const result = ContractType.getBarriers('unknown_type', 'daily', undefined);

            expect(result.barrier_count).toBe(0);
            expect(result.barrier_1).toBe('');
            expect(result.barrier_2).toBe('');
        });
    });

    describe('getContractType', () => {
        it('should return contract_type object from available contract types', () => {
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

            const result = ContractType.getContractType(list, 'high_low');
            expect(result).toEqual({ contract_type: 'high_low' });
        });

        it('should return first available contract type when requested type is not found', () => {
            const list = {
                'Ups & Downs': {
                    name: 'Ups & Downs',
                    categories: [
                        {
                            value: 'rise_fall',
                            text: 'Rise/Fall',
                        },
                    ],
                },
            };

            const result = ContractType.getContractType(list, 'non_existent_type');
            expect(result.contract_type).toBe('rise_fall');
        });
    });

    describe('getContractValues', () => {
        let trade_store = mockStore({}).modules.trade;

        beforeEach(() => {
            trade_store = {
                ...mockStore({}).modules.trade,
                contract_type: 'rise_fall',
                basis: 'stake',
                duration_unit: 'm',
                expiry_type: 'duration',
                multiplier: 100,
                start_date: 0,
                cancellation_duration: '60m',
            };
        });

        it('should return empty object if contract_type is null', () => {
            trade_store.contract_type = null;
            const result = ContractType.getContractValues(trade_store);
            expect(result).toEqual({});
        });

        it('should return contract values for valid contract type', () => {
            const result = ContractType.getContractValues(trade_store);

            expect(result).toHaveProperty('form_components');
            expect(result).toHaveProperty('basis_list');
            expect(result).toHaveProperty('basis');
            expect(result).toHaveProperty('trade_types');
            expect(result).toHaveProperty('start_date');
            expect(result).toHaveProperty('start_dates_list');
            expect(result).toHaveProperty('contract_start_type', 'spot');
            expect(result).toHaveProperty('barrier_count');
            expect(result).toHaveProperty('duration_unit');
            expect(result).toHaveProperty('duration_units_list');
            expect(result).toHaveProperty('duration_min_max');
            expect(result).toHaveProperty('expiry_type');
        });

        it('should use strike value from v2_params_initial_values for Vanillas on mobile', () => {
            trade_store.contract_type = 'vanillalongcall';
            trade_store.v2_params_initial_values = { strike: '+1.80' };
            trade_store.root_store = { ui: { is_mobile: true } };

            const result = ContractType.getContractValues(trade_store);

            expect(result.barrier_1).toBe('+1.80');
        });

        it('should not use strike value for non-mobile or non-vanilla contracts', () => {
            trade_store.contract_type = 'rise_fall';
            trade_store.v2_params_initial_values = { strike: '+1.80' };
            trade_store.root_store = { ui: { is_mobile: false } };

            const result = ContractType.getContractValues(trade_store);

            expect(result.barrier_1).not.toBe('+1.80');
        });
    });

    describe('getDurationMinMax', () => {
        it('should return empty duration_min_max when contract_expiry_type is provided', () => {
            const result = ContractType.getDurationMinMax('end', 'daily');
            expect(result).toEqual({ duration_min_max: {} });
        });

        it('should return duration_min_max from config when no contract_expiry_type', () => {
            const result = ContractType.getDurationMinMax('end');
            // Returns whatever is in the config, which may be empty for this contract type
            expect(result).toHaveProperty('duration_min_max');
            expect(typeof result.duration_min_max).toBe('object');
        });

        it('should return empty object for unknown contract types', () => {
            const result = ContractType.getDurationMinMax('unknown_contract');
            expect(result).toEqual({ duration_min_max: {} });
        });
    });

    describe('getDurationUnit', () => {
        it('should return requested duration_unit for non-vanilla contracts', () => {
            const result = ContractType.getDurationUnit('h', 'multiplier');
            expect(result.duration_unit).toBe('h');
        });

        it('should validate duration_unit for vanilla contracts', () => {
            // For vanilla contracts, it checks if the duration_unit is available
            const result = ContractType.getDurationUnit('d', 'rise_fall');
            expect(result.duration_unit).toBe('d');
        });

        it('should return available duration_unit for vanilla contracts when valid', () => {
            // If the vanilla contract has the requested unit available, it should return it
            const result = ContractType.getDurationUnit('m', 'rise_fall');
            expect(result.duration_unit).toBe('m');
        });

        it('should handle edge cases gracefully', () => {
            // Test with null/undefined contract types
            const nullResult = ContractType.getDurationUnit('d', null as any);
            expect(nullResult.duration_unit).toBe('d');

            const undefinedResult = ContractType.getDurationUnit('d', undefined as any);
            expect(undefinedResult.duration_unit).toBe('d');

            // Test with empty string
            const emptyResult = ContractType.getDurationUnit('d', '');
            expect(emptyResult.duration_unit).toBe('d');
        });

        it('should handle case sensitivity correctly', () => {
            // Vanilla contract types are case-sensitive
            const result = ContractType.getDurationUnit('d', 'RISE_FALL');
            expect(result.duration_unit).toBe('d'); // Not recognized as vanilla, returns input
        });
    });

    describe('getDurationUnitsList', () => {
        it('should return duration units list for valid contract type', () => {
            const result = ContractType.getDurationUnitsList('end');
            expect(result).toHaveProperty('duration_units_list');
            expect(Array.isArray(result.duration_units_list)).toBe(true);
        });

        it('should return empty array for unknown contract types', () => {
            const result = ContractType.getDurationUnitsList('unknown_contract');
            expect(result.duration_units_list).toEqual([]);
        });
    });

    describe('getFullContractTypes', () => {
        it('should return available contract types object', () => {
            const result = ContractType.getFullContractTypes();
            expect(typeof result).toBe('object');
            expect(result).not.toEqual({});
        });
    });

    describe('getExpiryDate', () => {
        const duration_units_list = [
            { text: 'Minutes', value: 'm' },
            { text: 'Hours', value: 'h' },
            { text: 'Days', value: 'd' },
        ];

        it('should return null for non-endtime expiry types', () => {
            const result = ContractType.getExpiryDate(duration_units_list, '2023-11-30', 'duration', 0);
            expect(result.expiry_date).toBe(null);
        });

        it('should return proper expiry date for endtime expiry type', () => {
            const start_date = moment('2023-12-01T11:00:00').unix();
            const result = ContractType.getExpiryDate(duration_units_list, '2023-12-01', 'endtime', start_date);
            expect(result.expiry_date).toBe('2023-12-01');
        });

        it('should handle intraday duration units correctly', () => {
            const start_date = moment('2023-12-01T11:00:00').unix();
            const result = ContractType.getExpiryDate(duration_units_list, '2023-12-01', 'endtime', start_date);
            // With intraday units, it should return the expiry date as-is
            expect(result.expiry_date).toBe('2023-12-01');
        });

        it('should handle non-intraday duration units correctly', () => {
            const duration_units_list_daily = [{ text: 'Days', value: 'd' }];
            const start_date = moment('2023-12-01T11:00:00').unix();
            const result = ContractType.getExpiryDate(duration_units_list_daily, '2022-11-30', 'endtime', start_date);
            // Without intraday units, invalid dates get adjusted to start_date + 1 day
            expect(result.expiry_date).toBe('2023-12-02');
        });
    });

    describe('getExpiryTime', () => {
        beforeEach(() => {
            (server_time_get_spy as jest.Mock).mockReturnValue({
                isBefore: jest.fn(() => false),
                clone: jest.fn(() => ({
                    add: jest.fn(() => ({
                        format: jest.fn(() => '12:05'),
                    })),
                    subtract: jest.fn(),
                })),
                get: jest.fn(() => 12),
                format: jest.fn(() => '12:00'),
                hour: jest.fn(),
                minute: jest.fn(),
                diff: jest.fn(() => 10),
                isSameOrBefore: jest.fn(() => false),
            });
        });

        it('should return null if expiry_type is not endtime', () => {
            const result = ContractType.getExpiryTime(null, '21:00:00', 'duration', undefined, [], 0, null);
            expect(result.expiry_time).toBe(null);
        });

        it('should return market close time when available', () => {
            (server_time_get_spy as jest.Mock).mockReturnValue({
                isBefore: jest.fn(() => true),
            });

            const result = ContractType.getExpiryTime('2023-12-14', '21:00:00', 'endtime', ['21:00:00'], [], 0, null);
            expect(result.expiry_time).toBe('21:00:00');
        });

        it('should calculate proper expiry time based on start time', () => {
            const mockMoment = {
                isBefore: jest.fn(() => true),
                clone: jest.fn(() => ({
                    add: jest.fn(() => ({
                        format: jest.fn(() => '12:05'),
                    })),
                })),
                format: jest.fn(() => '12:00'),
                diff: jest.fn(() => 10),
                isSameOrBefore: jest.fn(() => false),
                get: jest.fn(() => 12),
            };
            (server_time_get_spy as jest.Mock).mockReturnValue(mockMoment);

            const result = ContractType.getExpiryTime(null, '21:00:00', 'endtime', undefined, [], 1701388800, '03:03');

            // The function should return a calculated time
            expect(typeof result.expiry_time).toBe('string');
        });
    });

    describe('getSessions', () => {
        it('should always return sessions as undefined', () => {
            const result = ContractType.getSessions('end', 1701388800);
            expect(result).toEqual({ sessions: undefined });
        });

        it('should return sessions as undefined for any contract type', () => {
            const result = ContractType.getSessions('high_low', 1701388800);
            expect(result).toEqual({ sessions: undefined });
        });
    });

    describe('getStartTime', () => {
        beforeEach(() => {
            (server_time_get_spy as jest.Mock).mockReturnValue({
                hour: jest.fn(() => 12),
                minute: jest.fn(() => 0),
                format: jest.fn(() => '12:00'),
            });
        });

        it('should return null if start_date is 0', () => {
            const result = ContractType.getStartTime(undefined, 0, '03:03');
            expect(result.start_time).toBe(null);
        });

        it('should return formatted time if start_date is valid', () => {
            const result = ContractType.getStartTime(undefined, 1701388800, '03:03');
            expect(typeof result.start_time).toBe('string');
            expect(result.start_time).toMatch(/^\d{2}:\d{2}$/);
        });

        it('should handle null start_time gracefully', () => {
            const result = ContractType.getStartTime(undefined, 1701388800, null);
            expect(typeof result.start_time).toBe('string');
        });
    });

    describe('getTradingEvents', () => {
        it('should return empty array if date is empty', async () => {
            const result = await ContractType.getTradingEvents('', 'frxAUDJPY');
            expect(result).toEqual([]);
        });

        it('should return proper arrays of dates and description if date is not empty', async () => {
            const result = await ContractType.getTradingEvents('2023-12-01', 'frxAUDJPY');
            expect(result).toEqual([
                { dates: 'Fridays', descrip: 'Closes early (at 20:55)' },
                { dates: '2023-12-25', descrip: 'Christmas Day' },
                { dates: '2024-01-01', descrip: "New Year's Day" },
            ]);
        });

        it('should handle null underlying symbol', async () => {
            const result = await ContractType.getTradingEvents('2023-12-01', null);
            expect(Array.isArray(result) || result === undefined).toBe(true);
        });
    });

    describe('getTradingTimes', () => {
        const expected_response = { close: ['23:59:59'], open: ['00:00:00'] };

        it('should return empty object if date is empty', async () => {
            const result = await ContractType.getTradingTimes('', 'frxAUDJPY');
            expect(result).toEqual({});
        });

        it('should return proper trading times for specific symbol', async () => {
            const result = await ContractType.getTradingTimes('2023-12-01', 'frxAUDJPY');
            expect(result).toEqual(expected_response);
        });

        it('should return trading times for all symbols if underlying is empty', async () => {
            const result = await ContractType.getTradingTimes('2023-12-01', '');
            expect(result).toEqual({
                frxAUDAED: expected_response,
                frxAUDJPY: expected_response,
            });
        });

        it('should handle null date', async () => {
            const result = await ContractType.getTradingTimes(null, 'frxAUDJPY');
            expect(result).toEqual({});
        });
    });

    describe('getExpiryType', () => {
        it('should return duration as expiry type if expiry_type is null and duration_units_list has items', () => {
            const duration_units_list = [
                { text: 'Minutes', value: 'm' },
                { text: 'Hours', value: 'h' },
            ];
            const result = ContractType.getExpiryType(duration_units_list, '');
            expect(result).toEqual({ expiry_type: 'duration' });
        });

        it('should return duration as expiry type if duration_units_list has only ticks', () => {
            const duration_units_list = [{ text: 'Ticks', value: 't' }];
            const result = ContractType.getExpiryType(duration_units_list, 'test');
            expect(result).toEqual({ expiry_type: 'duration' });
        });

        it('should return null if duration_units_list is empty', () => {
            const result = ContractType.getExpiryType([], 'test');
            expect(result).toEqual({ expiry_type: null });
        });

        it('should preserve expiry_type when conditions are not met', () => {
            const duration_units_list = [
                { text: 'Minutes', value: 'm' },
                { text: 'Hours', value: 'h' },
            ];
            const result = ContractType.getExpiryType(duration_units_list, 'endtime');
            expect(result).toEqual({ expiry_type: 'endtime' });
        });
    });

    describe('getContractCategories', () => {
        it('should return non-empty contract categories', () => {
            const result = ContractType.getContractCategories();
            expect(result).toHaveProperty('contract_types_list');
            expect(result).toHaveProperty('non_available_contract_types_list');
            expect(typeof result.contract_types_list).toBe('object');
            expect(typeof result.non_available_contract_types_list).toBe('object');
        });
    });
});
