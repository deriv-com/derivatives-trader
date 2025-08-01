import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TraderProviders from '../../../../../trader-providers';
import Barrier from '../barrier';

jest.mock('AppV2/Components/TradeParameters/Barrier/barrier-input', () => jest.fn(() => <div>Barrier Input</div>));

jest.mock('@deriv/quill-icons', () => ({
    ...jest.requireActual('@deriv/quill-icons'),
}));

describe('Barrier Component', () => {
    let default_mock_store: ReturnType<typeof mockStore>;

    beforeEach(
        () =>
            (default_mock_store = mockStore({
                modules: {
                    trade: {
                        onChange: jest.fn(),
                        validation_errors: { barrier_1: [] },
                        duration: 10,
                    },
                },
            }))
    );
    const mockBarriers = () => {
        render(
            <TraderProviders store={default_mock_store}>
                <Barrier is_minimized />
            </TraderProviders>
        );
    };
    it('renders the Barrier component with initial state', () => {
        mockBarriers();
        expect(screen.getByLabelText(/Barrier/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('opens ActionSheet when clicking the TextField', async () => {
        mockBarriers();
        await userEvent.click(screen.getByRole('textbox'));
        expect(screen.getByText('Barrier Input')).toBeInTheDocument();
    });

    it('disables trade param if is_market_closed === true', () => {
        default_mock_store.modules.trade.is_market_closed = true;
        mockBarriers();
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('detects clicking outside the ActionSheet and closes it', async () => {
        mockBarriers();
        await userEvent.click(screen.getByRole('textbox'));
        expect(screen.getByText('Barrier Input')).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('dt-actionsheet-overlay'));
        await waitFor(() => expect(screen.queryByText('Barrier Input')).not.toBeInTheDocument());
    });
});
