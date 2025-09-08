import React from 'react';

import { FilterDropdown } from '@deriv/components';
import { observer } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

import { useReportsStore } from 'Stores/useReportsStores';

import CompositeCalendar from './Form/CompositeCalendar';

const FilterComponent = observer(() => {
    const { localize } = useTranslations();
    const { statement } = useReportsStore();
    const { action_type, date_from, date_to, handleFilterChange, handleDateChange } = statement;

    const filter_list = [
        {
            text: localize('All transactions'),
            value: 'all',
        },
        {
            text: localize('Buy'),
            value: 'buy',
        },
        {
            text: localize('Sell'),
            value: 'sell',
        },
        {
            text: localize('Deposit'),
            value: 'deposit',
        },
        {
            text: localize('Withdrawal'),
            value: 'withdrawal',
        },
    ];

    return (
        <React.Fragment>
            <CompositeCalendar onChange={handleDateChange} from={date_from} to={date_to} />
            <FilterDropdown
                dropdown_display_className='dc-dropdown__display--has-suffix-icon'
                filter_list={filter_list}
                handleFilterChange={handleFilterChange}
                initial_selected_filter={action_type}
            />
        </React.Fragment>
    );
});

export default FilterComponent;
