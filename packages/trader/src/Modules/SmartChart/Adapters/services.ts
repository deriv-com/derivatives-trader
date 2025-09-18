/**
 * SmartCharts Champion Adapter - Services Layer
 *
 * Abstracts data fetching operations for active symbols and trading times.
 * Provides clean interface for retrieving reference data from Deriv API.
 */

import { WS } from '@deriv/shared';

import type { ILogger, TServices } from './types';

/**
 * Logger implementation for services layer
 */
class ServicesLogger implements ILogger {
    private isDebugEnabled: boolean;

    constructor(debug: boolean = false) {
        this.isDebugEnabled = debug;
    }

    info(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.log(`[Services] ${message}`, data);
        }
    }

    error(message: string, error?: any): void {
        // eslint-disable-next-line no-console
        console.error(`[Services] ${message}`, error);
    }

    warn(message: string, data?: any): void {
        // eslint-disable-next-line no-console
        console.warn(`[Services] ${message}`, data);
    }

    debug(message: string, data?: any): void {
        if (this.isDebugEnabled) {
            // eslint-disable-next-line no-console
            console.debug(`[Services] ${message}`, data);
        }
    }
}

/**
 * Transforms trading times data to the format expected by the adapter
 */
function transformTradingTimes(tradingTimesData: any): any {
    if (!tradingTimesData || typeof tradingTimesData !== 'object') {
        return {};
    }

    const result: any = {};

    // Handle different possible structures of trading times data
    if (tradingTimesData.markets) {
        // If data has markets structure, flatten it
        tradingTimesData.markets.forEach((market: any) => {
            if (market.submarkets) {
                market.submarkets.forEach((submarket: any) => {
                    if (submarket.symbols) {
                        submarket.symbols.forEach((item: any) => {
                            result[item.underlying_symbol] = {
                                open: item.times?.open || [],
                                close: item.times?.close || [],
                                settlement: item.times?.settlement || [],
                            };
                        });
                    }
                });
            }
        });
    } else {
        // If data is already in symbol format, use it directly
        Object.keys(tradingTimesData).forEach(symbol => {
            const symbolData = tradingTimesData[symbol];
            result[symbol] = {
                open: symbolData.open || [],
                close: symbolData.close || [],
                settlement: symbolData.settlement || [],
            };
        });
    }

    return result;
}

/**
 * Creates services layer instance
 */
export function createServices(config: { debug?: boolean } = {}): TServices {
    const { debug = false } = config;
    const logger = new ServicesLogger(debug);

    return {
        /**
         * Fetch active symbols from the API
         */
        async getActiveSymbols(): Promise<any> {
            try {
                // Use WS.authorized.activeSymbols for authenticated requests
                // or WS.activeSymbols for unauthenticated requests
                const response = await WS.activeSymbols('brief');

                if (response.error) {
                    logger.error('Failed to fetch active symbols', response.error);
                    throw new Error(response.error.message || 'Failed to fetch active symbols');
                }

                const activeSymbols = response.active_symbols || [];

                return activeSymbols;
            } catch (error) {
                logger.error('Error fetching active symbols', error);
                // Return empty array as fallback
                return [];
            }
        },

        /**
         * Fetch ping times from the API
         */
        async getTradingTimes(): Promise<any> {
            try {
                // Get current date for trading times request
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

                const response = await WS.tradingTimes(today);

                if (response.error) {
                    logger.error('Failed to fetch trading times', response.error);
                    throw new Error(response.error.message || 'Failed to fetch trading times');
                }

                const tradingTimesData = response.trading_times || {};
                const transformedTimes = transformTradingTimes(tradingTimesData);

                return { tradingTimes: transformedTimes, raw: tradingTimesData };
            } catch (error) {
                logger.error('Error fetching trading times', error);
                // Return empty object as fallback
                return { tradingTimes: {}, raw: {} };
            }
        },
    };
}

/**
 * Utility function to check if services are available
 */
export function areServicesAvailable(): boolean {
    try {
        return !!(WS && WS.activeSymbols && WS.tradingTimes);
    } catch {
        return false;
    }
}

/**
 * Utility function to wait for services to be ready
 */
export function waitForServices(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (areServicesAvailable()) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (areServicesAvailable()) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error(`Services not available after ${timeout}ms`));
            }
        }, 100);
    });
}
