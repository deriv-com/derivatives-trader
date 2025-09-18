// [AI]
/**
 * Data transformation utilities for SmartCharts Champion Adapter
 * Transforms existing Deriv data structures to SmartCharts Champion format
 */

export interface TradingTimesMap {
    [symbol: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

/**
 * Maps active symbols market codes to trading times market names
 */
function getMarketMapping(): Map<string, string> {
    return MARKET_MAPPINGS.MARKET_DISPLAY_NAMES;
}

/**
 * Maps active symbols submarket codes to trading times submarket names
 */
function getSubmarketMapping(): Map<string, string> {
    return MARKET_MAPPINGS.SUBMARKET_DISPLAY_NAMES;
}

/**
 * Enriches active symbols with market display names from trading times
 */
export function enrichActiveSymbols(active_symbols: any[], trading_times: any) {
    if (!active_symbols || !active_symbols.length) {
        return active_symbols;
    }

    try {
        // Get trading times data
        if (!trading_times?.markets) {
            return active_symbols;
        }

        // Create lookup maps for efficient searching
        const market_display_names = new Map<string, string>();
        const submarket_display_names = new Map<string, string>();
        const market_mapping = getMarketMapping();
        const submarket_mapping = getSubmarketMapping();

        if (!trading_times.markets || !Array.isArray(trading_times.markets)) {
            return active_symbols;
        }

        try {
            trading_times.markets.forEach((market: any) => {
                // Use the name property directly as the display name
                if (market.name) {
                    market_display_names.set(market.name, market.name);

                    // Also create reverse mapping for market codes
                    Array.from(market_mapping.entries()).forEach(([code, name]) => {
                        if (name === market.name) {
                            market_display_names.set(code, market.name);
                        }
                    });
                }

                if (market.submarkets) {
                    market.submarkets.forEach((submarket: any) => {
                        // Use the name property directly as the display name
                        if (submarket.name && market.name) {
                            const key = `${market.name}_${submarket.name}`;
                            submarket_display_names.set(key, submarket.name);

                            // Also create mapping for market codes and submarket codes
                            Array.from(market_mapping.entries()).map(([code, name]) => {
                                if (name === market.name) {
                                    const code_key = `${code}_${submarket.name}`;
                                    submarket_display_names.set(code_key, submarket.name);
                                }
                            });
                        }
                    });
                }
            });
        } catch (markets_error) {
            return active_symbols;
        }

        // Add direct submarket code mappings
        Array.from(submarket_mapping.entries()).forEach(([submarket_code, submarket_name]) => {
            submarket_display_names.set(submarket_code, submarket_name);

            // Also add with market prefixes
            Array.from(market_mapping.entries()).forEach(([market_code]) => {
                const key = `${market_code}_${submarket_code}`;
                submarket_display_names.set(key, submarket_name);
            });
        });

        // Create symbol display names lookup
        const symbol_display_names = new Map<string, string>();

        trading_times.markets.forEach((market: any) => {
            if (market.submarkets) {
                market.submarkets.forEach((submarket: any) => {
                    if (submarket.symbols) {
                        submarket.symbols.forEach((symbol_info: any) => {
                            // Also handle underlying_symbol if present
                            if (symbol_info.underlying_symbol && symbol_info.name) {
                                symbol_display_names.set(symbol_info.underlying_symbol, symbol_info.name);
                            }
                        });
                    }
                });
            }
        });

        // Enrich each active symbol
        const enriched_symbols = active_symbols.map(symbol => {
            const enriched_symbol = { ...symbol };

            // Add market display name using the name property from trading times
            if (symbol.market) {
                enriched_symbol.market_display_name = market_display_names.get(symbol.market) || symbol.market;
            }

            // Add submarket display name using the name property from trading times
            if (symbol.submarket) {
                // Try multiple lookup strategies for submarket
                let submarket_display_name = symbol.submarket;

                // 1. Try with market prefix
                if (symbol.market) {
                    const submarket_key = `${symbol.market}_${symbol.submarket}`;
                    submarket_display_name = submarket_display_names.get(submarket_key) || submarket_display_name;
                }

                // 2. Try direct submarket code lookup
                submarket_display_name = submarket_display_names.get(symbol.submarket) || submarket_display_name;

                enriched_symbol.submarket_display_name = submarket_display_name;
            }

            // Add subgroup display name if available using the name property from trading times
            if (symbol.subgroup) {
                let subgroup_display_name = symbol.subgroup;

                // Try with market prefix
                if (symbol.market) {
                    const subgroup_key = `${symbol.market}_${symbol.subgroup}`;
                    subgroup_display_name = submarket_display_names.get(subgroup_key) || subgroup_display_name;
                }

                // Try direct subgroup code lookup
                subgroup_display_name = submarket_display_names.get(symbol.subgroup) || subgroup_display_name;

                enriched_symbol.subgroup_display_name = subgroup_display_name;
            }

            // Add symbol display name from trading times
            const symbol_code = symbol.underlying_symbol || symbol.symbol;
            if (symbol_code) {
                const symbol_display_name = symbol_display_names.get(symbol_code);
                if (symbol_display_name) {
                    enriched_symbol.display_name = symbol_display_name;
                }
            }

            if (symbol.underlying_symbol && !symbol.symbol) {
                enriched_symbol.symbol = symbol.underlying_symbol;
            }
            return enriched_symbol;
        });
        return enriched_symbols;
    } catch (error) {
        return active_symbols;
    }
}

/**
 * Transform trading times data to SmartCharts Champion format
 * Uses existing trading times data from ContractType.getTradingTimes
 */
export function transformTradingTimesToChampion(
    tradingTimesData: Record<string, { open: string[]; close: string[] }>
): TradingTimesMap {
    const tradingTimesMap: TradingTimesMap = {};

    Object.keys(tradingTimesData).forEach(symbol => {
        const times = tradingTimesData[symbol];

        if (times && times.open && times.close) {
            const openTimes = times.open;
            const closeTimes = times.close;

            // Determine if market is open
            // If open/close times are '--', market is closed all day
            const isClosedAllDay = openTimes[0] === '--' || closeTimes[0] === '--';
            const isOpen = !isClosedAllDay;

            tradingTimesMap[symbol] = {
                isOpen,
                openTime: openTimes[0] || '--',
                closeTime: closeTimes[0] || '--',
            };
        }
    });

    return tradingTimesMap;
}

// Market and Submarket Mappings
export const MARKET_MAPPINGS = {
    MARKET_DISPLAY_NAMES: new Map([
        ['synthetic_index', 'Derived'],
        ['forex', 'Forex'],
        ['indices', 'Stock Indices'],
        ['stocks', 'Stocks'],
        ['commodities', 'Commodities'],
        ['cryptocurrency', 'Cryptocurrencies'],
        ['basket_index', 'Basket Indices'],
        ['random_index', 'Derived'],
    ]),

    SUBMARKET_DISPLAY_NAMES: new Map([
        // Derived submarkets
        ['random_index', 'Continuous Indices'],
        ['random_daily', 'Daily Reset Indices'],
        ['crash_index', 'Crash/Boom'],
        ['jump_index', 'Jump Indices'],
        ['step_index', 'Step Indices'],
        ['range_break', 'Range Break Indices'],

        // Forex submarkets
        ['major_pairs', 'Major Pairs'],
        ['minor_pairs', 'Minor Pairs'],
        ['exotic_pairs', 'Exotic Pairs'],
        ['smart_fx', 'Smart FX'],
        ['micro_pairs', 'Micro Pairs'],

        // Basket indices
        ['forex_basket', 'Forex Basket'],
        ['commodity_basket', 'Commodity Basket'],
        ['stock_basket', 'Stock Basket'],

        // Commodities
        ['metals', 'Metals'],
        ['energy', 'Energy'],

        // Cryptocurrencies submarkets
        ['crypto_index', 'Crypto Index'],
        ['non_stable_coin', 'Non-Stable Coins'],
        ['stable_coin', 'Stable Coins'],
        ['crypto_basket', 'Crypto Basket'],

        // Stock indices submarkets
        ['asian_indices', 'Asian Indices'],
        ['american_indices', 'American Indices'],
        ['european_indices', 'European Indices'],
        ['otc_index', 'OTC Indices'],
        ['europe_OTC', 'European OTC'],
        ['asia_oceania_OTC', 'Asia Oceania OTC'],
        ['americas_OTC', 'Americas OTC'],
        ['otc_indices', 'OTC Indices'],
        ['us_indices', 'US Indices'],
        ['stock_indices', 'Stock Indices'],
        ['indices', 'Indices'],
    ]),
};

// Market Dropdown Options
export const MARKET_OPTIONS = [
    ['Derived', 'synthetic_index'],
    ['Forex', 'forex'],
    ['Stock Indices', 'indices'],
    ['Commodities', 'commodities'],
    ['Cryptocurrencies', 'cryptocurrency'],
];

// Submarket Options by Market
export const SUBMARKET_OPTIONS = {
    synthetic_index: [
        ['Continuous Indices', 'random_index'],
        ['Daily Reset Indices', 'random_daily'],
        ['Crash/Boom', 'crash_index'],
        ['Jump Indices', 'jump_index'],
        ['Step Indices', 'step_index'],
    ],
    forex: [
        ['Major Pairs', 'major_pairs'],
        ['Minor Pairs', 'minor_pairs'],
        ['Exotic Pairs', 'exotic_pairs'],
        ['Smart FX', 'smart_fx'],
    ],
    indices: [
        ['Asian Indices', 'asian_indices'],
        ['American Indices', 'american_indices'],
        ['European Indices', 'european_indices'],
        ['OTC Indices', 'otc_index'],
    ],
    commodities: [
        ['Metals', 'metals'],
        ['Energy', 'energy'],
    ],
    cryptocurrency: [
        ['Crypto Index', 'crypto_index'],
        ['Non-Stable Coins', 'non_stable_coin'],
        ['Stable Coins', 'stable_coin'],
    ],
};

// Symbol Options by Submarket
export const SYMBOL_OPTIONS = {
    random_index: [
        ['Volatility 10 Index', '1HZ10V'],
        ['Volatility 25 Index', '1HZ25V'],
        ['Volatility 50 Index', '1HZ50V'],
        ['Volatility 75 Index', '1HZ75V'],
        ['Volatility 100 Index', '1HZ100V'],
    ],
    major_pairs: [
        ['EUR/USD', 'frxEURUSD'],
        ['GBP/USD', 'frxGBPUSD'],
        ['USD/JPY', 'frxUSDJPY'],
        ['USD/CHF', 'frxUSDCHF'],
        ['AUD/USD', 'frxAUDUSD'],
    ],
    crash_index: [
        ['Crash 300 Index', 'CRASH300'],
        ['Crash 500 Index', 'CRASH500'],
        ['Crash 1000 Index', 'CRASH1000'],
        ['Boom 300 Index', 'BOOM300'],
        ['Boom 500 Index', 'BOOM500'],
        ['Boom 1000 Index', 'BOOM1000'],
    ],
    otc_index: [
        ['Wall Street 30', 'OTC_DJI'],
        ['US 500', 'OTC_SPX'],
        ['US Tech 100', 'OTC_NDX'],
        ['UK 100', 'OTC_FTSE'],
        ['Germany 40', 'OTC_GDAXI'],
    ],
};
// [/AI]
