import React from 'react';

import { TActiveSymbolsResponse, TTicksStreamResponse } from '@deriv/api';
import {
    ChartBarrierStore,
    isAccumulatorContract,
    isContractSupportedAndStarted,
    isTurbosContract,
    isVanillaContract,
    TRADE_TYPES,
} from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { useDevice } from '@deriv-com/ui';

import { filterByContractType } from 'App/Components/Elements/PositionsDrawer/helpers';
import useActiveSymbols from 'AppV2/Hooks/useActiveSymbols';
import useDefaultSymbol from 'AppV2/Hooks/useDefaultSymbol';
import { SmartChart } from 'Modules/SmartChart';
import {
    createSmartChartsChampionAdapter,
    TGetQuotes,
    TGranularity,
    TSubscribeQuotes,
} from 'Modules/SmartChart/Adapters';
import AccumulatorsChartElements from 'Modules/SmartChart/Components/Markers/accumulators-chart-elements';
import ToolbarWidgets from 'Modules/SmartChart/Components/toolbar-widgets';
import { useTraderStore } from 'Stores/useTraderStores';

type TickSpotData = NonNullable<TTicksStreamResponse['tick']>;
type ActiveSymbols = NonNullable<TActiveSymbolsResponse['active_symbols']>;

type TBottomWidgetsParams = {
    digits: number[];
    tick: TickSpotData | null;
};

const BottomWidgetsMobile = observer(({ digits, tick }: TBottomWidgetsParams) => {
    const { setDigitStats, setTickData } = useTraderStore();

    // Using bottom widgets in V2 to get tick data for all trade types and to get digit stats for Digit trade types
    React.useEffect(() => {
        setTickData(tick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    React.useEffect(() => {
        setDigitStats(digits);
        // For digits array, which is coming from SmartChart, reference is not always changing.
        // As it is the same, this useEffect was not triggered on every array update.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digits.join('-')]);

    // render no bottom widgets on chart
    return null;
});

const TradeChart = observer(() => {
    const { ui, common, contract_trade, portfolio } = useStore();
    const { isMobile } = useDevice();
    const {
        accumulator_barriers_data,
        accumulator_contract_barriers_data,
        chart_type,
        granularity,
        has_crossed_accu_barriers,
        markers_array,
        updateChartType,
        updateGranularity,
        updateAccumulatorBarriersData,
    } = contract_trade;
    const ref = React.useRef<{ hasPredictionIndicators(): void; triggerPopup(arg: () => void): void }>(null);
    const { all_positions, removePositionById: onClickRemove } = portfolio;
    const { is_chart_countdown_visible, is_chart_layout_default, is_dark_mode_on, is_positions_drawer_on } = ui;
    const { current_language, is_socket_opened } = common;
    const { activeSymbols: active_symbols } = useActiveSymbols();
    const { symbol } = useDefaultSymbol();
    const {
        barriers_flattened: extra_barriers,
        chartStateChange,
        chart_layout,
        contract_type,
        exportLayout,
        has_alternative_source,
        has_barrier,
        main_barrier_flattened: main_barrier,
        setChartStatus,
        show_digits_stats,
        onChange,
        setTickData,
        prev_contract_type,
    } = useTraderStore();
    const is_accumulator = isAccumulatorContract(contract_type);
    const settings = {
        countdown: is_chart_countdown_visible,
        isHighestLowestMarkerEnabled: false, // TODO: Pending UI,
        language: current_language.toLowerCase(),
        position: is_chart_layout_default ? 'bottom' : 'left',
        theme: is_dark_mode_on ? 'dark' : 'light',
        ...(is_accumulator ? { whitespace: 190, minimumLeftBars: isMobile ? 3 : undefined } : {}),
        ...(has_barrier ? { whitespace: 110 } : {}),
    };

    const { current_spot, current_spot_time } = accumulator_barriers_data || {};

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
    }>({
        activeSymbols: JSON.parse(JSON.stringify(active_symbols)),
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    // Fetch chart data including trading times
    React.useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await smartChartsAdapter.getChartData();
                setChartData({
                    activeSymbols: data.activeSymbols,
                    tradingTimes: data.tradingTimes,
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error fetching chart data:', error);
                setError(error instanceof Error ? error : new Error('Failed to fetch chart data'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchChartData();
    }, [smartChartsAdapter]);

    const retryFetchChartData = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await smartChartsAdapter.getChartData();
            setChartData({
                activeSymbols: data.activeSymbols,
                tradingTimes: data.tradingTimes,
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching chart data:', error);
            setError(error instanceof Error ? error : new Error('Failed to fetch chart data'));
        } finally {
            setIsLoading(false);
        }
    }, [smartChartsAdapter]);

    React.useEffect(() => {
        if ((is_accumulator || show_digits_stats) && ref.current?.hasPredictionIndicators()) {
            const cancelCallback = () => onChange({ target: { name: 'contract_type', value: prev_contract_type } });
            ref.current?.triggerPopup(cancelCallback);
        }
    }, [is_accumulator, onChange, prev_contract_type, show_digits_stats]);

    const getMarketsOrder = (active_symbols: ActiveSymbols): string[] => {
        const synthetic_index = 'synthetic_index';
        const has_synthetic_index = active_symbols.some(s => s.market === synthetic_index);
        return active_symbols
            .slice()
            .sort((a, b) => ((a.underlying_symbol || '') < (b.underlying_symbol || '') ? -1 : 1))
            .map(s => s.market)
            .reduce(
                (arr: string[], market: string) => {
                    if (arr.indexOf(market) === -1) arr.push(market);
                    return arr;
                },
                has_synthetic_index ? [synthetic_index] : []
            );
    };

    // Type guard for granularity validation
    const isValidGranularity = (g: number): g is TGranularity => {
        return [0, 60, 120, 180, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 86400].includes(g);
    };

    // Create wrapper functions for SmartCharts Champion API
    const getQuotes: TGetQuotes = async params => {
        if (!smartChartsAdapter) {
            throw new Error('Adapter not initialized');
        }

        // Validate granularity with type guard
        const validatedGranularity = isValidGranularity(params.granularity) ? params.granularity : 0;

        const result = await smartChartsAdapter.getQuotes({
            symbol: params.symbol,
            granularity: validatedGranularity,
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

        const passthrough_callback = (...args: [any]) => {
            callback(...args);
            if ('ohlc' in args[0] && granularity !== 0) {
                const { close, pip_size } = args[0].ohlc as { close: string; pip_size: number };
                if (close && pip_size) setTickData({ pip_size, quote: Number(close) });
            }
            interface AccumulatorBarriersData {
                current_spot?: number;
                current_spot_time?: number;
                tick_update_timestamp?: number;
                accumulators_high_barrier?: string;
                accumulators_low_barrier?: string;
                barrier_spot_distance?: string;
                previous_spot_time?: number;
            }

            if (is_accumulator) {
                let current_spot_data: AccumulatorBarriersData = {};

                if ('tick' in args[0]) {
                    const { epoch, quote } = args[0].tick as any;
                    current_spot_data = {
                        current_spot: quote,
                        current_spot_time: epoch,
                    };
                } else if ('history' in args[0]) {
                    const { prices, times } = args[0].history as any;
                    current_spot_data = {
                        current_spot: prices?.[prices?.length - 1],
                        current_spot_time: times?.[times?.length - 1],
                        previous_spot_time: times?.[times?.length - 2],
                    };
                } else {
                    return;
                }

                updateAccumulatorBarriersData(current_spot_data);
            }
        };

        // Validate granularity with type guard
        const validatedGranularity = isValidGranularity(params.granularity) ? params.granularity : 0;

        return smartChartsAdapter.subscribeQuotes(
            {
                symbol: params.symbol,
                granularity: validatedGranularity,
            },
            quote => {
                passthrough_callback(quote);
            }
        );
    };

    const barriers: ChartBarrierStore[] = main_barrier ? [main_barrier, ...extra_barriers] : extra_barriers;

    // max ticks to display for mobile view for tick chart
    const max_ticks = granularity === 0 ? 8 : 24;

    // Filter positions based on current symbol and contract type
    const filtered_positions = all_positions.filter(
        p =>
            isContractSupportedAndStarted(symbol, p.contract_info) &&
            (isTurbosContract(contract_type) || isVanillaContract(contract_type)
                ? filterByContractType(
                      p.contract_info,
                      isTurbosContract(contract_type) ? TRADE_TYPES.TURBOS.SHORT : TRADE_TYPES.VANILLA.CALL
                  ) ||
                  filterByContractType(
                      p.contract_info,
                      isTurbosContract(contract_type) ? TRADE_TYPES.TURBOS.LONG : TRADE_TYPES.VANILLA.PUT
                  )
                : filterByContractType(p.contract_info, contract_type))
    );

    // Get IDs of closed positions to auto-remove
    const closed_positions_ids =
        filtered_positions &&
        filtered_positions.filter(position => position.contract_info?.is_sold).map(p => p.contract_info.contract_id);

    // Automatically remove closed positions after 8 seconds
    React.useEffect(() => {
        closed_positions_ids.map(positionId => {
            const timeout = setTimeout(() => {
                onClickRemove(positionId);
            }, 8000);

            return () => clearTimeout(timeout);
        });
    }, [closed_positions_ids, onClickRemove]);

    if (!symbol || !active_symbols.length) return null;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div>Loading chart data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    gap: '16px',
                }}
            >
                <div>Error loading chart data: {error.message}</div>
                <button onClick={retryFetchChartData} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Retry
                </button>
            </div>
        );
    }

    if (!chartData || !chartData.tradingTimes) return null;

    return (
        <SmartChart
            drawingToolFloatingMenuPosition={isMobile ? { x: 100, y: 100 } : { x: 400, y: 200 }}
            ref={ref}
            barriers={barriers}
            contracts_array={markers_array}
            bottomWidgets={BottomWidgetsMobile}
            showLastDigitStats
            chartControlsWidgets={null}
            chartStatusListener={(v: boolean) => setChartStatus(!v, true)}
            chartType={chart_type}
            chartData={chartData}
            getQuotes={getQuotes}
            subscribeQuotes={subscribeQuotes}
            unsubscribeQuotes={smartChartsAdapter.unsubscribeQuotes}
            getChartData={smartChartsAdapter.getChartData}
            enabledNavigationWidget={!isMobile}
            enabledChartFooter={false}
            id='trade'
            isMobile={isMobile}
            isVerticalScrollEnabled={false}
            maxTick={isMobile ? max_ticks : undefined}
            granularity={show_digits_stats || is_accumulator ? 0 : granularity}
            settings={settings}
            allowTickChartTypeOnly={show_digits_stats || is_accumulator}
            stateChangeListener={chartStateChange}
            symbol={symbol}
            topWidgets={() => <div /> /* to hide the original chart market dropdown */}
            isConnectionOpened={is_socket_opened}
            clearChart={false}
            toolbarWidget={() => {
                return <ToolbarWidgets updateChartType={updateChartType} updateGranularity={updateGranularity} />;
            }}
            importedLayout={chart_layout}
            onExportLayout={exportLayout}
            shouldFetchTradingTimes={false}
            hasAlternativeSource={has_alternative_source}
            getMarketsOrder={getMarketsOrder}
            should_zoom_out_on_yaxis={is_accumulator}
            yAxisMargin={{
                top: isMobile ? 76 : 106,
            }}
            isLive
            leftMargin={!isMobile && is_positions_drawer_on ? 328 : 80}
        >
            {is_accumulator && (
                <AccumulatorsChartElements
                    all_positions={all_positions}
                    current_spot={current_spot}
                    current_spot_time={current_spot_time}
                    has_crossed_accu_barriers={has_crossed_accu_barriers}
                    should_show_profit_text={!!accumulator_contract_barriers_data.accumulators_high_barrier}
                    symbol={symbol}
                    is_mobile={isMobile}
                />
            )}
        </SmartChart>
        // <>Chart here</>
    );
});
export default TradeChart;
