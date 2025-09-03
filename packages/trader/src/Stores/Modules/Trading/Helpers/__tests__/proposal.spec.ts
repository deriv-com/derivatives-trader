import { mockStore } from '@deriv/stores';

import { createProposalRequests, getProposalInfo } from '../proposal';

describe('Proposal Helper Functions', () => {
    describe('getProposalInfo', () => {
        let mockTradeStore = mockStore({}).modules.trade;

        beforeEach(() => {
            mockTradeStore = {
                ...mockStore({}).modules.trade,
                currency: 'USD',
                basis_list: [
                    { text: 'Payout', value: 'payout' },
                    { text: 'Stake', value: 'stake' },
                ],
                basis: 'payout',
                is_vanilla: false,
                is_turbos: false,
                growth_rate: 0.03,
            };
        });

        describe('Error handling', () => {
            it('should handle proposal response with error', () => {
                const errorResponse = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    error: {
                        message: 'Invalid parameters',
                        code: 'InvalidContract',
                        details: { field: 'amount' },
                    },
                };

                const result = getProposalInfo(mockTradeStore, errorResponse);

                expect(result).toEqual({
                    profit: '0.00',
                    returns: '0.00%',
                    stake: '',
                    payout: undefined,
                    cancellation: undefined,
                    commission: undefined,
                    error_code: 'InvalidContract',
                    error_field: 'amount',
                    growth_rate: 0.03,
                    limit_order: undefined,
                    id: '',
                    message: 'Invalid parameters',
                    has_error: true,
                    has_error_details: false,
                    obj_contract_basis: {
                        text: 'Stake',
                        value: '',
                    },
                    spot: undefined,
                    spot_time: undefined,
                    validation_params: undefined,
                });
            });

            it('should handle empty proposal response', () => {
                const emptyResponse = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                };

                const result = getProposalInfo(mockTradeStore, emptyResponse);

                expect(result.has_error).toBe(false);
                expect(result.stake).toBe('');
                expect(result.profit).toBe('0.00');
                expect(result.payout).toBeUndefined();
            });
        });

        describe('Successful proposal calculations', () => {
            it('should calculate profit and returns correctly for payout basis', () => {
                const successResponse = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode:
                            'Win payout if Volatility 100 Index is strictly higher than entry spot at 15 minutes after contract start time.',
                        spot: 1234.56,
                        spot_time: 1640995200,
                        date_start: 1640995200,
                        display_value: '10',
                    },
                } as any;

                const result = getProposalInfo(mockTradeStore, successResponse);

                expect(result.profit).toBe('9.50'); // 19.5 - 10
                expect(result.returns).toBe('95.00%'); // (9.5 / 10) * 100
                expect(result.stake).toBe('10'); // ask_price
                expect(result.payout).toBe(19.5);
                expect(result.has_error).toBe(false);
                expect(result.obj_contract_basis).toEqual({
                    text: 'Stake',
                    value: '10',
                });
            });

            it('should handle stake basis correctly', () => {
                const stakeStore = {
                    ...mockTradeStore,
                    basis: 'stake',
                };

                const successResponse = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode: 'Test contract',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                    },
                } as any;

                const result = getProposalInfo(stakeStore, successResponse);

                expect(result.obj_contract_basis).toEqual({
                    text: 'Payout',
                    value: 19.5,
                });
            });

            it('should handle zero ask_price gracefully', () => {
                const zeroResponse = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 0,
                        payout: 100,
                        id: 'proposal_123',
                        longcode: 'Test contract',
                        date_start: 1640995200,
                        display_value: '0',
                        spot: 1234.56,
                        spot_time: 1640995200,
                    },
                } as any;

                const result = getProposalInfo(mockTradeStore, zeroResponse);

                expect(result.profit).toBe('100.00'); // 100 - 0
                expect(result.returns).toBe('10000.00%'); // (100 / 1) * 100 (division by 1 to avoid division by zero)
                expect(result.stake).toBe(''); // ask_price of 0 results in empty string
            });
        });

        describe('Special contract types', () => {
            it('should handle vanilla contracts', () => {
                const vanillaStore = {
                    ...mockTradeStore,
                    is_vanilla: true,
                };

                const response = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode: 'Vanilla option contract',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                    },
                } as any;

                const result = getProposalInfo(vanillaStore, response);

                expect(result.obj_contract_basis.text).toBe('Payout per point');
                expect(result.obj_contract_basis.value).toBe('');
            });

            it('should handle turbos contracts', () => {
                const turbosStore = {
                    ...mockTradeStore,
                    is_turbos: true,
                };

                const response = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode: 'Turbos contract',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                    },
                } as any;

                const result = getProposalInfo(turbosStore, response);

                expect(result.obj_contract_basis.text).toBe('Payout per point');
                expect(result.obj_contract_basis.value).toBe('');
            });
        });

        describe('Additional proposal data', () => {
            it('should include commission and cancellation when present', () => {
                const response = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        commission: 0.5,
                        cancellation: { ask_price: 1.2 },
                        id: 'proposal_123',
                        longcode: 'Contract with commission',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                    },
                } as any;

                const result = getProposalInfo(mockTradeStore, response);

                expect(result.commission).toBe(0.5);
                expect(result.cancellation).toEqual({ ask_price: 1.2 });
            });

            it('should include validation_params when present', () => {
                const response = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode: 'Contract with validation',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                        validation_params: {
                            stake: { min: '1', max: '1000' },
                            payout: { max: '5000' },
                        },
                    },
                } as any;

                const result = getProposalInfo(mockTradeStore, response);

                expect(result.validation_params).toEqual({
                    stake: { min: '1', max: '1000' },
                    payout: { max: '5000' },
                });
            });

            it('should include accumulator details with growth_rate', () => {
                const response = {
                    echo_req: { test: 'test' },
                    msg_type: 'proposal' as const,
                    proposal: {
                        ask_price: 10,
                        payout: 19.5,
                        id: 'proposal_123',
                        longcode: 'Accumulator contract',
                        date_start: 1640995200,
                        display_value: '10',
                        spot: 1234.56,
                        spot_time: 1640995200,
                        contract_details: {
                            tick_count: 5,
                            tick_passed: 2,
                        },
                    },
                } as any;

                const result = getProposalInfo(mockTradeStore, response);

                expect(result.growth_rate).toBe(0.03);
                expect(result.spot_time).toBe(1640995200);
                // Note: tick_count and tick_passed are spread from contract_details
                expect((result as any).tick_count).toBe(5);
                expect((result as any).tick_passed).toBe(2);
            });
        });
    });

    describe('createProposalRequests', () => {
        let mockTradeStore = mockStore({}).modules.trade;

        beforeEach(() => {
            mockTradeStore = {
                ...mockStore({}).modules.trade,
                amount: '100',
                basis: 'stake',
                currency: 'USD',
                symbol: 'R_100',
                duration: '5',
                duration_unit: 't',
                expiry_type: 'duration',
                form_components: ['duration', 'amount'],
                contract_type: 'CALL',
                barrier_count: 0,
            };
        });

        it('should create proposal requests for all trade types', () => {
            const store = {
                ...mockTradeStore,
                trade_types: {
                    CALL: 'Higher',
                    PUT: 'Lower',
                },
            };

            const result = createProposalRequests(store);

            expect(Object.keys(result)).toEqual(['CALL', 'PUT']);
            expect(result.CALL).toEqual({
                proposal: 1,
                subscribe: 1,
                amount: 100,
                basis: 'stake',
                contract_type: 'CALL',
                currency: 'USD',
                underlying_symbol: 'R_100',
                duration: 5,
                duration_unit: 't',
            });
            expect(result.PUT).toEqual({
                proposal: 1,
                subscribe: 1,
                amount: 100,
                basis: 'stake',
                contract_type: 'PUT',
                currency: 'USD',
                underlying_symbol: 'R_100',
                duration: 5,
                duration_unit: 't',
            });
        });

        it('should handle empty trade_types', () => {
            const store = {
                ...mockTradeStore,
                trade_types: {},
            };

            const result = createProposalRequests(store);

            expect(result).toEqual({});
        });

        it('should include start_date and start_time when provided', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { CALL: 'Higher' },
                start_date: 1640995200,
                start_time: '10:30',
            };

            const result = createProposalRequests(store);

            expect(result.CALL).toHaveProperty('date_start');
        });

        it('should handle endtime expiry type', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { CALL: 'Higher' },
                expiry_type: 'endtime',
                expiry_date: '2024-01-01',
                expiry_time: '23:59',
            };

            const result = createProposalRequests(store);

            expect(result.CALL).toHaveProperty('date_expiry');
            expect(result.CALL).not.toHaveProperty('duration');
            expect(result.CALL).not.toHaveProperty('duration_unit');
        });

        it('should include barriers for barrier contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { ASIANU: 'Asian Up' }, // Use a contract type that supports barriers
                barrier_count: 1,
                barrier: '1000',
                form_components: ['barrier'],
            };

            const result = createProposalRequests(store);

            expect(result.ASIANU).toHaveProperty('barrier', '1000');
        });

        it('should include dual barriers for range contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { RANGE: 'Stays Between' },
                barrier_count: 2,
                barrier_1: '1000',
                barrier_2: '1100',
                form_components: ['barrier'],
            };

            const result = createProposalRequests(store);

            expect(result.RANGE).toHaveProperty('barrier', '1000');
            expect(result.RANGE).toHaveProperty('barrier2', '1100');
        });

        it('should handle multiplier contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { MULTUP: 'Up' },
                contract_type: 'MULTUP', // This needs to match TRADE_TYPES.MULTIPLIER
            };

            const result = createProposalRequests(store);

            // Multiplier logic only applies when contract_type === TRADE_TYPES.MULTIPLIER
            // Since MULTUP !== MULTIPLIER, these properties won't be added
            expect(result.MULTUP).not.toHaveProperty('multiplier');
            expect(result.MULTUP).not.toHaveProperty('cancellation');
        });

        it('should handle accumulator contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { ACCU: 'Accumulator' },
                contract_type: 'ACCU', // This needs to match TRADE_TYPES.ACCUMULATOR
            };

            const result = createProposalRequests(store);

            // Accumulator logic only applies when contract_type === TRADE_TYPES.ACCUMULATOR
            // Since ACCU !== ACCUMULATOR, these properties won't be added
            expect(result.ACCU).not.toHaveProperty('growth_rate');
            // limit_order is always set to undefined in the base request, so it will have the property
            expect(result.ACCU).toHaveProperty('limit_order', undefined);
        });

        it('should handle turbos contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { TURBOSLONG: 'Turbo Long' },
                contract_type: 'TURBOSLONG',
                payout_per_point: '10',
                has_take_profit: true,
                take_profit: '100',
            };

            const result = createProposalRequests(store);

            expect(result.TURBOSLONG).toHaveProperty('payout_per_point', '10');
            expect(result.TURBOSLONG).toHaveProperty('limit_order');
            expect(result.TURBOSLONG.limit_order).toEqual({
                take_profit: 100,
            });
        });

        it('should handle last_digit contracts', () => {
            const store = {
                ...mockTradeStore,
                trade_types: { DIGITEVEN: 'Even' },
                form_components: ['last_digit'],
                last_digit: '5',
            };

            const result = createProposalRequests(store);

            expect(result.DIGITEVEN).toHaveProperty('barrier', '5');
        });
    });
});
