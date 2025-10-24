import React from 'react';
import moment from 'moment';

import { toMoment } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { useSnackbar } from '@deriv-com/quill-ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TraderProviders from '../../../../../trader-providers';
import Duration from '../index';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

global.ResizeObserver = ResizeObserver;

jest.mock('@deriv-com/quill-ui', () => ({
    ...jest.requireActual('@deriv-com/quill-ui'),
    useSnackbar: jest.fn(),
}));

jest.mock('AppV2/Hooks/useActiveSymbols', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        activeSymbols: [
            { symbol: 'EURUSD', display_name: 'EUR/USD', exchange_is_open: 1 },
            { symbol: 'GBPUSD', display_name: 'GBP/USD', exchange_is_open: 0 },
            { symbol: 'CADAUD', display_name: 'CAD/AUD', exchange_is_open: 0 },
        ],
    })),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    toMoment: jest.fn(() => ({
        clone: jest.fn(),
        isSame: jest.fn(() => true),
    })),
}));

describe('Duration', () => {
    let default_trade_store: TCoreStores, mockOnChangeMultiple: jest.Mock;

    beforeEach(() => {
        mockOnChangeMultiple = jest.fn();
        default_trade_store = mockStore({
            modules: {
                trade: {
                    onChange: jest.fn(),
                    validation_errors: { duration: [] },
                    duration: 30,
                    duration_unit: 'm',
                    expiry_type: 'duration',
                    expiry_time: '',
                    proposal_info: {},
                    onChangeMultiple: mockOnChangeMultiple,
                    duration_min_max: {
                        tick: { min: 1, max: 10 },
                        intraday: { min: 60, max: 3600 },
                        daily: { min: 86400, max: 172800 },
                    },
                    start_time: null,
                    symbol: 'EURUSD',
                    saved_expiry_date_v2: '',
                    setSavedExpiryDateV2: jest.fn(),
                    setUnsavedExpiryDateV2: jest.fn(),
                    unsaved_expiry_date_v2: '',
                },
            },
            common: {
                server_time: moment('2024-10-10T11:23:10.895Z'),
            },
        });
    });

    const mockAddSnackbar = jest.fn();

    beforeAll(() => {
        (useSnackbar as jest.Mock).mockReturnValue({ addSnackbar: mockAddSnackbar });
    });
    const mockDuration = () => {
        render(
            <TraderProviders store={default_trade_store}>
                <Duration />
            </TraderProviders>
        );
    };

    it('should render the Duration component with default values', () => {
        mockDuration();
        expect(screen.getByLabelText('Duration')).toBeInTheDocument();
        expect(screen.getByDisplayValue('30 minutes')).toBeInTheDocument();
    });

    it('should render the correct value for duration in hours and minutes', () => {
        default_trade_store.modules.trade.duration = 125;
        mockDuration();
        expect(screen.getByLabelText('Duration')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2 hours 5 minutes')).toBeInTheDocument();
    });

    it('should open the ActionSheet when the text field is clicked', async () => {
        default_trade_store.modules.trade.expiry_time = '12:30';
        mockDuration();
        const textField = screen.getByLabelText('Duration');
        expect(textField).toBeInTheDocument();
        await userEvent.click(textField);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display a validation error message if there is a duration error', () => {
        default_trade_store.modules.trade.validation_errors.duration = [
            { message: 'Invalid duration', error_field: 'duration' },
        ];
        mockDuration();
        expect(mockAddSnackbar).toHaveBeenCalled();
    });

    it('should display the market closed message when the market is closed', () => {
        default_trade_store.modules.trade.is_market_closed = true;
        mockDuration();
        expect(screen.getByText(/duration/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should calculate the correct duration based on the smallest unit from the store', () => {
        mockDuration();
        const smallest_duration = screen.getByDisplayValue('30 minutes');
        expect(smallest_duration).toBeInTheDocument();
    });

    it('should display duration in seconds if provided', () => {
        default_trade_store.modules.trade.duration = 45;
        default_trade_store.modules.trade.duration_unit = 's';
        mockDuration();
        expect(screen.getByDisplayValue('45 seconds')).toBeInTheDocument();
    });

    it('should display correct duration in ticks when tick duration is selected', () => {
        default_trade_store.modules.trade.duration = 5;
        default_trade_store.modules.trade.duration_unit = 't';
        mockDuration();
        expect(screen.getByDisplayValue('5 ticks')).toBeInTheDocument();
    });

    it('should update the selected hour and unit when the component is opened', async () => {
        default_trade_store.modules.trade.duration_unit = 'm';
        default_trade_store.modules.trade.duration = 125;
        mockDuration();

        const textField = screen.getByLabelText('Duration');
        await userEvent.click(textField);

        expect(screen.getByDisplayValue('2 hours 5 minutes')).toBeInTheDocument();
    });

    it('should update saved_expiry_date when expiry_epoch changes to a different date', () => {
        // Initial state with next year's date (simulating Accumulator contract)
        const next_year_epoch = 1792108799; // Oct 15, 2026
        default_trade_store.modules.trade.expiry_epoch = next_year_epoch;
        default_trade_store.modules.trade.saved_expiry_date_v2 = ''; // Start with empty

        render(
            <TraderProviders store={default_trade_store}>
                <Duration />
            </TraderProviders>
        );

        // Verify initial date is set from expiry_epoch
        expect(default_trade_store.modules.trade.setSavedExpiryDateV2).toHaveBeenCalledWith('2026-10-15');
    });

    it('should not update saved_expiry_date when expiry_epoch changes but date remains the same', () => {
        const mockSetSavedExpiryDateV2 = jest.fn();

        // Initial state with today's date
        const initial_epoch = 1760507040; // Oct 15, 2025 00:00:00
        default_trade_store.modules.trade.expiry_epoch = initial_epoch;
        default_trade_store.modules.trade.saved_expiry_date_v2 = '2025-10-15';
        default_trade_store.modules.trade.setSavedExpiryDateV2 = mockSetSavedExpiryDateV2;

        const { rerender } = render(
            <TraderProviders store={default_trade_store}>
                <Duration />
            </TraderProviders>
        );

        mockSetSavedExpiryDateV2.mockClear();

        // Simulate streaming proposal update with same date but different time
        const updated_epoch = 1760507041; // Oct 15, 2025 00:00:01 (1 second later)
        default_trade_store.modules.trade.expiry_epoch = updated_epoch;

        rerender(
            <TraderProviders store={default_trade_store}>
                <Duration />
            </TraderProviders>
        );

        // Verify that setSavedExpiryDateV2 is NOT called since the date hasn't changed
        expect(mockSetSavedExpiryDateV2).not.toHaveBeenCalled();
    });

    it('should handle expiry_epoch updates correctly when switching between contract types', () => {
        // Start with Accumulator (no duration) - next year's date
        const accumulator_epoch = 1792108799; // Oct 15, 2026
        default_trade_store.modules.trade.expiry_epoch = accumulator_epoch;
        default_trade_store.modules.trade.saved_expiry_date_v2 = ''; // Start with empty
        default_trade_store.modules.trade.contract_type = 'accumulator';

        render(
            <TraderProviders store={default_trade_store}>
                <Duration />
            </TraderProviders>
        );

        // Verify Accumulator's date is set
        expect(default_trade_store.modules.trade.setSavedExpiryDateV2).toHaveBeenCalledWith('2026-10-15');
    });
});
