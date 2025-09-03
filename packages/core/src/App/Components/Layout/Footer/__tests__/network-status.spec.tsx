import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import NetworkStatus from '../network-status';
import { StoreProvider, mockStore } from '@deriv/stores';

const store = mockStore({
    common: {
        network_status: {
            class: 'online',
            tooltip: '',
        },
    },
});
const MockNetworkStatus = ({ is_mobile = true }: { is_mobile?: boolean }) => (
    <StoreProvider store={store}>
        <NetworkStatus is_mobile={is_mobile} />
    </StoreProvider>
);

describe('network-status component', () => {
    it('should has "network-status__wrapper--is-mobile" class when the "is_mobile" property is true', () => {
        render(<MockNetworkStatus />);
        const div_element = screen.getByTestId('dt_network_status');
        expect(div_element).toHaveClass('network-status__wrapper--is-mobile');
    });

    it('should has correct class based on class passed in the "status" property', () => {
        store.common.network_status.class = 'offline';
        render(
            <StoreProvider store={store}>
                <NetworkStatus />
            </StoreProvider>
        );
        expect(screen.getByTestId('dt_network_status_element')).toHaveClass('network-status__circle--offline');
    });
    it('should has correct class based on class passed in the "status" as online property', () => {
        store.common.network_status.class = 'online';
        render(
            <StoreProvider store={store}>
                <NetworkStatus />
            </StoreProvider>
        );
        expect(screen.getByTestId('dt_network_status_element')).toHaveClass('network-status__circle--online');
    });
    it('should has correct class based on class passed in the "status" as blinker property', () => {
        store.common.network_status.class = 'blinker';
        render(
            <StoreProvider store={store}>
                <NetworkStatus />
            </StoreProvider>
        );
        expect(screen.getByTestId('dt_network_status_element')).toHaveClass('network-status__circle--blinker');
    });

    it('should contain "Popover" with default message when "status.tooltip" is empty', async () => {
        store.common.network_status.tooltip = '';
        render(<MockNetworkStatus is_mobile={false} />);
        const popover_wrapper = screen.getByTestId('dt_popover_wrapper');
        await userEvent.hover(popover_wrapper);
        const network_status = screen.getByText(/network status.*connecting to server/i);
        expect(network_status).toBeInTheDocument();
    });

    it('should contain "Tooltip" message passed in the status property', async () => {
        const status = {
            class: 'online',
            tooltip: 'Online',
        };
        store.common.network_status = status;
        render(
            <StoreProvider store={store}>
                <NetworkStatus />
            </StoreProvider>
        );
        const popover_wrapper = screen.getByTestId('dt_popover_wrapper');
        await userEvent.hover(popover_wrapper);
        const network_status = screen.getByText(/online/i);
        expect(network_status).toBeInTheDocument();
    });
});
