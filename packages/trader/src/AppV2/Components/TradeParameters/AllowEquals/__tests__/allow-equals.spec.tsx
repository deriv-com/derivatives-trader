import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { hasCallPutEqual, hasDurationForCallPutEqual } from 'Stores/Modules/Trading/Helpers/allow-equals';
import ModulesProvider from 'Stores/Providers/modules-providers';

import TraderProviders from '../../../../../trader-providers';
import AllowEquals from '../allow-equals';

jest.mock('Stores/Modules/Trading/Helpers/allow-equals', () => ({
    ...jest.requireActual('Stores/Modules/Trading/Helpers/allow-equals'),
    hasCallPutEqual: jest.fn(() => true),
    hasDurationForCallPutEqual: jest.fn(() => true),
}));

const title = 'Allow equals';

describe('AllowEquals', () => {
    let default_mock_store: ReturnType<typeof mockStore>;

    beforeEach(() => (default_mock_store = mockStore({})));

    const mockAllowEquals = () => {
        return (
            <TraderProviders store={default_mock_store}>
                <ModulesProvider store={default_mock_store}>
                    <AllowEquals />
                </ModulesProvider>
            </TraderProviders>
        );
    };

    it('does not render component if hasCallPutEqual return false', () => {
        (hasCallPutEqual as jest.Mock).mockReturnValueOnce(false);
        const { container } = render(mockAllowEquals());

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render component if hasDurationForCallPutEqual return false', () => {
        (hasDurationForCallPutEqual as jest.Mock).mockReturnValueOnce(false);
        const { container } = render(mockAllowEquals());

        expect(container).toBeEmptyDOMElement();
    });

    it('renders component with ToggleSwitch state value aria-pressed === false if is_equal is 0', () => {
        render(mockAllowEquals());

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders component with ToggleSwitch state value aria-pressed === true if is_equal is 1', () => {
        default_mock_store.modules.trade.is_equal = 1;
        render(mockAllowEquals());

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onChange function if user clicks on ToggleSwitch', async () => {
        render(mockAllowEquals());

        await userEvent.click(screen.getByRole('button'));

        expect(default_mock_store.modules.trade.onChange).toBeCalled();
    });

    it('renders ActionSheet with definition if user clicks on "Allow equal" term', async () => {
        render(mockAllowEquals());

        await userEvent.click(screen.getByText(title));

        expect(screen.getByText('Win payout if exit spot is also equal to entry spot.')).toBeInTheDocument();
        expect(screen.getByText('Got it')).toBeInTheDocument();
    });

    it('renders disabled ToggleSwitch is is_market_closed === true', () => {
        default_mock_store.modules.trade.is_market_closed = true;
        render(mockAllowEquals());

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
