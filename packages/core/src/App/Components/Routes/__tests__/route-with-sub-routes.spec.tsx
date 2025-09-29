import React from 'react';
import { Redirect } from 'react-router-dom';

import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';

import RouteWithSubRoutes from '../route-with-sub-routes';

type TMockFunction = {
    path: string;
    exact?: boolean;
    render?: () => React.ReactElement;
};

// Mock components for testing
const MockComponent = () => <div data-testid='mock-component'>Mock Component</div>;

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(({ path, exact, render }: TMockFunction) => {
        // Call the render function to test the actual component logic
        const content = render ? render() : null;
        return (
            <div>
                <span>{`path param: ${path}`}</span>
                <span>{`exact param: ${exact}`}</span>
                {content}
            </div>
        );
    }),
    Redirect: jest.fn(({ to }: { to: string }) => <div data-testid='redirect'>Redirect to: {to}</div>),
}));

jest.mock('Modules/Page404', () => {
    const MockPage404 = () => <div data-testid='page-404'>Page 404</div>;
    MockPage404.displayName = 'MockPage404';
    return MockPage404;
});

// Mock location
Object.defineProperty(window, 'location', {
    value: {
        pathname: '/test-path',
    },
    writable: true,
});

afterEach(() => jest.clearAllMocks());

const createMockStore = (clientState: { is_logged_in: boolean; is_logging_in: boolean }) => {
    const store = mockStore({
        feature_flags: {
            data: {},
        },
    });
    store.client.is_logging_in = clientState.is_logging_in;
    store.client.is_logged_in = clientState.is_logged_in;
    return store;
};

describe('RouteWithSubRoutes component', () => {
    it('should render the "RouteWithSubRoutes" component', () => {
        const route = {
            getTitle: jest.fn(),
            component: Redirect,
            exact: true,
            path: '/test-path',
        };
        const store = createMockStore({ is_logged_in: true, is_logging_in: false });

        render(
            <StoreProvider store={store}>
                <RouteWithSubRoutes {...route} />
            </StoreProvider>
        );

        const span_element = screen.getByText(/path param: \/test-path/i);
        expect(span_element).toBeInTheDocument();
    });

    it('should render properties', () => {
        const route = {
            getTitle: jest.fn(),
            component: Redirect,
            exact: true,
            path: '/test-path',
        };
        const store = createMockStore({ is_logged_in: true, is_logging_in: false });

        render(
            <StoreProvider store={store}>
                <RouteWithSubRoutes {...route} />
            </StoreProvider>
        );

        const path_param = screen.getByText(/\/test-path/i);
        const exact_param = screen.getByText(/exact param: true/i);
        expect(path_param).toBeInTheDocument();
        expect(exact_param).toBeInTheDocument();
    });

    describe('Authentication tests', () => {
        it('should render component when user is logged in and route is protected', () => {
            const route = {
                getTitle: jest.fn(() => 'Test Route'),
                component: MockComponent,
                exact: true,
                path: '/protected-route',
                protected: true,
            };
            const store = createMockStore({ is_logged_in: true, is_logging_in: false });

            render(
                <StoreProvider store={store}>
                    <RouteWithSubRoutes {...route} />
                </StoreProvider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        });

        it('should render component when user is logging in and route is protected', () => {
            const route = {
                getTitle: jest.fn(() => 'Test Route'),
                component: MockComponent,
                exact: true,
                path: '/protected-route',
                protected: true,
            };
            const store = createMockStore({ is_logged_in: false, is_logging_in: true });

            render(
                <StoreProvider store={store}>
                    <RouteWithSubRoutes {...route} />
                </StoreProvider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        });

        it('should redirect to index when user is not logged in and route is protected', () => {
            const route = {
                getTitle: jest.fn(() => 'Protected Route'),
                component: MockComponent,
                exact: true,
                path: '/protected-route',
                protected: true,
            };
            const store = createMockStore({ is_logged_in: false, is_logging_in: false });

            render(
                <StoreProvider store={store}>
                    <RouteWithSubRoutes {...route} />
                </StoreProvider>
            );

            expect(screen.getByTestId('redirect')).toBeInTheDocument();
            expect(screen.getByText('Redirect to: /')).toBeInTheDocument();
        });

        it('should render component when user is not logged in and route is not protected', () => {
            const route = {
                getTitle: jest.fn(() => 'Public Route'),
                component: MockComponent,
                exact: true,
                path: '/public-route',
                protected: false,
            };
            const store = createMockStore({ is_logged_in: false, is_logging_in: false });

            render(
                <StoreProvider store={store}>
                    <RouteWithSubRoutes {...route} />
                </StoreProvider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        });

        it('should render component when route has no protected property (defaults to public)', () => {
            const route = {
                getTitle: jest.fn(() => 'Default Route'),
                component: MockComponent,
                exact: true,
                path: '/default-route',
                // No protected property - should default to public
            };
            const store = createMockStore({ is_logged_in: false, is_logging_in: false });

            render(
                <StoreProvider store={store}>
                    <RouteWithSubRoutes {...route} />
                </StoreProvider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        });
    });
});
