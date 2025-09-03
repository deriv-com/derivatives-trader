import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import { TRADE_TYPES } from '@deriv/shared';

import TraderProviders from '../../../../../trader-providers';
import PayoutInfo from '../payout-info';

const label = 'Payout';

describe('<PayoutInfo />', () => {
    let default_mock_store: ReturnType<typeof mockStore>;

    beforeEach(
        () =>
            (default_mock_store = mockStore({
                modules: {
                    trade: {
                        ...mockStore({}),
                        trade_type_tab: 'ONETOUCH',
                        currency: 'USD',
                        proposal_info: {
                            ONETOUCH: {
                                obj_contract_basis: {
                                    text: 'payout',
                                    value: 123,
                                },
                            },
                        },
                    },
                },
            }))
    );
    const mockedPayoutInfo = () =>
        render(
            <TraderProviders store={default_mock_store}>
                <PayoutInfo />
            </TraderProviders>
        );

    it('renders loader if payout is falsy but there is no API error', () => {
        default_mock_store.modules.trade.proposal_info = {};
        mockedPayoutInfo();

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByTestId('dt_skeleton')).toBeInTheDocument();
        expect(screen.queryByText('123.00 USD')).not.toBeInTheDocument();
    });
    it('displays the correct label, value and currency', () => {
        mockedPayoutInfo();

        expect(screen.getByText('123.00 USD')).toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(label)).not.toHaveClass('trade-params__text--disabled');
    });
    it('applies specific className if is_market_closed === true', () => {
        default_mock_store.modules.trade.is_market_closed = true;
        mockedPayoutInfo();

        expect(screen.getByText(label)).toHaveClass('trade-params__text--disabled');
    });

    describe('Higher/Lower key mapping', () => {
        it('displays payout correctly for Higher/Lower contracts with CALL trade_type_tab and HIGHER proposal key', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'CALL';
            default_mock_store.modules.trade.proposal_info = {
                HIGHER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 456,
                    },
                },
                LOWER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 123,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText('456.00 USD')).toBeInTheDocument();
            expect(screen.getByText(label)).toBeInTheDocument();
        });

        it('displays payout correctly for Higher/Lower contracts with PUT trade_type_tab and LOWER proposal key', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'PUT';
            default_mock_store.modules.trade.proposal_info = {
                HIGHER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 123,
                    },
                },
                LOWER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 789,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText('789.00 USD')).toBeInTheDocument();
            expect(screen.getByText(label)).toBeInTheDocument();
        });

        it('shows skeleton loader when Higher/Lower contract has CALL trade_type_tab but no HIGHER proposal key', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'CALL';
            default_mock_store.modules.trade.proposal_info = {
                LOWER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 789,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText(label)).toBeInTheDocument();
            expect(screen.getByTestId('dt_skeleton')).toBeInTheDocument();
            expect(screen.queryByText('789.00 USD')).not.toBeInTheDocument();
        });

        it('shows skeleton loader when Higher/Lower contract has PUT trade_type_tab but no LOWER proposal key', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'PUT';
            default_mock_store.modules.trade.proposal_info = {
                HIGHER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 456,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText(label)).toBeInTheDocument();
            expect(screen.getByTestId('dt_skeleton')).toBeInTheDocument();
            expect(screen.queryByText('456.00 USD')).not.toBeInTheDocument();
        });

        it('falls back to direct key mapping for Higher/Lower contracts when both CALL/PUT and HIGHER/LOWER keys exist', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'CALL';
            default_mock_store.modules.trade.proposal_info = {
                CALL: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 111,
                    },
                },
                HIGHER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 222,
                    },
                },
            };
            mockedPayoutInfo();

            // Should use CALL key directly when both exist
            expect(screen.getByText('111.00 USD')).toBeInTheDocument();
            expect(screen.getByText(label)).toBeInTheDocument();
        });

        it('handles error state correctly for Higher/Lower contracts', () => {
            default_mock_store.modules.trade.contract_type = TRADE_TYPES.HIGH_LOW;
            default_mock_store.modules.trade.trade_type_tab = 'CALL';
            default_mock_store.modules.trade.proposal_info = {
                HIGHER: {
                    has_error: true,
                    obj_contract_basis: {
                        text: 'payout',
                        value: null,
                    },
                },
                LOWER: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: null,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText(label)).toBeInTheDocument();
            expect(screen.getByText('- USD')).toBeInTheDocument();
        });
    });

    describe('Backward compatibility', () => {
        it('continues to work correctly for non-Higher/Lower contracts', () => {
            default_mock_store.modules.trade.contract_type = 'RISE_FALL';
            default_mock_store.modules.trade.trade_type_tab = 'CALL';
            default_mock_store.modules.trade.proposal_info = {
                CALL: {
                    obj_contract_basis: {
                        text: 'payout',
                        value: 999,
                    },
                },
            };
            mockedPayoutInfo();

            expect(screen.getByText('999.00 USD')).toBeInTheDocument();
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });
});
