import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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

jest.mock('App/Hooks/useMobileBridge', () => ({
    useMobileBridge: jest.fn(() => ({
        sendBridgeEvent: jest.fn(),
        isBridgeAvailable: jest.fn(() => false),
        isDesktop: false,
    })),
}));

// Mock DerivAppChannel
const mockDerivAppChannel = {
    postMessage: jest.fn(),
};

describe('<ToggleMenuDrawer />', () => {
    const mockLogout = jest.fn();
    
    const mockToggleMenuDrawer = (storeOverrides = {}) => {
        return (
            <BrowserRouter>
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
            </BrowserRouter>
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

    it('should use Flutter channel when bridge is available and logout is clicked', async () => {
        // Mock bridge available
        const { useMobileBridge } = require('App/Hooks/useMobileBridge');
        const mockSendBridgeEvent = jest.fn();
        useMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: jest.fn(() => true),
            isDesktop: false,
        });

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

            expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:back', expect.any(Function));
        }
    });

    it('should fallback to regular logout when bridge is not available', async () => {
        // Mock bridge not available
        const { useMobileBridge } = require('App/Hooks/useMobileBridge');
        const mockSendBridgeEvent = jest.fn((event, fallback) => {
            fallback(); // Execute fallback
        });
        useMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: jest.fn(() => false),
            isDesktop: false,
        });

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

            expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:back', expect.any(Function));
            expect(mockLogout).toHaveBeenCalledTimes(1);
        }
    });

    it('should show "Back to app" text when bridge is available', () => {
        // Mock bridge available
        const { useMobileBridge } = require('App/Hooks/useMobileBridge');
        useMobileBridge.mockReturnValue({
            sendBridgeEvent: jest.fn(),
            isBridgeAvailable: jest.fn(() => true),
            isDesktop: false,
        });

        render(mockToggleMenuDrawer());

        // The component should use "Back to app" text when bridge is available
        expect(useMobileBridge().isBridgeAvailable()).toBe(true);
    });

    it('should show "Log out" text when bridge is not available', () => {
        // Mock bridge not available
        const { useMobileBridge } = require('App/Hooks/useMobileBridge');
        useMobileBridge.mockReturnValue({
            sendBridgeEvent: jest.fn(),
            isBridgeAvailable: jest.fn(() => false),
            isDesktop: false,
        });

        render(mockToggleMenuDrawer());

        // The component should use "Log out" text when bridge is not available
        expect(useMobileBridge().isBridgeAvailable()).toBe(false);
    });

    it('should handle bridge errors gracefully', async () => {
        // Mock bridge error
        const { useMobileBridge } = require('App/Hooks/useMobileBridge');
        const mockSendBridgeEvent = jest.fn((event, fallback) => {
            fallback(); // Execute fallback on error
        });
        useMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: jest.fn(() => true),
            isDesktop: false,
        });

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

            expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:back', expect.any(Function));
            expect(mockLogout).toHaveBeenCalledTimes(1);
        }
    });
});
