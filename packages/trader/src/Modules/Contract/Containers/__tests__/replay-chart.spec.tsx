import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../trader-providers';
import ReplayChart from '../replay-chart';

jest.mock('Modules/SmartChart', () => ({
    SmartChart: () => <div data-testid='dt_mock_chart'>Mocked Chart</div>,
}));

describe('<ReplayChart>', () => {
    const props = {
        is_dark_theme_prop: true,
        is_accumulator_contract: true,
        is_reset_contract: false,
    };

    const store = mockStore({});

    it('renders SmartChart component with correct props', () => {
        render(
            <TraderProviders store={store}>
                <ReplayChart {...props} />
            </TraderProviders>
        );

        const mockChartElement = screen.getByTestId('dt_mock_chart');
        expect(mockChartElement).toBeInTheDocument();
        expect(screen.getByText('Mocked Chart')).toBeInTheDocument();
    });
});
