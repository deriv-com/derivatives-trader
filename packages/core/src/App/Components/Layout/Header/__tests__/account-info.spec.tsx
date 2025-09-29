import React from 'react';

import { getAccountTypeFromUrl } from '@deriv/shared';
import { render, screen } from '@testing-library/react';

import AccountInfo from '../account-info.jsx';

// Mock the getAccountTypeFromUrl function
jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getAccountTypeFromUrl: jest.fn(),
}));

const mockGetAccountTypeFromUrl = getAccountTypeFromUrl as jest.MockedFunction<typeof getAccountTypeFromUrl>;

describe('AccountInfo component', () => {
    beforeEach(() => {
        // Reset the mock before each test
        mockGetAccountTypeFromUrl.mockReset();
    });

    it('should have "acc-info--is-demo" class when account_type is "demo"', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('demo');
        render(<AccountInfo />);
        const div_element = screen.getByTestId('dt_acc_info');
        expect(div_element).toHaveClass('acc-info--is-demo');
    });

    it('should render "AccountInfoIcon" with the proper className', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        const { rerender } = render(<AccountInfo currency='USD' />);
        expect(screen.getByTestId('dt_icon')).toHaveClass('acc-info__id-icon--usd');

        mockGetAccountTypeFromUrl.mockReturnValue('demo');
        rerender(<AccountInfo />);
        expect(screen.getByTestId('dt_icon')).toHaveClass('acc-info__id-icon--demo');
    });

    it('should not render balance section when "currency" property passed', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo currency='USD' />);
        const balance_wrapper = screen.queryByTestId('dt_balance');
        expect(balance_wrapper).not.toBeInTheDocument();
    });

    it('should have "acc-info__balance--no-currency" class when account is real and we don\'t have "currency" property', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo />);
        const balance_wrapper = screen.getByTestId('dt_balance');
        expect(balance_wrapper).toHaveClass('acc-info__balance--no-currency');
    });

    it('should have "No currency assigned" text when we don\'t have "currency" property', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo />);
        const text = screen.getByText(/no currency assigned/i);
        expect(text).toBeInTheDocument();
    });

    it('should have "123456789 USD" text when we have "currency" and "balance" properties', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo currency='USD' balance='123456789' />);
        const text = screen.getByText(/123456789 usd/i);
        expect(text).toBeInTheDocument();
        expect(screen.queryByText(/no currency assigned/i)).not.toBeInTheDocument();
    });

    it('should display "Real" account type label for real accounts', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo currency='USD' balance='1000' />);
        const accountTypeLabel = screen.getByText('Real');
        expect(accountTypeLabel).toBeInTheDocument();
        expect(accountTypeLabel).toHaveClass('acc-info__account-type');
    });

    it('should display "Demo" account type label for demo accounts', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('demo');
        render(<AccountInfo currency='USD' balance='1000' />);
        const accountTypeLabel = screen.getByText('Demo');
        expect(accountTypeLabel).toBeInTheDocument();
        expect(accountTypeLabel).toHaveClass('acc-info__account-type');
    });

    it('should display account type label in header section when currency is assigned', () => {
        mockGetAccountTypeFromUrl.mockReturnValue('real');
        render(<AccountInfo currency='USD' balance='1000' />);
        const accountTypeLabel = screen.getByText('Real');
        const balanceElement = screen.getByText(/1000 usd/i);

        expect(accountTypeLabel).toBeInTheDocument();
        expect(balanceElement).toBeInTheDocument();

        // Verify both elements are within the same container
        const container = screen.getByTestId('dt_acc_info');
        expect(container).toContainElement(accountTypeLabel);
        expect(container).toContainElement(balanceElement);
    });
});
