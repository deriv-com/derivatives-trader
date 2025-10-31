import { getBrandHomeUrl } from '@deriv/shared';
import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BrandShortLogo from '../brand-short-logo';

jest.mock('@deriv/shared', () => ({
    getBrandHomeUrl: jest.fn(() => 'https://home.deriv.com/dashboard/home'),
}));

// Mock window.location.href
const mockLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

describe('BrandShortLogo', () => {
    const mock_store = mockStore({
        common: {
            current_language: 'EN',
        },
    });

    const renderComponent = () =>
        render(
            <StoreProvider store={mock_store}>
                <BrandShortLogo />
            </StoreProvider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.href = '';
    });

    it('should render the Deriv logo', () => {
        renderComponent();

        const logoContainer = screen.getByRole('img');
        expect(logoContainer).toBeInTheDocument();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');
        expect(clickableDiv).toHaveStyle('cursor: pointer');
    });

    it('should redirect to brand URL with language parameter when logo is clicked', async () => {
        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(getBrandHomeUrl).toHaveBeenCalledWith('EN');
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should handle different brand URLs correctly', async () => {
        (getBrandHomeUrl as jest.Mock).mockReturnValue('https://staging-home.deriv.com/dashboard/home');

        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockLocation.href).toBe('https://staging-home.deriv.com/dashboard/home');
    });
});
