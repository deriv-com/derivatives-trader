import React, { useMemo } from 'react';
import moment from 'moment';

import { addComma, formatDate, formatTime, getEndTime, TContractInfo } from '@deriv/shared';
import { Localize } from '@deriv-com/translations';

import CardWrapper from '../CardWrapper';

import EntryExitDetailRow from './entry-exit-details-row';

const getDateTimeFromEpoch = (epoch: number | string | undefined | null) => {
    // Handle undefined, null, or empty values
    if (epoch === undefined || epoch === null || epoch === '') {
        return undefined;
    }

    // Convert to number and validate
    const epochNumber = typeof epoch === 'string' ? parseFloat(epoch) : epoch;

    // Check if conversion resulted in a valid number and is positive
    if (isNaN(epochNumber) || epochNumber <= 0) {
        return undefined;
    }

    try {
        const date = new Date(epochNumber * 1000);

        // Validate the created date is valid
        if (isNaN(date.getTime())) {
            return undefined;
        }

        const momentDate = moment(date);
        const formattedDate = formatDate(momentDate, 'DD MMM YYYY');
        const formattedTime = formatTime(epochNumber, 'HH:mm:ss [GMT]');

        return {
            date: formattedDate,
            time: formattedTime,
        };
    } catch (error) {
        // Handle any unexpected errors in date formatting
        return undefined;
    }
};

const EntryExitDetails = ({ contract_info }: { contract_info: TContractInfo }) => {
    const { date_start, entry_spot_time, entry_spot, exit_spot_time, exit_spot } = contract_info;

    const actual_entry_spot = entry_spot;
    const actual_exit_spot = exit_spot;
    const actual_exit_spot_display_value = exit_spot;
    const actual_entry_spot_time = entry_spot_time;
    const actual_exit_spot_time = exit_spot_time;

    const dateTimes = useMemo(
        () => ({
            entry: actual_entry_spot_time ? getDateTimeFromEpoch(actual_entry_spot_time) : undefined,
            exit: actual_exit_spot_time ? getDateTimeFromEpoch(actual_exit_spot_time) : undefined,
            start: date_start ? getDateTimeFromEpoch(date_start) : undefined,
            end: getEndTime(contract_info) ? getDateTimeFromEpoch(getEndTime(contract_info) ?? 0) : undefined,
        }),
        [contract_info]
    );

    const entryValue = actual_entry_spot ? addComma(actual_entry_spot.toString()) : null;
    const exitValue = actual_exit_spot_display_value
        ? addComma(actual_exit_spot_display_value)
        : actual_exit_spot
          ? addComma(actual_exit_spot.toString())
          : null;

    return (
        <CardWrapper title={<Localize i18n_default_text='Entry & exit details' />} className='entry-exit-details'>
            <div className='entry-exit-details__table'>
                {dateTimes.start && (
                    <EntryExitDetailRow
                        label={<Localize i18n_default_text='Start time' />}
                        value={dateTimes.start.date}
                        time={dateTimes.start.time}
                    />
                )}
                {dateTimes.entry && entryValue && (
                    <EntryExitDetailRow
                        label={<Localize i18n_default_text='Entry spot' />}
                        value={entryValue}
                        {...dateTimes.entry}
                    />
                )}
                {dateTimes.end && (
                    <EntryExitDetailRow
                        label={<Localize i18n_default_text='Exit time' />}
                        value={dateTimes.end.date}
                        time={dateTimes.end.time}
                    />
                )}
                {dateTimes.exit && exitValue && (
                    <EntryExitDetailRow
                        label={<Localize i18n_default_text='Exit spot' />}
                        value={exitValue}
                        {...dateTimes.exit}
                    />
                )}
            </div>
        </CardWrapper>
    );
};

export default EntryExitDetails;
