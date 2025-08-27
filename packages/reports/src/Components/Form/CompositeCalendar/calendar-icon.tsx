import React from 'react';
import { LegacyCalendar1pxIcon } from '@deriv/quill-icons';

type TCalendarIcon = {
    onClick: () => void;
};

const CalendarIcon = ({ onClick }: TCalendarIcon) => (
    <LegacyCalendar1pxIcon
        onClick={onClick}
        iconSize='xs'
        className='inline-icon'
        data-testid='dt_calendar_icon'
        fill='var(--color-text-primary)'
    />
);

export default CalendarIcon;
