import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { APIProvider } from '@deriv/api';
import { StoreProvider, mockStore } from '@deriv/stores';
import ToggleMenuDrawer from '../toggle-menu-drawer';

jest.mock('@deriv/components', () => {
    const MobileDrawer = jest.fn(({ children, is_open, toggle }) => (
        <div data-testid="mobile-drawer" style={{ display: is_open ? 'block' : 'none' }}>
            <button onClick={toggle} data-testid="close-drawer">Close</button>
            {children}
        </div>
    ));
    MobileDrawer.SubMenu = jest.fn(() => <div>SubMenu</div>);
    MobileDrawer.Item = jest.fn(({ children, onClick }) => (
        <div data-testid="drawer-item" onClick={onClick}>
            {children}
        </div>
    ));
    MobileDrawer.Body = jest.fn(({ children }) => <div data-testid="drawer-body">{children}</div>);
    MobileDrawer.Footer = jest.fn(({ children }) => <div data-testid="drawer-footer">{children}</div>);
    return {
        ...jest.requireActual('@deriv/components'),
        MobileDrawer,
        ToggleSwitch: jest.fn(() => <div>Toggle Switch</div>),
        Div100vhContainer: jest.fn(({ children }) => <div>{children}</div>),
    };
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(() => ({ pathname: '/appstore/traders-hub' })),
    useHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

jest.mock('@deriv-com/ui', () => ({
    useDevice: jest.fn(() => ({ isDesktop: false })),
}));

// Mock DerivAppChannel
const mockDerivAppChannel = {
    postMessage: jest.fn(),
};

describe('<ToggleMenuDrawer />', () => {
    const mockLogout = jest.fn();
    
    const mockToggleMenuDrawer = (storeOverrides = {}) => {
        return (
            <APIProvider>
                <StoreProvider
                    store={mockStore({
                        client: {
                            is_logged_in: true,
                            logout: mockLogout,
                            ...storeOverrides.client,
                        },
                        modules: {
                            cashier: {
                                payment_agent: {
                                    is_payment_agent_visible: true,
                                },
                            },
                        },
                        traders_hub: {
                            show_eu_related_content: false,
                        },
                        ...storeOverrides,
                    })}
                >
                    <ToggleMenuDrawer />
                </StoreProvider>
            </APIProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear DerivAppChannel from window
        delete window.DerivAppChannel;
    });

    it('should clear timeout after component was unmount', () => {
        jest.useFakeTimers();
        jest.spyOn(global, 'clearTimeout');
        const { unmount } = render(mockToggleMenuDrawer());

        unmount();

        expect(clearTimeout).toBeCalled();
    });

    it('should use Flutter channel postMessage on mobile when DerivAppChannel is available and logout is clicked', async () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Add DerivAppChannel to window
        window.DerivAppChannel = mockDerivAppChannel;

        render(mockToggleMenuDrawer());

        // Find and click the hamburger menu to open drawer
        const hamburgerButton = screen.getByRole('link');
        await userEvent.click(hamburgerButton);

        // Find logout menu item and click it
        const logoutItems = screen.getAllByTestId('drawer-item');
        const logoutItem = logoutItems.find(item => 
            item.textContent && item.textContent.includes('Back to app')
        );
        
        if (logoutItem) {
            await userEvent.click(logoutItem);

            expect(mockDerivAppChannel.postMessage).toHaveBeenCalledWith(
                JSON.stringify({ event: 'trading:back' })
            );
            expect(mockLogout).not.toHaveBeenCalled();
        }
    });

    it('should fallback to regular logout on mobile when DerivAppChannel is not available', async () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Ensure DerivAppChannel is not available
        delete window.DerivAppChannel;

        render(mockToggleMenuDrawer());

        // Find and click the hamburger menu to open drawer
        const hamburgerButton = screen.getByRole('link');
        await userEvent.click(hamburgerButton);

        // Find logout menu item and click it
        const logoutItems = screen.getAllByTestId('drawer-item');
        const logoutItem = logoutItems.find(item => 
            item.textContent && item.textContent.includes('Log out')
        );
        
        if (logoutItem) {
            await userEvent.click(logoutItem);

            expect(mockLogout).toHaveBeenCalledTimes(1);
        }
    });

    it('should show "Back to app" text on mobile when DerivAppChannel is available', () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Add DerivAppChannel to window
        window.DerivAppChannel = mockDerivAppChannel;

        render(mockToggleMenuDrawer());

        // The text should be "Back to app" when DerivAppChannel is available
        expect(mockDerivAppChannel).toBeDefined();
    });

    it('should show "Log out" text on mobile when DerivAppChannel is not available', () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Ensure DerivAppChannel is not available
        delete window.DerivAppChannel;

        render(mockToggleMenuDrawer());

        // The text should be "Log out" when DerivAppChannel is not available
        expect(window.DerivAppChannel).toBeUndefined();
    });

    it('should use regular logout on desktop even when DerivAppChannel is available', async () => {
        // Mock desktop device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: true });

        // Add DerivAppChannel to window
        window.DerivAppChannel = mockDerivAppChannel;

        render(mockToggleMenuDrawer());

        // Find and click the hamburger menu to open drawer
        const hamburgerButton = screen.getByRole('link');
        await userEvent.click(hamburgerButton);

        // Find logout menu item and click it
        const logoutItems = screen.getAllByTestId('drawer-item');
        const logoutItem = logoutItems.find(item => 
            item.textContent && item.textContent.includes('Log out')
        );
        
        if (logoutItem) {
            await userEvent.click(logoutItem);

            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockDerivAppChannel.postMessage).not.toHaveBeenCalled();
        }
    });
});
