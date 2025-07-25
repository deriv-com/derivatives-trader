import React from 'react';

import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import MinMaxStakeInfo from '../min-max-stake-info';

import '@testing-library/jest-dom';

describe('<MinMaxStakeInfo/>', () => {
    const store = mockStore({});
    const mock_props = {
        className: 'trade-container__stake-field',
        currency: 'USD',
        min_stake: 0,
        max_stake: 100,
    };

    it('should be rendered correctly with both Min. stake and Max. stake', () => {
        render(
            <StoreProvider store={store}>
                <MinMaxStakeInfo {...mock_props} />
            </StoreProvider>
        );

        [screen.getByText('Min. stake'), screen.getByText('Max. stake')].forEach(stake_text => {
            expect(stake_text).toBeInTheDocument();
        });
    });
});
