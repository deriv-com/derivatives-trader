import React from 'react';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { StoreProvider, mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import { useDevice } from '@deriv-com/ui';
import HeaderLegacy from '../header-legacy';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(() => ({ pathname: '/some-path' })),
    useHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

jest.mock('@deriv-com/ui', () => ({
    ...jest.requireActual('@deriv-com/ui'),
    useDevice: jest.fn(() => ({ isDesktop: true })),
}));

jest.mock('App/Components/Layout/Header', () => ({
    MenuLinks: jest.fn(() => <div data-testid='dt_menu_links'>Menu Links</div>),
}));

jest.mock('App/Components/Layout/Header/Components/Preloader', () => ({
    AccountsInfoLoader: jest.fn(() => <div data-testid='dt_accounts_info_loader'>Accounts Info Loader</div>),
}));

jest.mock('App/Components/Layout/Header/toggle-menu-drawer.jsx', () =>
    jest.fn(() => <div data-testid='dt_toggle_menu_drawer'>Toggle Menu Drawer</div>)
);

jest.mock('App/Containers/new-version-notification', () =>
    jest.fn(() => <div data-testid='dt_new_version_notification'>New Version Notification</div>)
);

jest.mock('../brand-short-logo', () => jest.fn(() => <div data-testid='dt_brand_short_logo'>Brand Short Logo</div>));

jest.mock('../header-account-actions', () =>
    jest.fn(() => <div data-testid='dt_header_account_actions'>Header Account Actions</div>)
);

jest.mock('../home-button', () => jest.fn(() => <div data-testid='dt_home_button'>Home Button</div>));

describe('HeaderLegacy', () => {
    const history = createBrowserHistory();

    const default_mock_store = {
        client: {
            currency: 'USD',
            is_logged_in: true,
            is_logging_in: false,
        },
        ui: {
            header_extension: null,
            is_app_disabled: false,
            is_route_modal_on: false,
        },
        notifications: {
            addNotificationMessage: jest.fn(),
            client_notifications: {
                new_version_available: {
                    key: 'new_version_available',
                    type: 'warning',
                    message: 'New version available',
                    should_show_again: true,
                },
            },
            removeNotificationMessage: jest.fn(),
        },
    };

    const renderComponent = (store_override = {}) => {
        const mock_store_instance = mockStore({ ...default_mock_store, ...store_override });
        return render(
            <Router history={history}>
                <StoreProvider store={mock_store_instance}>
                    <HeaderLegacy />
                </StoreProvider>
            </Router>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useDevice as jest.Mock).mockReturnValue({ isDesktop: true });
    });

    describe('Basic Rendering', () => {
        it('should render header with basic components', () => {
            renderComponent();

            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByTestId('dt_brand_short_logo')).toBeInTheDocument();
            expect(screen.getByTestId('dt_menu_links')).toBeInTheDocument();
            expect(screen.getByTestId('dt_new_version_notification')).toBeInTheDocument();
        });

        it('should render header with correct CSS classes', () => {
            renderComponent();

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('header');
            expect(header).not.toHaveClass('header--is-disabled');
        });
    });

    describe('Desktop Layout', () => {
        beforeEach(() => {
            (useDevice as jest.Mock).mockReturnValue({ isDesktop: true });
        });

        it('should render Home button when logged in', () => {
            renderComponent();

            expect(screen.getByTestId('dt_home_button')).toBeInTheDocument();
            expect(screen.queryByTestId('dt_toggle_menu_drawer')).not.toBeInTheDocument();
        });

        it('should not render Home button when not logged in', () => {
            renderComponent({
                client: {
                    ...default_mock_store.client,
                    is_logged_in: false,
                },
            });

            expect(screen.queryByTestId('dt_home_button')).not.toBeInTheDocument();
        });
    });

    describe('Mobile Layout', () => {
        beforeEach(() => {
            (useDevice as jest.Mock).mockReturnValue({ isDesktop: false });
        });

        it('should render ToggleMenuDrawer on mobile', () => {
            renderComponent();

            expect(screen.getByTestId('dt_toggle_menu_drawer')).toBeInTheDocument();
            expect(screen.queryByTestId('dt_home_button')).not.toBeInTheDocument();
        });

        it('should render header extension when logged in and extension exists', () => {
            const header_extension = <div data-testid='dt_header_extension'>Header Extension</div>;

            renderComponent({
                ui: {
                    ...default_mock_store.ui,
                    header_extension,
                },
            });

            expect(screen.getByTestId('dt_header_extension')).toBeInTheDocument();
        });

        it('should not render header extension when not logged in', () => {
            const header_extension = <div data-testid='dt_header_extension'>Header Extension</div>;

            renderComponent({
                client: {
                    ...default_mock_store.client,
                    is_logged_in: false,
                },
                ui: {
                    ...default_mock_store.ui,
                    header_extension,
                },
            });

            expect(screen.queryByTestId('dt_header_extension')).not.toBeInTheDocument();
        });
    });

    describe('Loading States', () => {
        it('should render AccountsInfoLoader when is_logging_in is true', () => {
            renderComponent({
                client: {
                    ...default_mock_store.client,
                    is_logging_in: true,
                },
            });

            expect(screen.getByTestId('dt_accounts_info_loader')).toBeInTheDocument();
            expect(screen.queryByTestId('dt_header_account_actions')).not.toBeInTheDocument();
        });

        it('should render HeaderAccountActions when not in loading states', () => {
            renderComponent();

            expect(screen.getByTestId('dt_header_account_actions')).toBeInTheDocument();
            expect(screen.queryByTestId('dt_accounts_info_loader')).not.toBeInTheDocument();
        });
    });

    describe('CSS Classes and Styling', () => {
        it('should add header--is-disabled class when is_app_disabled is true', () => {
            renderComponent({
                ui: {
                    ...default_mock_store.ui,
                    is_app_disabled: true,
                },
            });

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('header--is-disabled');
        });

        it('should add header--is-disabled class when is_route_modal_on is true', () => {
            renderComponent({
                ui: {
                    ...default_mock_store.ui,
                    is_route_modal_on: true,
                },
            });

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('header--is-disabled');
        });

        it('should add header--is-disabled class when both flags are true', () => {
            renderComponent({
                ui: {
                    ...default_mock_store.ui,
                    is_app_disabled: true,
                    is_route_modal_on: true,
                },
            });

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('header--is-disabled');
        });
    });

    describe('Event Handlers', () => {
        it('should add and remove IgnorePWAUpdate event listener', () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            const { unmount } = renderComponent();

            expect(addEventListenerSpy).toHaveBeenCalledWith('IgnorePWAUpdate', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('IgnorePWAUpdate', expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });
});
