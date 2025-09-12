import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountActions } from '../account-actions';
import { useLocation } from 'react-router-dom';
import { formatMoney } from '@deriv/shared';
import { useDevice } from '@deriv-com/ui';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

jest.mock('@deriv/stores', () => ({
    useStore: jest.fn(),
}));

jest.mock('@deriv/api', () => ({
    useAccountSettingsRedirect: jest.fn().mockReturnValue({
        redirect_url: '/account/personal-details',
        mobile_redirect_url: '/account',
    }),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    formatMoney: jest.fn(),
    isTabletOs: false,
    routes: {
        cashier: '/cashier',
        personal_details: '/account/personal-details',
    },
}));

jest.mock('@deriv-com/ui', () => ({
    useDevice: jest.fn(),
}));

jest.mock('../login-button-v2.tsx', () => ({
    LoginButtonV2: () => <div data-testid='dt_login_button'>Login Button V2</div>,
}));

jest.mock('../signup-button.jsx', () => ({
    SignupButton: () => <div data-testid='dt_signup_button'>Signup Button</div>,
}));

jest.mock('../toggle-notifications.jsx', () => ({
    __esModule: true,
    default: ({
        count,
        is_visible,
        toggleDialog,
    }: {
        count?: number;
        is_visible?: boolean;
        toggleDialog?: () => void;
    }) => (
        <div data-testid='dt_toggle_notifications' onClick={toggleDialog}>
            Toggle Notifications {count} {is_visible ? 'visible' : 'hidden'}
        </div>
    ),
}));

// Mock the dynamic import of AccountInfo
jest.mock('App/Components/Layout/Header/account-info.jsx', () => ({
    __esModule: true,
    default: ({
        balance,
        is_virtual,
        currency,
        is_dialog_on,
        toggleDialog,
    }: {
        balance?: string | number;
        is_virtual?: boolean;
        currency?: string;
        is_dialog_on?: boolean;
        toggleDialog?: () => void;
    }) => (
        <div data-testid='dt_account_info' onClick={toggleDialog} className={`${is_virtual ? 'virtual' : ''}`}>
            Account Info: {balance} {currency} {is_dialog_on ? 'open' : 'closed'}
        </div>
    ),
}));

// Mock the dynamic import
jest.mock(
    /* webpackChunkName: "account-info", webpackPreload: true */ 'App/Components/Layout/Header/account-info.jsx',
    () => ({
        __esModule: true,
        default: ({
            balance,
            is_virtual,
            currency,
            is_dialog_on,
            toggleDialog,
        }: {
            balance?: string | number;
            is_virtual?: boolean;
            currency?: string;
            is_dialog_on?: boolean;
            toggleDialog?: () => void;
        }) => (
            <div data-testid='dt_account_info' onClick={toggleDialog} className={`${is_virtual ? 'virtual' : ''}`}>
                Account Info: {balance} {currency} {is_dialog_on ? 'open' : 'closed'}
            </div>
        ),
    }),
    { virtual: true }
);

describe('AccountActions component', () => {
    // Default props
    const default_props = {
        balance: 1000,
        currency: 'USD',
        is_logged_in: true,
        is_virtual: false,
        onClickLogout: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/some-path' });
        (useDevice as jest.Mock).mockReturnValue({ isDesktop: true });
        (formatMoney as jest.Mock).mockImplementation((currency, balance) => `${balance} ${currency}`);
    });

    it('should render AccountInfo when logged in', async () => {
        render(<AccountActions {...default_props} />);

        // Wait for lazy component to load
        await screen.findByTestId('dt_account_info');
        expect(screen.getByTestId('dt_account_info')).toBeInTheDocument();
    });

    it('should render AccountInfo with formatted balance', () => {
        render(<AccountActions {...default_props} balance={1234.56} currency='EUR' />);

        expect(screen.getByTestId('dt_account_info')).toHaveTextContent(/1234\.56 EUR/);
    });
});
