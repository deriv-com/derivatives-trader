import { getBrandUrl } from '@deriv/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BrandShortLogo from '../brand-short-logo';

jest.mock('@deriv/shared', () => ({
    getBrandUrl: jest.fn(() => 'https://home.deriv.com/dashboard'),
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
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.href = '';
    });

    it('should render the Deriv logo', () => {
        render(<BrandShortLogo />);

        const logoContainer = screen.getByRole('img');
        expect(logoContainer).toBeInTheDocument();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');
        expect(clickableDiv).toHaveStyle('cursor: pointer');
    });

    it('should redirect to brand URL when logo is clicked', async () => {
        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(getBrandUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard');
    });

    it('should handle different brand URLs correctly', async () => {
        (getBrandUrl as jest.Mock).mockReturnValue('https://staging-home.deriv.com/dashboard');

        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockLocation.href).toBe('https://staging-home.deriv.com/dashboard');
    });
});
