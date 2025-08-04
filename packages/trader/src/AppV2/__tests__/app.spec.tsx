import React from 'react';
import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import type { TWebSocket } from 'Types';
import App from '../app';

// Mock all heavy components and providers
jest.mock('../../trader-providers', () => {
    const MockedTraderProviders = ({ children }: { children: React.ReactNode }) => (
        <div data-testid='trader-providers'>{children}</div>
    );
    MockedTraderProviders.displayName = 'MockedTraderProviders';
    return MockedTraderProviders;
});

jest.mock('@deriv/reports/src/Stores/useReportsStores', () => ({
    ReportsStoreProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid='reports-store-provider'>{children}</div>
    ),
}));

jest.mock('Stores/Providers/modules-providers', () => {
    const MockedModulesProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-testid='modules-provider'>{children}</div>
    );
    MockedModulesProvider.displayName = 'MockedModulesProvider';
    return MockedModulesProvider;
});

jest.mock('@deriv-com/quill-ui', () => ({
    NotificationsProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid='notifications-provider'>{children}</div>
    ),
    SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid='snackbar-provider'>{children}</div>
    ),
}));

jest.mock('../Components/ServicesErrorSnackbar', () => {
    const MockedServicesErrorSnackbar = () => <div data-testid='services-error-snackbar' />;
    MockedServicesErrorSnackbar.displayName = 'MockedServicesErrorSnackbar';
    return MockedServicesErrorSnackbar;
});

jest.mock('../Containers/Notifications', () => {
    const MockedNotifications = () => <div data-testid='notifications' />;
    MockedNotifications.displayName = 'MockedNotifications';
    return MockedNotifications;
});

jest.mock('../Routes/router', () => {
    const MockedRouter = () => <div data-testid='router' />;
    MockedRouter.displayName = 'MockedRouter';
    return MockedRouter;
});

jest.mock('App/init-store', () => jest.fn(root_store => root_store));

jest.mock('../../Analytics', () => ({
    sendDtraderV2OpenToAnalytics: jest.fn(),
}));

describe('App', () => {
    let mockRootStore: ReturnType<typeof mockStore>, mockWs: TWebSocket;

    beforeEach(() => {
        mockRootStore = mockStore({});
        mockWs = {} as TWebSocket;
        jest.clearAllMocks();
    });

    it('should render the app component with all providers in correct hierarchy', () => {
        render(
            <App
                passthrough={{
                    root_store: mockRootStore,
                    WS: mockWs,
                }}
            />
        );

        // Verify all providers are rendered
        expect(screen.getByTestId('trader-providers')).toBeInTheDocument();
        expect(screen.getByTestId('reports-store-provider')).toBeInTheDocument();
        expect(screen.getByTestId('modules-provider')).toBeInTheDocument();
        expect(screen.getByTestId('notifications-provider')).toBeInTheDocument();
        expect(screen.getByTestId('snackbar-provider')).toBeInTheDocument();

        // Verify core components are rendered
        expect(screen.getByTestId('services-error-snackbar')).toBeInTheDocument();
        expect(screen.getByTestId('notifications')).toBeInTheDocument();
        expect(screen.getByTestId('router')).toBeInTheDocument();
    });

    it('should render providers in the correct nesting order', () => {
        render(
            <App
                passthrough={{
                    root_store: mockRootStore,
                    WS: mockWs,
                }}
            />
        );

        // Verify the provider hierarchy by checking if child providers are nested within parent providers
        const traderProvider = screen.getByTestId('trader-providers');
        const reportsProvider = screen.getByTestId('reports-store-provider');
        const modulesProvider = screen.getByTestId('modules-provider');
        const notificationsProvider = screen.getByTestId('notifications-provider');
        const snackbarProvider = screen.getByTestId('snackbar-provider');

        expect(traderProvider).toContainElement(reportsProvider);
        expect(reportsProvider).toContainElement(modulesProvider);
        expect(modulesProvider).toContainElement(notificationsProvider);
        expect(notificationsProvider).toContainElement(snackbarProvider);
    });

    it('should call setPromptHandler(false) on unmount', () => {
        const setPromptHandler = jest.fn();
        mockRootStore.ui.setPromptHandler = setPromptHandler;

        const { unmount } = render(
            <App
                passthrough={{
                    root_store: mockRootStore,
                    WS: mockWs,
                }}
            />
        );

        expect(setPromptHandler).not.toHaveBeenCalled();

        unmount();

        expect(setPromptHandler).toHaveBeenCalledWith(false);
    });
});
