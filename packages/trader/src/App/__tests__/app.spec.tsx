import React from 'react';
import moment from 'moment';

import { mockStore } from '@deriv/stores';
import { render } from '@testing-library/react';

import App from '../app';

const rootStore = mockStore({
    common: {
        server_time: moment(new Date()).utc(),
    },
    client: {
        is_landing_company_loaded: true,
        is_logged_in: false,
    },
});

const mockWs = {
    activeSymbols: jest.fn(),
    authorized: {
        activeSymbols: jest.fn(),
        subscribeProposalOpenContract: jest.fn(),
        send: jest.fn(),
    },
    buy: jest.fn(),
    storage: {
        contractsFor: jest.fn(),
        send: jest.fn(),
    },
    contractUpdate: jest.fn(),
    contractUpdateHistory: jest.fn(),
    subscribeTicksHistory: jest.fn(),
    forgetStream: jest.fn(),
    forget: jest.fn(),
    forgetAll: jest.fn(),
    send: jest.fn(),
    subscribeProposal: jest.fn(),
    subscribeTicks: jest.fn(),
    time: jest.fn(),
    tradingTimes: jest.fn(),
    wait: jest.fn(),
};

jest.mock('App/Containers/Routes/routes', () => jest.fn(() => <div>Router</div>));
jest.mock('App/Containers/trade-footer-extensions', () => jest.fn(() => <div>TradeFooterExtensions</div>));

describe('App', () => {
    it('should render the app component', () => {
        const { container } = render(
            <App
                passthrough={{
                    root_store: rootStore,
                    WS: mockWs,
                }}
            />
        );
        expect(container).toBeInTheDocument();
    });

    it('should call setPromptHandler on unmount', () => {
        const setPromptHandler = jest.fn();
        rootStore.ui.setPromptHandler = setPromptHandler;
        const { unmount } = render(
            <App
                passthrough={{
                    root_store: rootStore,
                    WS: mockWs,
                }}
            />
        );
        unmount();
        expect(setPromptHandler).toHaveBeenCalledWith(false);
    });
});
