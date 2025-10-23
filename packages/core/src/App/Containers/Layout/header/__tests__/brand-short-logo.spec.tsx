import { getBrandHomeUrl } from '@deriv/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BrandShortLogo from '../brand-short-logo';

jest.mock('@deriv/shared', () => ({
    getBrandHomeUrl: jest.fn(() => 'https://home.deriv.com/dashboard/home'),
}));

jest.mock('@deriv-com/ui', () => ({
    useDevice: jest.fn(() => ({ isDesktop: true })),
}));

// Mock window.location.href
const mockLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

// Mock DerivAppChannel
const mockDerivAppChannel = {
    postMessage: jest.fn(),
};

describe('BrandShortLogo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.href = '';
        // Clear DerivAppChannel from window
        delete (window as any).DerivAppChannel;
    });

    it('should render the Deriv logo', () => {
        render(<BrandShortLogo />);

        const logoContainer = screen.getByRole('img');
        expect(logoContainer).toBeInTheDocument();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');
        expect(clickableDiv).toHaveStyle('cursor: pointer');
    });

    it('should redirect to brand URL when logo is clicked on desktop', async () => {
        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(getBrandHomeUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should handle different brand URLs correctly', async () => {
        (getBrandHomeUrl as jest.Mock).mockReturnValue('https://staging-home.deriv.com/dashboard/home');

        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockLocation.href).toBe('https://staging-home.deriv.com/dashboard/home');
    });

    it('should use Flutter channel postMessage on mobile when DerivAppChannel is available', async () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Add DerivAppChannel to window
        (window as any).DerivAppChannel = mockDerivAppChannel;

        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockDerivAppChannel.postMessage).toHaveBeenCalledWith(
            JSON.stringify({ event: 'trading:home' })
        );
        expect(getBrandHomeUrl).not.toHaveBeenCalled();
        expect(mockLocation.href).toBe('');
    });

    it('should fallback to brand URL on mobile when DerivAppChannel is not available', async () => {
        // Mock mobile device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: false });

        // Ensure DerivAppChannel is not available
        delete (window as any).DerivAppChannel;

        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(getBrandHomeUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should use brand URL on desktop even when DerivAppChannel is available', async () => {
        // Mock desktop device
        const { useDevice } = require('@deriv-com/ui');
        useDevice.mockReturnValue({ isDesktop: true });

        // Add DerivAppChannel to window
        (window as any).DerivAppChannel = mockDerivAppChannel;

        render(<BrandShortLogo />);

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(getBrandHomeUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
        expect(mockDerivAppChannel.postMessage).not.toHaveBeenCalled();
    });
});
