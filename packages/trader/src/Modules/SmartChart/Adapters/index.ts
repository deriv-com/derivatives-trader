/**
 * SmartCharts Champion Adapter - Main Implementation
 *
 * Provides the main adapter interface that bridges Deriv API with SmartCharts Champion.
 * Implements TGetQuotes and TSubscribeQuotes providers for historical and streaming data.
 */

import { createServices } from './services';
import { enrichActiveSymbols } from './transformers';
import { createTransport } from './transport';
import type {
    ActiveSymbols,
    AdapterConfig,
    ILogger,
    SmartchartsChampionAdapter,
    SmartchartsChampionFunctions,
    TGetQuotesRequest,
    TGetQuotesResult,
    TGranularity,
    TQuote,
    TradingTimesMap,
    TServices,
    TSubscriptionCallback,
    TTransport,
    TUnsubscribeFunction,
} from './types';

/**
 * Logger implementation for main adapter
 */
class AdapterLogger implements ILogger {
    private isDebugEnabled: boolean;

    constructor(debug: boolean = false) {
        this.isDebugEnabled = debug;
    }

    info(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.log(`[Adapter] ${message}`, data);
        }
    }

    error(message: string, error?: any): void {
        // eslint-disable-next-line no-console
        console.error(`[Adapter] ${message}`, error);
    }

    warn(message: string, data?: any): void {
        // eslint-disable-next-line no-console
        console.warn(`[Adapter] ${message}`, data);
    }

    debug(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.debug(`[Adapter] ${message}`, data);
        }
    }
}

/**
 * Transformation utilities for converting between Deriv API and Champion formats
 */
const transformations = {
    /**
     * Transform Deriv API ticks_history response to TGetQuotesResult
     */
    toTGetQuotesResult(response: any, granularity: TGranularity): TGetQuotesResult {
        const quotes: TQuote[] = [];

        if (!response) {
            return { quotes, meta: { symbol: '', granularity } };
        }

        const { history, candles, prices, times } = response;
        const symbol = response.echo_req?.ticks_history || '';

        // Handle ticks (granularity = 0)
        if (granularity === 0 && history) {
            const { prices: tick_prices, times: tick_times } = history;
            if (tick_prices && tick_times) {
                for (let i = 0; i < tick_prices.length; i++) {
                    quotes.push({
                        Date: String(tick_times[i]),
                        Close: tick_prices[i],
                        DT: new Date(tick_times[i] * 1000),
                    });
                }
            }
        }
        // Handle candles (granularity > 0)
        else if (granularity > 0 && candles) {
            candles.forEach((candle: any) => {
                quotes.push({
                    Date: String(candle.epoch),
                    Open: candle.open,
                    High: candle.high,
                    Low: candle.low,
                    Close: candle.close,
                    DT: new Date(candle.epoch * 1000),
                });
            });
        }
        // Fallback for direct prices/times arrays
        else if (prices && times) {
            for (let i = 0; i < prices.length; i++) {
                quotes.push({
                    Date: String(times[i]),
                    Close: prices[i],
                    DT: new Date(times[i] * 1000),
                });
            }
        }

        return {
            quotes,
            meta: {
                symbol,
                granularity,
                delay_amount: response.pip_size || 0,
            },
        };
    },

    /**
     * Transform streaming tick/candle message to TQuote
     */
    toTQuoteFromStream(message: any, granularity: TGranularity): TQuote {
        if (granularity === 0 && message.tick) {
            const { tick } = message;
            return {
                Date: String(tick.epoch),
                Close: tick.quote,
                tick,
                DT: new Date(tick.epoch * 1000),
            };
        } else if (granularity > 0 && message.ohlc) {
            const { ohlc } = message;
            return {
                Date: String(ohlc.epoch),
                Open: ohlc.open,
                High: ohlc.high,
                Low: ohlc.low,
                Close: ohlc.close,
                ohlc,
                DT: new Date(ohlc.epoch * 1000),
            };
        }

        // Fallback for direct tick data
        return {
            Date: String(message.epoch || Date.now() / 1000),
            Close: message.quote || message.price || 0,
            DT: new Date((message.epoch || Date.now() / 1000) * 1000),
        };
    },

    /**
     * Transform active symbols data to ActiveSymbols format
     */
    toActiveSymbols(activeSymbolsData: any[]): ActiveSymbols[] {
        const symbols: ActiveSymbols[] = [];

        if (!Array.isArray(activeSymbolsData)) {
            return symbols;
        }

        activeSymbolsData.forEach(symbol => {
            const symbolCode = symbol.underlying_symbol || symbol.symbol;
            symbols.push({
                display_name: symbol.display_name || symbolCode,
                market: symbol.market,
                market_display_name: symbol.market_display_name || '',
                subgroup: symbol.subgroup,
                subgroup_display_name: symbol.subgroup_display_name || '',
                submarket: symbol.submarket,
                submarket_display_name: symbol.submarket_display_name || '',
                symbol: symbolCode,
                symbol_type: symbol.underlying_symbol_type || '',
                pip: symbol.pip || symbol.pip_size || 0.01,
                exchange_is_open: symbol.exchange_is_open || 0,
                is_trading_suspended: symbol.is_trading_suspended || 0,
            });
        });

        return symbols;
    },
    /**
     * Transform trading times data to TradingTimesMap format
     */
    toTradingTimesMap(tradingTimesData: any): TradingTimesMap {
        const result: TradingTimesMap = {};

        if (!tradingTimesData || typeof tradingTimesData !== 'object') {
            return result;
        }

        Object.keys(tradingTimesData).forEach(symbol => {
            const symbolData = tradingTimesData[symbol];
            if (symbolData) {
                const openTimes = Array.isArray(symbolData.open) ? symbolData.open : [];
                const closeTimes = Array.isArray(symbolData.close) ? symbolData.close : [];

                // Determine if market is open (simplified logic)
                const isOpen =
                    openTimes.length > 0 && closeTimes.length > 0 && openTimes[0] !== '--' && closeTimes[0] !== '--';

                result[symbol] = {
                    isOpen,
                    openTime: openTimes[0] || '--',
                    closeTime: closeTimes[0] || '--',
                };
            }
        });

        return result;
    },
};

/**
 * Build the SmartCharts Champion Adapter
 */
export function buildSmartChartsChampionAdapter(
    transport: TTransport,
    services: TServices,
    config: AdapterConfig = {}
): SmartchartsChampionAdapter {
    const { debug = false } = config;
    const logger = new AdapterLogger(debug);
    const subscriptions = new Map<string, TUnsubscribeFunction>();

    const functions: SmartchartsChampionFunctions = {
        /**
         * Get historical quotes for a symbol and granularity
         */
        async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
            try {
                // Build ticks_history request
                const apiRequest: any = {
                    ticks_history: request.symbol,
                    end: request.end || 'latest',
                    count: request.count || 1000,
                    adjust_start_time: 1,
                };

                // Set style and granularity
                if (request.granularity === 0) {
                    apiRequest.style = 'ticks';
                } else {
                    apiRequest.style = 'candles';
                    apiRequest.granularity = request.granularity;
                }

                // Add start time if provided
                if (request.start) {
                    apiRequest.start = request.start;
                    delete apiRequest.count; // Don't use count when start is specified
                }

                const response = await transport.send(apiRequest);

                const transformed = transformations.toTGetQuotesResult(response, request.granularity);
                return transformed;
            } catch (error) {
                logger.error('Error in getQuotes:', error);
                return {
                    quotes: [],
                    meta: {
                        symbol: request.symbol,
                        granularity: request.granularity,
                    },
                };
            }
        },

        /**
         * Subscribe to live quote updates
         */
        subscribeQuotes(request: TGetQuotesRequest, callback: TSubscriptionCallback): TUnsubscribeFunction {
            const subscriptionKey = `${request.symbol}-${request.granularity}`;

            // Build subscription request
            const apiRequest: any = {
                ticks_history: request.symbol,
                subscribe: 1,
                end: 'latest',
                count: 1,
            };

            if (request.granularity === 0) {
                apiRequest.style = 'ticks';
            } else {
                apiRequest.style = 'candles';
                apiRequest.granularity = request.granularity;
            }

            try {
                const subscriptionId = transport.subscribe(apiRequest, (response: any) => {
                    // Process all streaming messages for this subscription
                    // The transport layer already filters by subscription ID
                    try {
                        // transformations.toTQuoteFromStream(response, request.granularity);
                        // console.log('Stream message received:', response);
                        const quote = response;
                        callback(quote);
                    } catch (error) {
                        logger.error('Error transforming stream message:', error);
                    }
                });

                // Create unsubscribe function
                const unsubscribe = () => {
                    transport.unsubscribe(subscriptionId);
                    subscriptions.delete(subscriptionKey);
                };

                // Store subscription for cleanup
                subscriptions.set(subscriptionKey, unsubscribe);

                return unsubscribe;
            } catch (error) {
                logger.error('Error in subscribeQuotes:', error);
                return () => {}; // Return no-op function on error
            }
        },

        /**
         * Unsubscribe from quote updates (convenience wrapper)
         */
        unsubscribeQuotes(request: TGetQuotesRequest): void {
            const subscriptionKey = `${request.symbol}-${request.granularity}`;
            const unsubscribe = subscriptions.get(subscriptionKey);

            if (unsubscribe) {
                unsubscribe();
            } else {
                logger.warn('No active subscription found for:', subscriptionKey);
            }
        },

        /**
         * Get chart reference data (symbols and trading times)
         * Uses optimized transformations that work with existing store data
         */
        async getChartData(): Promise<{ activeSymbols: ActiveSymbols[]; tradingTimes: TradingTimesMap }> {
            logger.info('Fetching chart reference data using optimized transformations');

            try {
                // Get active symbols from existing store data (no API call needed)
                const activeSymbolsData = await services.getActiveSymbols();
                // Convert proxy objects to plain JavaScript objects for proper transformation
                const plainActiveSymbols = Array.isArray(activeSymbolsData)
                    ? JSON.parse(JSON.stringify(activeSymbolsData))
                    : [];

                // Get trading times using optimized function that leverages existing caching
                const tradingTimesData = await services.getTradingTimes();

                // Convert proxy objects to plain JavaScript objects for trading times
                const plainTradingTimes = tradingTimesData
                    ? JSON.parse(JSON.stringify(tradingTimesData.tradingTimes))
                    : {};

                // Transform to adapter format using plain objects
                const activeSymbols = transformations.toActiveSymbols(plainActiveSymbols);
                const tradingTimes = transformations.toTradingTimesMap(plainTradingTimes);

                const enriched_symbols = enrichActiveSymbols(activeSymbols, tradingTimesData.raw || {});

                logger.info('Chart reference data fetched successfully using optimized approach', {
                    symbolsCount: Object.keys(enriched_symbols).length,
                    tradingTimesCount: Object.keys(plainTradingTimes).length,
                });

                return { activeSymbols: enriched_symbols, tradingTimes };
            } catch (error) {
                logger.error('Error fetching chart reference data', error);
                return {
                    activeSymbols: [],
                    tradingTimes: {},
                };
            }
        },
    };

    return {
        ...functions,
        transport,
        services,
        config,
    };
}

/**
 * Create SmartCharts Champion Adapter with optimized transformations
 * Uses existing store data and optimized transformation functions for better performance
 */
export function createSmartChartsChampionAdapter(config: AdapterConfig = {}): SmartchartsChampionAdapter {
    const transport = createTransport({ debug: config.debug });

    // Create services that use optimized transformations
    const services: TServices = {
        async getActiveSymbols() {
            const activeSymbolsData = await createServices({ debug: config.debug }).getActiveSymbols();
            return activeSymbolsData;
        },

        async getTradingTimes() {
            // Always use the optimized function that leverages existing caching
            const tradingTimesData = await createServices({ debug: config.debug }).getTradingTimes();
            return tradingTimesData;
        },
    };

    return buildSmartChartsChampionAdapter(transport, services, config);
}

// Export transformation utilities for testing
export { transformations };

// Export types
export * from './types';
