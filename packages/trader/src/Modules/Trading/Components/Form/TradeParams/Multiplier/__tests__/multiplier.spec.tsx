import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../../../../trader-providers';
import Multiplier from '../multiplier';

const mocked_props = {
    modules: {
        trade: {
            multiplier: 10,
            multiplier_range_list: [],
            onChange: jest.fn(),
            symbol: '1HZ100V',
        },
    },
};
describe('<Multiplier/>', () => {
    const mockMultiplier = () => {
        return (
            <TraderProviders store={mockStore(mocked_props)}>
                <Multiplier />
            </TraderProviders>
        );
    };

    it('should render component', () => {
        render(mockMultiplier());

        expect(screen.getByTestId('multiplier')).toBeInTheDocument();
    });
});
