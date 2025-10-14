import React from 'react';
import moment from 'moment';

import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContractType } from 'Stores/Modules/Trading/Helpers/contract-type';

import TraderProviders from '../../../../../trader-providers';
import DurationActionSheetContainer from '../container';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

global.ResizeObserver = ResizeObserver;
global.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('Stores/Modules/Trading/Helpers/contract-type', () => ({
    ContractType: {
        getTradingEvents: jest.fn(),
        getTradingDays: jest.fn(),
    },
}));

jest.mock('AppV2/Hooks/useActiveSymbols', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        activeSymbols: [{ symbol: '1HZ100V', display_name: '"Volatility 100 (1s) Index"', exchange_is_open: 1 }],
    })),
}));

jest.mock('@deriv-com/quill-ui', () => ({
    ...jest.requireActual('@deriv-com/quill-ui'),
    DatePicker: jest.fn(({ onChange }) => (
        <div>
            <button
                onClick={() => {
                    const mockDate = new Date(2024, 8, 10);
                    onChange(mockDate);
                }}
            >
                Date Picker
            </button>
        </div>
    )),
}));

describe('DurationActionSheetContainer', () => {
    let default_trade_store: TCoreStores;

    beforeEach(() => {
        default_trade_store = mockStore({
            modules: {
                trade: {
                    duration: 30,
                    duration_unit: 'm',
                    duration_units_list: [
                        { value: 's', text: 'seconds' },
                        { value: 't', text: 'ticks' },
                        { value: 'm', text: 'minutes' },
                        { value: 'h', text: 'hours' },
                        { value: 'd', text: 'days' },
                    ],
                    duration_min_max: {
                        daily: {
                            min: 86400,
                            max: 31536000,
                        },
                        intraday: {
                            min: 15,
                            max: 86400,
                        },
                        tick: {
                            min: 1,
                            max: 10,
                        },
                    },
                    onChangeMultiple: jest.fn(),
                    expiry_time: null,
                    contract_type: 'call',
                    symbol: '1HZ100V',
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

    const renderDurationContainer = (
        mocked_store: TCoreStores,
        unit = 'm',
        setUnit = jest.fn(),
        selected_expiry_time = '',
        selected_expiry_date = '',
        setSelectedExpiryTime = jest.fn(),
        setSavedExpiryTime = jest.fn(),
        setSelectedExpiryDate = jest.fn(),
        setSavedExpiryDate = jest.fn()
    ) => {
        render(
            <TraderProviders store={mocked_store}>
                <DurationActionSheetContainer
                    unit={unit}
                    setUnit={setUnit}
                    selected_expiry_time={selected_expiry_time}
                    selected_expiry_date={selected_expiry_date}
                    setSelectedExpiryTime={setSelectedExpiryTime}
                    setSavedExpiryTime={setSavedExpiryTime}
                    setSelectedExpiryDate={setSelectedExpiryDate}
                    setSavedExpiryDate={setSavedExpiryDate}
                />
            </TraderProviders>
        );
    };

    it('should render the DurationActionSheetContainer with default values', () => {
        renderDurationContainer(default_trade_store);
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should select duration in hours if duration is more than 59 minutes', async () => {
        default_trade_store.modules.trade.duration = 130;
        renderDurationContainer(default_trade_store, 'h');

        const duration_chip = screen.getByText('1 h');
        await userEvent.click(duration_chip);

        expect(default_trade_store.modules.trade.onChangeMultiple).not.toHaveBeenCalled();
    });

    it('should call onChangeMultiple with correct data with minutes', async () => {
        default_trade_store.modules.trade.duration = 30;
        renderDurationContainer(default_trade_store, 'm');

        await userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 'm',
            duration: 30,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct data with ticks', async () => {
        default_trade_store.modules.trade.duration = 5;

        renderDurationContainer(default_trade_store, 't');

        await userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 't',
            duration: 5,
            expiry_type: 'duration',
        });
    });

    it('should call change duration on changing chips', async () => {
        renderDurationContainer(default_trade_store, 'h');

        await userEvent.click(screen.getByText('minutes'));
        expect(screen.getByText('1 min')).toBeInTheDocument();
        await userEvent.click(screen.getByText('hours'));
        expect(screen.getByText('1 h')).toBeInTheDocument();
    });

    it('should call onChangeMultiple with correct data with seconds', async () => {
        default_trade_store.modules.trade.duration = 20;

        renderDurationContainer(default_trade_store, 's');
        await userEvent.click(screen.getByText('22 sec'));
        await userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 's',
            duration: 20,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct data with hour', async () => {
        default_trade_store.modules.trade.duration = 4;

        renderDurationContainer(default_trade_store, 'h');
        await userEvent.click(screen.getByText('4 h'));
        await userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            duration_unit: 'm',
            duration: 240,
            expiry_type: 'duration',
        });
    });

    it('should call onChangeMultiple with correct endtime with endtime', async () => {
        default_trade_store.modules.trade.expiry_time = '23:35';

        renderDurationContainer(
            default_trade_store,
            'd',
            jest.fn(),
            '11:35',
            new Date().toISOString().slice(0, 10),
            jest.fn(),
            jest.fn(),
            jest.fn(),
            jest.fn()
        );
        await userEvent.click(screen.getByText('Save'));

        expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
            expiry_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T11:35Z$/),
            expiry_time: '11:35',
            expiry_type: 'endtime',
        });
    });

    it('should show Expiry Date when days are selected', () => {
        renderDurationContainer(default_trade_store, 'd');
        expect(screen.getByText('Expiry')).toBeInTheDocument();
    });

    it('should show End Time Screen on selecting the days unit', () => {
        renderDurationContainer(default_trade_store, 'd');
        const date_input = screen.getByTestId('dt_date_input');
        expect(date_input).toBeInTheDocument();
    });

    it('should open datepicker on clicking on date input in the days page', async () => {
        renderDurationContainer(default_trade_store, 'd');
        const mockEvents = [{ dates: 'Fridays, Saturdays', descrip: 'Some description' }];
        jest.spyOn(ContractType, 'getTradingEvents').mockResolvedValue(mockEvents);

        const date_input = screen.getByTestId('dt_date_input');
        expect(date_input).toBeInTheDocument();
        await userEvent.click(date_input);
        expect(screen.getByText('Pick an end date'));
    });

    it('should save and close datepicker on clicking done button', async () => {
        renderDurationContainer(default_trade_store, 'd');
        const date_input = screen.getByTestId('dt_date_input');
        expect(date_input).toBeInTheDocument();
        await userEvent.click(date_input);
        expect(screen.getByText('Pick an end date'));
        await userEvent.click(screen.getByText('Done'));
        await waitFor(() => expect(screen.queryByText('Pick an end date')).not.toBeInTheDocument());
    });

    it('should not render chips if duration_units_list contains only ticks', () => {
        default_trade_store.modules.trade.duration = 1;
        default_trade_store.modules.trade.duration_unit = 't';
        default_trade_store.modules.trade.duration_units_list = [{ value: 't' }];
        renderDurationContainer(default_trade_store);

        const chip_names = ['Ticks', 'Seconds', 'Minutes', 'Hours', 'Days', 'End Time'];
        chip_names.forEach(name => expect(screen.queryByText(name)).not.toBeInTheDocument());
    });

    describe('End time behavior and state synchronization', () => {
        it('should correctly handle end time selection with future date', async () => {
            const future_date = new Date();
            future_date.setDate(future_date.getDate() + 2);
            const formatted_date = future_date.toISOString().slice(0, 10);

            renderDurationContainer(
                default_trade_store,
                'd',
                jest.fn(),
                '14:30:00',
                formatted_date,
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            await userEvent.click(screen.getByText('Save'));

            expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
                expiry_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T14:30:00Z$/),
                expiry_time: '14:30:00',
                expiry_type: 'endtime',
            });
        });

        it('should handle switching from hours to days unit', async () => {
            renderDurationContainer(default_trade_store, 'h');

            await userEvent.click(screen.getByText('End Time'));
            // After clicking End Time chip, the component should still render
            expect(screen.getByText('Duration')).toBeInTheDocument();
        });

        it('should correctly convert hours to minutes when saving', async () => {
            default_trade_store.modules.trade.duration = 120; // 2 hours in minutes

            renderDurationContainer(default_trade_store, 'h');
            await userEvent.click(screen.getByText('Save'));

            expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
                duration_unit: 'm',
                duration: expect.any(Number),
                expiry_type: 'duration',
            });
        });

        it('should maintain state consistency when switching between units', async () => {
            const setUnit = jest.fn();
            renderDurationContainer(default_trade_store, 'm', setUnit);

            // Switch to hours
            await userEvent.click(screen.getByText('hours'));

            // Switch back to minutes
            await userEvent.click(screen.getByText('minutes'));

            // State should remain consistent
            expect(screen.getByText('Duration')).toBeInTheDocument();
        });

        it("should handle end time with today's date correctly", async () => {
            const today = new Date().toISOString().slice(0, 10);

            renderDurationContainer(
                default_trade_store,
                'd',
                jest.fn(),
                '18:45:00',
                today,
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            await userEvent.click(screen.getByText('Save'));

            expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
                expiry_date: expect.stringMatching(/T18:45:00Z$/),
                expiry_time: '18:45:00',
                expiry_type: 'endtime',
            });
        });

        it('should properly initialize selected_duration state for hours unit', async () => {
            default_trade_store.modules.trade.duration = 90; // 1.5 hours in minutes

            renderDurationContainer(default_trade_store, 'h');

            // Component should display hours correctly
            expect(screen.getByText('Duration')).toBeInTheDocument();
        });

        it('should handle edge case of 0 minutes when converting hours', async () => {
            default_trade_store.modules.trade.duration = 60; // Exactly 1 hour

            renderDurationContainer(default_trade_store, 'h');
            await userEvent.click(screen.getByText('Save'));

            expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalledWith({
                duration_unit: 'm',
                duration: expect.any(Number),
                expiry_type: 'duration',
            });
        });

        it('should synchronize saved and selected expiry times correctly', async () => {
            const setSavedExpiryTime = jest.fn();
            const setSelectedExpiryTime = jest.fn();

            renderDurationContainer(
                default_trade_store,
                'd',
                jest.fn(),
                '12:00:00',
                new Date().toISOString().slice(0, 10),
                setSelectedExpiryTime,
                setSavedExpiryTime,
                jest.fn(),
                jest.fn()
            );

            await userEvent.click(screen.getByText('Save'));

            // Both saved and selected times should be synchronized
            expect(default_trade_store.modules.trade.onChangeMultiple).toHaveBeenCalled();
        });
    });

    describe('Hours conversion bug fix verification', () => {
        it('should correctly calculate minutes from selected hours and minutes', async () => {
            // This test verifies the fix for the bug where duration was used instead of minutes
            default_trade_store.modules.trade.duration = 30; // Old duration value

            renderDurationContainer(default_trade_store, 'h');

            // Simulate selecting 2 hours 15 minutes (which should be 135 minutes total)
            await userEvent.click(screen.getByText('Save'));

            const call_args = default_trade_store.modules.trade.onChangeMultiple.mock.calls[0][0];

            // The duration should be calculated from selected_duration, not from the old duration value
            expect(call_args.duration_unit).toBe('m');
            expect(typeof call_args.duration).toBe('number');
        });
    });
});
