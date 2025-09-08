import React from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import { Money, Text } from '@deriv/components';
import { getDecimalPlaces } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';

import { FastMarker } from 'Modules/SmartChart';

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
    alignment = 'right',
    className = 'sc-accumulators-profit-loss-tooltip',
    current_spot,
    current_spot_time,
    currency,
    // @ts-expect-error contract_info is not typed correctly this will not be an issue after the types are fixed
    exit_spot,
    exit_tick,
    // @ts-expect-error contract_info is not typed correctly this will not be an issue after the types are fixed
    exit_spot_time,
    exit_tick_time,
    high_barrier,
    is_sold,
    profit,
    profit_percentage,
    should_show_profit_text,
    is_mobile,
}: TAccumulatorsProfitLossTooltip) => {
    // Backward compatibility: fallback to old field names
    const actual_exit_spot_time = exit_spot_time ?? exit_tick_time;
    const actual_exit_spot = exit_spot ?? exit_tick;
    const [is_tooltip_open, setIsTooltipOpen] = React.useState(false);
    const won = Number(profit) >= 0;
    const tooltip_timeout = React.useRef<ReturnType<typeof setTimeout>>();
    const should_show_profit_percentage = getDecimalPlaces(currency) > 2 && !!profit_percentage;

    React.useEffect(() => {
        return () => {
            clearTimeout(tooltip_timeout.current);
        };
    }, []);

    React.useEffect(() => {
        if (is_sold) {
            setIsTooltipOpen(true);
            tooltip_timeout.current = onCloseDelayed(3000);
        }
    }, [is_sold]);

    const onCloseDelayed = (duration: number) =>
        setTimeout(() => {
            setIsTooltipOpen(false);
        }, duration);

    const onHoverOrTapHandler = () => {
        clearTimeout(tooltip_timeout.current);
        tooltip_timeout.current = onCloseDelayed(1500);
    };

    const opposite_arrow_position = React.useMemo(() => {
        const horizontal = ['left', 'right'];
        return horizontal.includes(alignment)
            ? horizontal.find(el => el !== alignment)
            : ['top', 'bottom'].find(el => el !== alignment);
    }, [alignment]);

    const onRef = (ref: TRef | null): void => {
        if (ref) {
            if (!actual_exit_spot) {
                // this call will hide the marker:
                ref.setPosition({ epoch: null, price: null });
            }
            if (actual_exit_spot_time && actual_exit_spot) {
                ref.setPosition({
                    epoch: +actual_exit_spot_time,
                    price: +actual_exit_spot,
                });
            }
        }
    };

    if (profit === undefined || isNaN(Number(profit))) return null;

    if (!is_sold && current_spot_time && high_barrier && should_show_profit_text)
        return (
            <AccumulatorsProfitLossText
                currency={currency}
                current_spot={current_spot}
                current_spot_time={current_spot_time}
                profit_value={should_show_profit_percentage ? profit_percentage : profit}
                should_show_profit_percentage={should_show_profit_percentage}
            />
        );

    return is_sold && actual_exit_spot_time ? (
        <FastMarker markerRef={onRef} className={classNames(className, won ? 'won' : 'lost')}>
            <span
                className={`${className}__spot-circle`}
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={onHoverOrTapHandler}
                onTouchStart={() => setIsTooltipOpen(true)}
                onTouchEnd={onHoverOrTapHandler}
                data-testid='dt_accumulator_tooltip_spot'
            />
            <CSSTransition
                in={is_tooltip_open}
                timeout={{
                    exit: 500,
                }}
                unmountOnExit
                classNames={`${className}__content`}
            >
                <div className={classNames(`${className}__content`, `arrow-${opposite_arrow_position}`)}>
                    <Text size={is_mobile ? 'xxxxs' : 'xxs'} className={`${className}__text`}>
                        <Localize i18n_default_text='Total profit/loss:' />
                    </Text>
                    <Text size={is_mobile ? 'xxxs' : 'xs'} className={`${className}__text`} weight='bold'>
                        <Money amount={profit} currency={currency} has_sign show_currency />
                    </Text>
                </div>
            </CSSTransition>
        </FastMarker>
    ) : null;
};

export default React.memo(AccumulatorsProfitLossTooltip);
