import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../trader-providers';
import ContractDetailsChart from '../contract-details-chart';

jest.mock('Modules/SmartChart', () => ({
    SmartChart: () => <div>Mocked Chart</div>,
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(() => ({
        pathname: '/contract/12345',
    })),
    withRouter: jest.fn(children => <div>{children}</div>),
}));
jest.mock('AppV2/Hooks/useContractDetails', () => ({
    __esModule: true,
    default: () => ({
        contract_info: {
            contract_id: 12345,
            contract_type: 'CALL',
            underlying_symbol: 'R_50',
        },
        contract: {},
        is_loading: false,
    }),
}));

jest.mock('Modules/Contract/Containers/replay-chart', () => ({
    __esModule: true,
    default: () => <div>Mocked Chart</div>,
}));

describe('Contract Replay Chart', () => {
    it('should render the chart correctly', () => {
        const store = mockStore({
            contract_replay: {
                contract_store: {
                    contract_info: {
                        contract_id: 12345,
                        contract_type: 'CALL',
                        underlying_symbol: 'R_50',
                    },
                },
            },
        });
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
