import React from 'react';

import { getDecimalPlaces } from '@deriv/shared';
import { useStore } from '@deriv/stores';

import AccumulatorsProfitLossText from './accumulators-profit-loss-text';

type TContractInfo = ReturnType<typeof useStore>['portfolio']['all_positions'][number]['contract_info'];

type TAccumulatorsProfitLossTooltip = {
    alignment?: string;
    className?: string;
    should_show_profit_text?: boolean;
    is_mobile?: boolean;
} & TContractInfo;

export type TRef = {
    setPosition: (position: { epoch: number | null; price: number | null }) => void;
};

const AccumulatorsProfitLossTooltip = ({
    current_spot,
    current_spot_time,
    currency,
    high_barrier,
    is_sold,
    profit,
    profit_percentage,
    should_show_profit_text,
}: TAccumulatorsProfitLossTooltip) => {
    const should_show_profit_percentage = getDecimalPlaces(currency) > 2 && !!profit_percentage;

    if (profit === undefined || isNaN(Number(profit))) return null;

    if (!is_sold && current_spot_time && high_barrier && should_show_profit_text) {
        return (
            <AccumulatorsProfitLossText
                currency={currency}
                current_spot={current_spot}
                current_spot_time={current_spot_time}
                profit_value={should_show_profit_percentage ? profit_percentage : Number(profit)}
                should_show_profit_percentage={should_show_profit_percentage}
            />
        );
    }

    return null;
};

export default React.memo(AccumulatorsProfitLossTooltip);
