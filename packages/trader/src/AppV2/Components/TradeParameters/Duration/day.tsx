import React, { useEffect, useState } from 'react';

import { useInvalidateQuery } from '@deriv/api';
import { LabelPairedCalendarSmRegularIcon, LabelPairedClockThreeSmRegularIcon } from '@deriv/quill-icons';
import { hasIntradayDurationUnit, setTime, toMoment, mapErrorMessage } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { ActionSheet, Text, TextField, useSnackbar } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';

import { useProposal } from 'AppV2/Hooks/useProposal';
import { getClosestTimeToCurrentGMT, getDatePickerStartDate } from 'AppV2/Utils/trade-params-utils';
import { getBoundaries } from 'Stores/Modules/Trading/Helpers/end-time';
import { useTraderStore } from 'Stores/useTraderStores';

import DaysDatepicker from './datepicker';
import EndTimePicker from './timepicker';

const DayInput = ({
    selected_expiry_time,
    selected_expiry_date,
    setSelectedExpiryTime,
    setSelectedExpiryDate,
}: {
    selected_expiry_time: string;
    selected_expiry_date: string;
    setSelectedExpiryTime: (arg: string) => void;
    setSelectedExpiryDate: (arg: string) => void;
}) => {
    const [current_gmt_time, setCurrentGmtTime] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);
    const [open_timepicker, setOpenTimePicker] = React.useState(false);
    const [trigger_date, setTriggerDate] = useState(false);
    const [is_disabled, setIsDisabled] = useState(false);
    // Local browsing state for date - this is the "unsaved" state while user browses date picker
    const [browsing_expiry_date, setBrowsingExpiryDate] = useState(new Date(selected_expiry_date));
    // Local browsing state for time - this is the "unsaved" state while user browses time picker
    const [browsing_expiry_time, setBrowsingExpiryTime] = useState<string>('');
    const [payout_per_point, setPayoutPerPoint] = useState<number | undefined>();
    const [barrier_value, setBarrierValue] = useState<string | undefined>();
    const { common } = useStore();
    const [day, setDay] = useState<number | null>(null);
    const { server_time } = common;
    const {
        amount,
        barrier_1,
        contract_type,
        duration_min_max,
        duration_unit,
        duration_units_list,
        duration,
        expiry_type,
        is_turbos,
        market_close_times,
        market_open_times,
        start_date,
        start_time,
        symbol,
        tick_data,
        trade_types,
    } = useTraderStore();
    const trade_store = useTraderStore();
    const { addSnackbar } = useSnackbar();

    // Calculate date_expiry epoch when expiry_type is endtime
    const getDateExpiryEpoch = () => {
        const date_string = `${selected_expiry_date}T${selected_expiry_time}Z`; // Z for GMT/UTC
        return Math.floor(new Date(date_string).getTime() / 1000);
    };

    const new_values = {
        ...(expiry_type !== 'endtime' && {
            duration_unit,
            duration: day || duration,
        }),
        ...(expiry_type === 'endtime' && {
            date_expiry: getDateExpiryEpoch(),
        }),
        expiry_type,
        contract_type,
        basis: 'stake',
        amount,
        symbol,
        ...(payout_per_point && { payout_per_point }),
        ...(barrier_value && { barrier: barrier_value }),
        ...(barrier_1 && !is_turbos && !barrier_value ? { barrier_1: Math.round(tick_data?.quote as number) } : {}),
    };

    const { data: response, error: queryError } = useProposal({
        trade_store,
        proposal_request_values: new_values,
        contract_type: Object.keys(trade_types)[0],
        is_enabled: trigger_date,
    });

    const invalidate = useInvalidateQuery();

    useEffect(() => {
        if (queryError) {
            if (queryError?.code === 'ContractBuyValidationError') {
                const details = queryError.details;

                if (details?.field === 'payout_per_point' && Array.isArray(details?.payout_per_point_choices)) {
                    const suggested_payout = details.payout_per_point_choices[0];
                    setPayoutPerPoint(suggested_payout as number);
                    setTriggerDate(true);
                    return;
                }

                if (details?.field === 'barrier' && Array.isArray(details?.barrier_choices)) {
                    const suggested_barrier = details.barrier_choices[0];
                    setBarrierValue(suggested_barrier as string);
                    setTriggerDate(true);
                    return;
                }
            }

            if (queryError?.message && queryError?.details?.field === 'duration') {
                const mappedMessage = mapErrorMessage(queryError);
                addSnackbar({
                    message: <Localize i18n_default_text={mappedMessage} />,
                    status: 'fail',
                    hasCloseButton: true,
                    style: { marginBottom: '48px' },
                });
                setIsDisabled(true);
            }
        }

        if (response) {
            setIsDisabled(false);
            invalidate('proposal');
            setTriggerDate(false);
        }
    }, [response, setSelectedExpiryDate, invalidate]);

    // Always calculate adjusted_start_time based on TODAY, not the selected expiry_date
    const today_moment = toMoment(server_time);
    const market_open_datetimes = market_open_times.map(open_time => setTime(today_moment.clone(), open_time));
    const market_close_datetimes = market_close_times.map(close_time => setTime(today_moment.clone(), close_time));
    const boundaries = getBoundaries(today_moment.clone(), market_open_datetimes, market_close_datetimes);
    const adjusted_start_time =
        boundaries.start[0]?.clone().add(5, 'minutes').format('HH:mm') || getClosestTimeToCurrentGMT(5);

    const formatted_date = new Date(selected_expiry_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'GMT',
    });
    const formatted_current_date = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'GMT',
    });

    React.useEffect(() => {
        const updateCurrentGmtTime = () => {
            const now = new Date();
            const gmt_time = now.toLocaleTimeString('en-GB', { timeZone: 'GMT', hour12: false });
            setCurrentGmtTime(gmt_time);
        };
        updateCurrentGmtTime();
        const interval = setInterval(updateCurrentGmtTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Simple logic: set time based on whether date is today or future
        const is_today = formatted_date === formatted_current_date;
        const time_to_set = is_today ? adjusted_start_time : '23:59:59';

        setBrowsingExpiryTime(time_to_set);
        setSelectedExpiryTime(time_to_set);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected_expiry_date]);

    let is_24_hours_contract = false;

    const has_intraday_duration_unit = hasIntradayDurationUnit(duration_units_list);
    const parsedFormattedDate = new Date(Date.parse(`${formatted_date} 00:00:00`));

    const isSameDate =
        parsedFormattedDate.getFullYear() === server_time.year() &&
        parsedFormattedDate.getMonth() === server_time.month() &&
        parsedFormattedDate.getDate() === server_time.date();

    is_24_hours_contract = (!!start_date || isSameDate) && has_intraday_duration_unit;

    const handleDate = (date: Date) => {
        const difference_in_time = date.getTime() - new Date().getTime();
        const difference_in_days = Math.ceil(difference_in_time / (1000 * 3600 * 24));
        const duration_days = difference_in_days <= 0 ? 1 : difference_in_days;
        setDay(Number(duration_days));

        // Keep browsing_expiry_date and selected_expiry_date in sync
        setBrowsingExpiryDate(date);
        const selected_date_string = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        setSelectedExpiryDate(selected_date_string);

        // Set browsing time based on whether it's today or future
        if (difference_in_days <= 0) {
            // Today: set to adjusted_start_time
            setBrowsingExpiryTime(adjusted_start_time);
            setSelectedExpiryTime(adjusted_start_time);
        } else {
            setBrowsingExpiryTime('23:59:59');
            setSelectedExpiryTime('23:59:59');
        }
    };

    return (
        <div className='duration-container__days-input'>
            <TextField
                variant='fill'
                readOnly
                name='date'
                data-testid='dt_date_input'
                textAlignment='center'
                value={formatted_date}
                disabled={duration_units_list.filter(item => item.value === 'd').length === 0}
                onClick={() => {
                    setOpen(true);
                }}
                leftIcon={<LabelPairedCalendarSmRegularIcon width={24} height={24} />}
            />

            <TextField
                variant='fill'
                readOnly
                textAlignment='center'
                name='time'
                value={`${is_24_hours_contract ? browsing_expiry_time : '23:59:59'} GMT`}
                disabled={!is_24_hours_contract}
                onClick={() => {
                    setOpenTimePicker(true);
                }}
                leftIcon={<LabelPairedClockThreeSmRegularIcon width={24} height={24} />}
            />

            <div className='duration-container__days-input__expiry'>
                <Text size='sm' color='quill-typography__color--subtle'>
                    <Localize i18n_default_text='Expiry' />
                </Text>
                <Text size='sm'>{`
                ${formatted_date} ${
                    formatted_date === formatted_current_date ? browsing_expiry_time : '23:59:59'
                } GMT`}</Text>
            </div>
            <ActionSheet.Root
                isOpen={open || open_timepicker}
                onClose={() => {
                    setOpen(false);
                    setOpenTimePicker(false);
                    setIsDisabled(false);
                }}
                position='left'
                expandable={false}
            >
                <ActionSheet.Portal shouldCloseOnDrag>
                    <ActionSheet.Header
                        title={
                            open ? (
                                <Localize i18n_default_text='Pick an end date' />
                            ) : (
                                <Localize i18n_default_text='Pick an end time' />
                            )
                        }
                    />
                    {open && (
                        <DaysDatepicker
                            start_date={getDatePickerStartDate(
                                duration_units_list,
                                server_time,
                                start_time,
                                duration_min_max
                            )}
                            end_date={browsing_expiry_date}
                            setEndDate={handleDate}
                        />
                    )}
                    {open_timepicker && (
                        <EndTimePicker
                            setEndTime={setBrowsingExpiryTime}
                            end_time={browsing_expiry_time}
                            current_gmt_time={current_gmt_time}
                            adjusted_start_time={adjusted_start_time}
                        />
                    )}
                    <ActionSheet.Footer
                        alignment='vertical'
                        shouldCloseOnPrimaryButtonClick={false}
                        isPrimaryButtonDisabled={is_disabled}
                        primaryAction={{
                            content: <Localize i18n_default_text='Done' />,
                            onAction: () => {
                                if (!is_disabled) {
                                    setOpen(false);
                                    setOpenTimePicker(false);
                                    setSelectedExpiryTime(browsing_expiry_time);
                                }
                            },
                        }}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </div>
    );
};

export default DayInput;
