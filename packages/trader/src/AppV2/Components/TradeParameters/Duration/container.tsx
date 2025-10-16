import React, { useState } from 'react';

import { observer } from '@deriv/stores';
import { trackAnalyticsEvent } from '@deriv/shared';
import { Localize } from '@deriv-com/translations';
import { ActionSheet } from '@deriv-com/quill-ui';

import { DURATION_UNIT } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

import DurationChips from './chips';
import DayInput from './day';
import DurationWheelPicker from './duration-wheel-picker';

const DurationActionSheetContainer = observer(
    ({
        unit,
        setUnit,
        selected_expiry_time,
        selected_expiry_date,
        setSelectedExpiryTime,
        setSavedExpiryTime,
        setSelectedExpiryDate,
        setSavedExpiryDate,
    }: {
        unit: string;
        setUnit: (arg: string) => void;
        selected_expiry_time: string;
        selected_expiry_date: string;
        setSelectedExpiryTime: (arg: string) => void;
        setSavedExpiryTime: (arg: string) => void;
        setSelectedExpiryDate: (arg: string) => void;
        setSavedExpiryDate: (arg: string) => void;
    }) => {
        const { duration, duration_units_list, duration_min_max, onChangeMultiple } = useTraderStore();
        // Consolidated state for all duration units (t, s, m, h)
        // For t, s, m: [duration_value]
        // For h: [hours, minutes]
        const [selected_duration, setSelectedDuration] = useState<number[]>(() => {
            if (unit === DURATION_UNIT.HOURS) {
                // Initialize hours unit with [hours, minutes] format
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return [hours, minutes];
            }
            return [duration];
        });

        const onAction = () => {
            // Save the selected values
            setSavedExpiryDate(selected_expiry_date);
            setSavedExpiryTime(selected_expiry_time);

            if (unit === DURATION_UNIT.HOURS) {
                // For hours: selected_duration is [hours, minutes]
                const minutes = selected_duration[0] * 60 + selected_duration[1];
                setSelectedExpiryTime('');
                onChangeMultiple({
                    duration_unit: DURATION_UNIT.MINUTES,
                    duration: Number(minutes),
                    expiry_type: 'duration',
                });
                trackAnalyticsEvent('ce_trade_types_form_v2', {
                    action: 'customizing_trades',
                });
            } else if (unit === DURATION_UNIT.DAYS) {
                onChangeMultiple({
                    expiry_date: `${selected_expiry_date}T${selected_expiry_time}Z`,
                    expiry_time: selected_expiry_time,
                    expiry_type: 'endtime',
                });
                trackAnalyticsEvent('ce_trade_types_form_v2', {
                    action: 'customizing_trades',
                });
            } else {
                // For t, s, m: selected_duration is [duration_value]
                setSelectedExpiryTime('');
                onChangeMultiple({
                    duration_unit: unit,
                    duration: Number(selected_duration[0]),
                    expiry_type: 'duration',
                });
                trackAnalyticsEvent('ce_trade_types_form_v2', {
                    action: 'customizing_trades',
                });
            }
        };

        const onChangeUnit = React.useCallback(
            (value: string) => {
                setUnit(value);
                if (value === DURATION_UNIT.HOURS) {
                    // Initialize with 1 hour 0 minutes when switching to hours
                    const min_seconds = Math.max(duration_min_max?.intraday?.min || 3600, 3600);
                    const min_hours = Math.max(1, Math.ceil(min_seconds / 3600));
                    setSelectedDuration([min_hours, 0]);
                } else {
                    setSelectedDuration([]);
                }
            },
            [setUnit, duration_min_max]
        );

        const setWheelPickerValue = (index: number, value: string | number) => {
            const num_value = Number(value);
            if (unit === DURATION_UNIT.HOURS) {
                // For hours: update the specific index (0 for hours, 1 for minutes)
                const arr = [...selected_duration];
                arr[index] = num_value;
                setSelectedDuration(arr);
            } else {
                // For t, s, m: set single value
                setSelectedDuration([num_value]);
            }
        };

        return (
            <div className='duration-container'>
                <ActionSheet.Header title={<Localize i18n_default_text='Duration' />} />
                <DurationChips duration_units_list={duration_units_list} onChangeUnit={onChangeUnit} unit={unit} />
                {unit !== DURATION_UNIT.DAYS && (
                    <DurationWheelPicker
                        unit={unit}
                        setWheelPickerValue={setWheelPickerValue}
                        selected_duration={selected_duration}
                    />
                )}

                {unit === DURATION_UNIT.DAYS && (
                    <DayInput
                        selected_expiry_time={selected_expiry_time}
                        selected_expiry_date={selected_expiry_date}
                        setSelectedExpiryTime={setSelectedExpiryTime}
                        setSelectedExpiryDate={setSelectedExpiryDate}
                    />
                )}
                <ActionSheet.Footer
                    alignment='vertical'
                    primaryAction={{
                        content: <Localize i18n_default_text='Save' />,
                        onAction,
                    }}
                />
            </div>
        );
    }
);

export default DurationActionSheetContainer;
