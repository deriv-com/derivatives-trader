import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { routes } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { render, screen, waitFor } from '@testing-library/react';

import TraderProviders from '../../../../trader-providers';
import BinaryRoutes from '../binary-routes';

// Mock the redirectToLogin function
const mockRedirectToLogin = jest.fn();
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    redirectToLogin: () => mockRedirectToLogin(),
}));

jest.mock('Modules/Contract', () => {
    return {
        __esModule: true,
        default: () => <div>Contract Details</div>,
    };
});

jest.mock('Modules/Trading', () => {
    return {
        __esModule: true,
        default: () => <div>Trader</div>,
    };
});

jest.mock('Modules/Page404', () => {
    return {
        __esModule: true,
        default: () => <div>Error 404</div>,
    };
});

describe('BinaryRoutes', () => {
    const history = createMemoryHistory();

    const mockedProps = {
        is_logged_in: true,
        is_logging_in: false,
    };

    const renderMockBinaryRoutes = (
        mockedStore: TCoreStores = mockStore({}),
        props: React.ComponentProps<typeof BinaryRoutes> = mockedProps
    ) => {
        render(
            <TraderProviders store={mockedStore}>
                <Router history={history}>
                    <BinaryRoutes {...props} />
                </Router>
            </TraderProviders>
        );
    };

    beforeEach(() => {
        mockRedirectToLogin.mockClear();
    });

    it('should render contract route', async () => {
        // Use a specific contract ID to match the parameterized route
        history.push('/contract/123456');
        renderMockBinaryRoutes(
            mockStore({
                client: {
                    is_client_store_initialized: true,
                    is_logged_in: true,
                },
            }),
            { ...mockedProps, is_logged_in: true }
        );
        await waitFor(() => {
            expect(screen.getByText('Contract Details')).toBeInTheDocument();
        });
    });

    it('should render trade route', async () => {
        history.push(routes.index);
        renderMockBinaryRoutes();
        await waitFor(() => {
            expect(screen.getByText('Trader')).toBeInTheDocument();
        });
    });

    it('should render 404 route', async () => {
        history.push('/non-existent-path');
        renderMockBinaryRoutes();
        await waitFor(() => {
            expect(screen.getByText('Error 404')).toBeInTheDocument();
        });
    });

    it('should redirect to login if not logged in and not logging in', async () => {
        // Use a specific contract ID and ensure client store is initialized
        history.push('/contract/123456');
        renderMockBinaryRoutes(
            mockStore({
                client: {
                    is_client_store_initialized: true,
                    is_logged_in: false,
                },
            }),
            { ...mockedProps, is_logged_in: false }
        );
        await waitFor(() => {
            expect(mockRedirectToLogin).toHaveBeenCalled();
        });
    });
});
