import React from 'react';

import { usePrevious } from '@deriv/components';
import { getDurationPeriod, getDurationUnitText, getEndTime, getPlatformRedirect } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Loader, useDevice } from '@deriv-com/ui';

import { SmartChart } from 'Modules/SmartChart';
import {
    createSmartChartsChampionAdapter,
    TGetQuotes,
    TSubscribeQuotes,
    TUnsubscribeQuotes,
} from 'Modules/SmartChart/Adapters';
import ChartMarker from 'Modules/SmartChart/Components/Markers/marker';
import ResetContractChartElements from 'Modules/SmartChart/Components/Markers/reset-contract-chart-elements';
import { useTraderStore } from 'Stores/useTraderStores';

import { ChartBottomWidgets, ChartTopWidgets } from './contract-replay-widget';

const ReplayChart = observer(
    ({
        is_dark_theme_prop,
        is_accumulator_contract,
        is_reset_contract,
        is_vertical_scroll_disabled,
    }: {
        is_dark_theme_prop?: boolean;
        is_accumulator_contract?: boolean;
        is_reset_contract?: boolean;
        is_vertical_scroll_disabled?: boolean;
    }) => {
        const trade = useTraderStore();
        const { contract_replay, common, ui } = useStore();
        const { isMobile } = useDevice();
        const { contract_store, chart_state, chartStateChange, margin } = contract_replay;
        const { contract_config, is_digit_contract, barriers_array, getContractsArray, markers_array, contract_info } =
            contract_store;
        const symbol = contract_info.underlying_symbol;
        const { audit_details, barrier_count } = contract_info;
        const allow_scroll_to_epoch = chart_state === 'READY' || chart_state === 'SCROLL_TO_LEFT';
        const { current_language, is_socket_opened } = common;
        const { is_chart_layout_default, is_chart_countdown_visible } = ui;
        const { end_epoch, chart_type, start_epoch, granularity } = contract_config || {};
        const is_dark_theme = is_dark_theme_prop || ui.is_dark_mode_on;
        // Forwarding contract logic removed - contracts now always use start_epoch
        /**
         * TODO: remove forcing light theme once DBot supports dark theme
         * DBot does not support for dark theme since till now,
         * as a result, if any user come to report detail pages
         * from DBot, we should force it to have light theme
         */
        const from_platform = getPlatformRedirect();
        const should_force_light_theme = from_platform.name === 'DBot';
        const settings = {
            language: current_language,
            theme: is_dark_theme && !should_force_light_theme ? 'dark' : 'light',
            position: is_chart_layout_default ? 'bottom' : 'left',
            countdown: is_chart_countdown_visible,
            assetInformation: false, // ui.is_chart_asset_info_visible,
            isHighestLowestMarkerEnabled: false, // TODO: Pending UI
        };
        const scroll_to_epoch = allow_scroll_to_epoch && contract_config ? contract_config.scroll_to_epoch : undefined;
        const all_ticks = audit_details ? audit_details.all_ticks : [];
        const { wsForget, wsSubscribe, wsSendRequest, wsForgetStream } = trade;

        // Initialize SmartCharts Champion Adapter with store data for better performance
        const smartChartsAdapter = React.useMemo(() => {
            return createSmartChartsChampionAdapter({
                debug: false,
            });
        }, []);

        // Transform active symbols and fetch trading times for SmartCharts Champion format
        const [chartData, setChartData] = React.useState<{
            activeSymbols: any;
            tradingTimes?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
        }>({ activeSymbols: [] });

        // Fetch chart data including trading times
        React.useEffect(() => {
            const fetchChartData = async () => {
                try {
                    const data = await smartChartsAdapter.getChartData();
                    setChartData({
                        activeSymbols: data.activeSymbols,
                        tradingTimes: data.tradingTimes,
                    });
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error fetching chart data:', error);
                }
            };

            fetchChartData();
        }, [smartChartsAdapter]);

        const isBottomWidgetVisible = () => {
            return !isMobile && is_digit_contract;
        };

        const getChartYAxisMargin = () => {
            const chart_margin = {
                top: isMobile ? 96 : 148,
                bottom: isBottomWidgetVisible() ? 128 : 112,
            };

            if (isMobile) {
                chart_margin.bottom = 48;
                chart_margin.top = 48;
            }

            return chart_margin;
        };
        const prev_start_epoch = usePrevious(start_epoch);

        const has_ended = !!getEndTime(contract_info);
        const is_dtrader_v2_enabled = isMobile; // V2 for mobile, V1 for desktop

        // Create wrapper functions for SmartCharts Champion API
        const getQuotes: TGetQuotes = async params => {
            if (!smartChartsAdapter) {
                throw new Error('Adapter not initialized');
            }

            const result = await smartChartsAdapter.getQuotes({
                symbol: params.symbol,
                granularity: params.granularity as any,
                count: params.count,
                start: params.start,
                end: params.end,
            });

            // Transform adapter result to SmartCharts Champion format
            if (params.granularity === 0) {
                // For ticks, return history format
                return {
                    history: {
                        prices: result.quotes.map(q => q.Close),
                        times: result.quotes.map(q => parseInt(q.Date)),
                    },
                };
            }
            // For candles, return candles format
            return {
                candles: result.quotes.map(q => ({
                    open: q.Open || q.Close,
                    high: q.High || q.Close,
                    low: q.Low || q.Close,
                    close: q.Close,
                    epoch: parseInt(q.Date),
                })),
            };
        };

        const subscribeQuotes: TSubscribeQuotes = (params, callback) => {
            if (!smartChartsAdapter) {
                return () => {};
            }

            return smartChartsAdapter.subscribeQuotes(
                {
                    symbol: params.symbol,
                    granularity: params.granularity as any,
                },
                quote => {
                    callback(quote);
                }
            );
        };

        const unsubscribeQuotes: TUnsubscribeQuotes = request => {
            if (smartChartsAdapter) {
                // If we have request details, use the adapter's unsubscribe method
                if (request?.symbol && typeof request.granularity !== 'undefined') {
                    smartChartsAdapter.unsubscribeQuotes({
                        symbol: request.symbol,
                        granularity: request.granularity as any,
                    });
                } else {
                    // Fallback: unsubscribe all via transport
                    smartChartsAdapter.transport.unsubscribeAll('ticks');
                }
            }
        };

        if (!symbol || !chartData || !chartData.tradingTimes) return <Loader />;

        return (
            <SmartChart
                id='replay'
                barriers={barriers_array}
                bottomWidgets={isBottomWidgetVisible() ? ChartBottomWidgets : undefined}
                chartControlsWidgets={null}
                chartType={chart_type}
                endEpoch={end_epoch}
                margin={margin}
                isMobile={isMobile}
                enabledNavigationWidget={!isMobile}
                enabledChartFooter={false}
                granularity={granularity}
                getQuotes={getQuotes}
                chartData={chartData}
                subscribeQuotes={subscribeQuotes}
                unsubscribeQuotes={unsubscribeQuotes}
                crosshair={isMobile ? 0 : undefined}
                maxTick={isMobile ? 8 : undefined}
                settings={settings}
                startEpoch={start_epoch}
                scrollToEpoch={scroll_to_epoch}
                stateChangeListener={chartStateChange}
                symbol={symbol}
                allTicks={all_ticks}
                topWidgets={is_dtrader_v2_enabled ? () => <React.Fragment /> : ChartTopWidgets}
                isConnectionOpened={is_socket_opened}
                isStaticChart={
                    // forcing chart reload when start_epoch changes to an earlier epoch for ACCU closed contract:
                    !!is_accumulator_contract && !!end_epoch && Number(start_epoch) < Number(prev_start_epoch)
                }
                shouldFetchTradingTimes={false}
                should_zoom_out_on_yaxis={is_accumulator_contract}
                yAxisMargin={getChartYAxisMargin()}
                anchorChartToLeft={isMobile}
                shouldFetchTickHistory={
                    getDurationUnitText(getDurationPeriod(contract_info)) !== 'seconds' ||
                    contract_info.status === 'open'
                }
                shouldDrawTicksFromContractInfo={is_accumulator_contract}
                contractInfo={contract_info}
                contracts_array={getContractsArray()}
                isLive={!has_ended}
                isVerticalScrollEnabled={!is_vertical_scroll_disabled}
                startWithDataFitMode={true}
            >
                {markers_array.map(({ content_config, marker_config, react_key, type }) => (
                    <ChartMarker
                        key={react_key}
                        marker_config={marker_config}
                        marker_content_props={content_config}
                        is_positioned_before={(type === 'SPOT_ENTRY' || type === 'SPOT_EXIT') && barrier_count === 2}
                    />
                ))}
                {is_reset_contract && contract_info?.reset_time && (
                    <ResetContractChartElements contract_info={contract_info} />
                )}
            </SmartChart>
            // <>Chart here</>
        );
    }
);
export default ReplayChart;
