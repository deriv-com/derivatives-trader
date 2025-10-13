import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { Loading } from '@deriv/components';
import { useLocalStorageData } from '@deriv/api';
import { getSymbolDisplayName } from '@deriv/shared';
import { useStore } from '@deriv/stores';

import AccumulatorStats from 'AppV2/Components/AccumulatorStats';
import BottomNav from 'AppV2/Components/BottomNav';
import ClosedMarketMessage from 'AppV2/Components/ClosedMarketMessage';
import CurrentSpot from 'AppV2/Components/CurrentSpot';
import MarketSelector from 'AppV2/Components/MarketSelector';
import OnboardingGuide from 'AppV2/Components/OnboardingGuide/GuideForPages';
import PurchaseButton from 'AppV2/Components/PurchaseButton';
import ServiceErrorSheet from 'AppV2/Components/ServiceErrorSheet';
import TradeErrorSnackbar from 'AppV2/Components/TradeErrorSnackbar';
import { TradeParameters, TradeParametersContainer } from 'AppV2/Components/TradeParameters';
import useContractsFor from 'AppV2/Hooks/useContractsFor';
import useDefaultSymbol from 'AppV2/Hooks/useDefaultSymbol';
import { getChartHeight, HEIGHT } from 'AppV2/Utils/layout-utils';
import { getDisplayedContractTypes } from 'AppV2/Utils/trade-types-utils';
import { isDigitTradeType } from 'Modules/Trading/Helpers/digits';
import { useTraderStore } from 'Stores/useTraderStores';

import { trackAnalyticsEvent } from '@deriv/shared';
import { TradeChart } from '../Chart';

import TradeTypes from './trade-types';

const Trade = observer(() => {
    const [is_minimized_params_visible, setIsMinimizedParamsVisible] = React.useState(false);
    const chart_ref = React.useRef<HTMLDivElement>(null);
    const {
        client,
        common: { current_language, network_status },
        ui: { is_dark_mode_on },
    } = useStore();
    const { is_logged_in } = client;
    const {
        active_symbols,
        contract_type,
        has_cancellation,
        is_accumulator,
        is_multiplier,
        is_market_closed,
        onChange,
        onMount,
        onUnmount,
        symbol,
        proposal_info,
        trade_types: trade_types_store,
        trade_type_tab,
    } = useTraderStore();
    const { trade_types } = useContractsFor();
    useDefaultSymbol(); // This will initialize and set the default symbol
    const [guide_dtrader_v2] = useLocalStorageData<Record<string, boolean>>('guide_dtrader_v2', {
        trade_types_selection: false,
        trade_page: false,
        positions_page: false,
    });

    // For handling edge cases of snackbar:
    const contract_types = getDisplayedContractTypes(trade_types_store, contract_type, trade_type_tab);
    const is_all_types_with_errors = contract_types.every(item => proposal_info?.[item]?.has_error);
    const is_any_type_with_errors = contract_types.some(item => proposal_info?.[item]?.has_error);
    const is_high_low = /^high_low$/.test(contract_type.toLowerCase());

    // Showing snackbar for all cases, except when it is Rise/Fall or Digits and only one subtype has error
    const should_show_snackbar =
        contract_types.length === 1 ||
        is_multiplier ||
        is_all_types_with_errors ||
        (is_high_low && is_any_type_with_errors);

    const symbols = React.useMemo(
        () =>
            active_symbols.map(({ symbol: underlying }) => ({
                text: getSymbolDisplayName(active_symbols, underlying),
                value: underlying,
            })),
        [active_symbols]
    );

    const onTradeTypeSelect = React.useCallback(
        (
            e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
            subform_name: string,
            trade_type_count: number
        ) => {
            const selected_trade_type = trade_types.find(({ text }) => text === (e.target as HTMLButtonElement).textContent);
            onChange({
                target: {
                    name: 'contract_type',
                    value: selected_trade_type?.value,
                },
            });
            trackAnalyticsEvent('ce_trade_types_form_v2', {
                action: 'select_trade_type',
                trade_type_name: selected_trade_type?.text || '',
            });
        },
        [trade_types, onChange, symbol]
    );

    const onScroll = React.useCallback(() => {
        const current_chart_ref = chart_ref?.current;
        if (current_chart_ref) {
            const chart_bottom_Y = current_chart_ref.getBoundingClientRect().bottom;
            const container_bottom_Y = window.innerHeight - HEIGHT.BOTTOM_NAV;
            setIsMinimizedParamsVisible(chart_bottom_Y <= container_bottom_Y);
        }
    }, []);

    React.useEffect(() => {
        onMount();
        return onUnmount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current_language, network_status.class]);

    return (
        <BottomNav onScroll={onScroll}>
            {symbols.length && trade_types.length ? (
                <React.Fragment>
                    <div className='trade'>
                        <TradeTypes
                            contract_type={contract_type}
                            onTradeTypeSelect={onTradeTypeSelect}
                            trade_types={trade_types}
                            is_dark_mode_on={is_dark_mode_on}
                        />
                        <MarketSelector />
                        {isDigitTradeType(contract_type) && <CurrentSpot />}
                        <TradeParametersContainer>
                            <TradeParameters />
                        </TradeParametersContainer>
                        <div className='trade__chart-tooltip'>
                            <section
                                className={clsx('trade__chart', { 'trade__chart--with-borderRadius': !is_accumulator })}
                                style={{
                                    height: getChartHeight({ is_accumulator, symbol, has_cancellation, contract_type }),
                                }}
                                ref={chart_ref}
                            >
                                <TradeChart />
                            </section>
                        </div>
                        {is_accumulator && <AccumulatorStats />}
                    </div>
                    <div className={clsx('trade__parameter', { 'trade__parameter--with-button': !is_market_closed })}>
                        <TradeParametersContainer is_minimized_visible={is_minimized_params_visible} is_minimized>
                            <TradeParameters is_minimized />
                        </TradeParametersContainer>
                        {!is_market_closed && <PurchaseButton />}
                    </div>
                    {!guide_dtrader_v2?.trade_page && is_logged_in && (
                        <OnboardingGuide type='trade_page' is_dark_mode_on={is_dark_mode_on} />
                    )}
                </React.Fragment>
            ) : (
                <Loading.DTraderV2 />
            )}
            <ServiceErrorSheet />
            <ClosedMarketMessage />
            <TradeErrorSnackbar
                error_fields={['stop_loss', 'take_profit', 'date_start', 'stake', 'amount']}
                should_show_snackbar={should_show_snackbar}
            />
        </BottomNav>
    );
});

export default Trade;
