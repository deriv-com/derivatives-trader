import React from 'react';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../trader-providers';
import ContractDetailsChart from '../contract-details-chart';

jest.mock('Modules/SmartChart', () => ({
    SmartChart: () => <div>Mocked Chart</div>,
}));
jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(() => ({
        pathname: '/',
    })),
    withRouter: jest.fn(children => <div>{children}</div>),
}));

describe('Contract Replay Chart', () => {
    it('should render the chart correctly', () => {
        const store = mockStore({});
        const history = createBrowserHistory();

        render(
            <Router history={history}>
                <TraderProviders store={store}>
                    <ContractDetailsChart />
                </TraderProviders>
            </Router>
        );
        expect(screen.getByText('Mocked Chart')).toBeInTheDocument();
    });
});
