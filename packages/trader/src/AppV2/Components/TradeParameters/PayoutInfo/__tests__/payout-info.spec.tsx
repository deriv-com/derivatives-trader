import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

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
});
