import React from 'react';
import { Text } from '@deriv/components';

type TEmptyTradeHistoryMessage = {
    component_icon?: React.ReactElement;
    has_selected_date: boolean;
    localized_message: React.ReactNode;
    localized_period_message: React.ReactNode;
};

const EmptyTradeHistoryMessage = ({
    has_selected_date,
    component_icon,
    localized_message,
    localized_period_message,
}: TEmptyTradeHistoryMessage) => {
    return (
        <React.Fragment>
            <div className='empty-trade-history'>
                {component_icon && (
                    <div className='empty-trade-history__icon' data-testid='dt_empty_trade_history_icon'>
                        {React.cloneElement(component_icon, {
                            fill: 'var(--color-text-disabled)',
                            iconSize: '2xl',
                        })}
                    </div>
                )}
                <Text size='xs' align='center' color='disabled' className='empty-trade-history__text'>
                    {!has_selected_date ? localized_message : localized_period_message}
                </Text>
            </div>
        </React.Fragment>
    );
};

export default EmptyTradeHistoryMessage;
