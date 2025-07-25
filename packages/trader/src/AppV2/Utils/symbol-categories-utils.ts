import { ActiveSymbols } from '@deriv/api-types';
import { localize } from '@deriv/translations';

import sortSymbols from './sort-symbols-utils';

// Helper function to get market display name
const getMarketDisplayName = (market: string) => {
    const market_display_names: Record<string, string> = {
        forex: localize('Forex'),
        synthetic_index: localize('Derived'),
        cryptocurrency: localize('Cryptocurrencies'),
        commodities: localize('Commodities'),
        stock_index: localize('Stock indices'),
        indices: localize('Stock indices'),
        basket_index: localize('Basket indices'),
    };

    return market_display_names[market] || market;
};

// Helper function to get subgroup display name
const getSubgroupDisplayName = (subgroup: string, market: string) => {
    if (subgroup === 'none') {
        return getMarketDisplayName(market);
    }

    const subgroup_display_names: Record<string, string> = {
        synthetics: localize('Synthetics'),
        baskets: localize('Baskets'),
        major_pairs: localize('Major pairs'),
        minor_pairs: localize('Minor pairs'),
        smart_fx: localize('Smart FX'),
        metals: localize('Metals'),
        energy: localize('Energy'),
        americas: localize('Americas'),
        asia_oceania: localize('Asia/Oceania'),
        europe_africa: localize('Europe/Africa'),
    };

    return subgroup_display_names[subgroup] || subgroup;
};

// Helper function to get submarket display name
const getSubmarketDisplayName = (submarket: string) => {
    const submarket_display_names: Record<string, string> = {
        major_pairs: localize('Major pairs'),
        minor_pairs: localize('Minor pairs'),
        smart_fx: localize('Smart FX'),
        random_index: localize('Continuous indices'),
        random_daily: localize('Daily reset indices'),
        crash_boom: localize('Crash/Boom'),
        crash_index: localize('Crash/Boom'),
        step_indices: localize('Step indices'),
        step_index: localize('Step indices'),
        range_break: localize('Range break indices'),
        jump_indices: localize('Jump indices'),
        jump_index: localize('Jump indices'),
        cryptocurrency: localize('Cryptocurrencies'),
        non_stable_coin: localize('Cryptocurrencies'),
        metals: localize('Metals'),
        energy: localize('Energy'),
        americas: localize('Americas'),
        americas_OTC: localize('American indices'),
        asia_oceania: localize('Asia/Oceania'),
        asia_oceania_OTC: localize('Asian indices'),
        europe_africa: localize('Europe/Africa'),
        europe_OTC: localize('European indices'),
        otc_index: localize('OTC indices'),
        basket_forex: localize('Forex basket'),
        forex_basket: localize('Forex basket'),
        basket_commodities: localize('Commodities basket'),
        commodity_basket: localize('Commodities basket'),
        basket_cryptocurrency: localize('Cryptocurrency basket'),
    };

    return submarket_display_names[submarket] || submarket;
};

type SubmarketGroup = {
    submarket_display_name: string;
    items: ActiveSymbols;
};

type SubgroupGroup = {
    subgroup_display_name: string;
    submarkets: Record<string, SubmarketGroup>;
};

export type MarketGroup = {
    market: string;
    market_display_name: string;
    subgroups: Record<string, SubgroupGroup>;
};

export const categorizeSymbols = (symbols: ActiveSymbols): Record<string, MarketGroup> => {
    if (symbols.length === 0) {
        return {};
    }
    // Categorize ActiveSymbols array into object categorized by markets
    const sortedSymbols = sortSymbols(symbols);
    let categorizedSymbols = sortedSymbols.reduce((acc: Record<string, MarketGroup>, symbol: ActiveSymbols[0]) => {
        const { market, subgroup, submarket } = symbol;

        acc[market] ??= { market, market_display_name: getMarketDisplayName(market), subgroups: {} };

        acc[market].subgroups[subgroup] ??= {
            subgroup_display_name: getSubgroupDisplayName(subgroup, market),
            submarkets: {},
        };

        acc[market].subgroups[subgroup].submarkets[submarket] ??= {
            submarket_display_name: getSubmarketDisplayName(submarket),
            items: [],
        };

        acc[market].subgroups[subgroup].submarkets[submarket].items.push(symbol);

        return acc;
    }, {});
    // Sort categorizedSymbols by submarket_display_name
    Object.keys(categorizedSymbols).forEach(market => {
        Object.keys(categorizedSymbols[market].subgroups).forEach(subgroup => {
            const submarkets = categorizedSymbols[market].subgroups[subgroup].submarkets;
            const sortedSubmarkets = Object.entries(submarkets)
                .sort(([, a], [, b]) => a.submarket_display_name.localeCompare(b.submarket_display_name))
                .reduce(
                    (sortedAcc, [key, value]) => {
                        sortedAcc[key] = value;
                        return sortedAcc;
                    },
                    {} as Record<string, SubmarketGroup>
                );
            categorizedSymbols[market].subgroups[subgroup].submarkets = sortedSubmarkets;
        });
    });

    //format the all submarkets into a single subgroup objects, renaming keys, and subgroup_display_name if they are 'none'
    const allCategory = Object.values(categorizedSymbols).reduce(
        (result, item) => {
            Object.keys(item.subgroups).forEach(key => {
                const newKey = key === 'none' ? item.market : key;
                const newName =
                    key === 'none' ? getMarketDisplayName(item.market) : item.subgroups[key].subgroup_display_name;

                result[newKey] = {
                    subgroup_display_name: newName,
                    submarkets: item.subgroups[key].submarkets,
                };
            });

            return result;
        },
        {} as Record<string, SubgroupGroup>
    );

    // Assign a new category called 'all' with the same data shape as the rest of the categories for rendering
    categorizedSymbols = {
        favorites: {
            market: 'favorites',
            market_display_name: localize('Favourites'),
            subgroups: {},
        },
        all: {
            market: 'all',
            market_display_name: localize('All'),
            subgroups: { ...allCategory } as Record<string, SubgroupGroup>,
        },
        /// spread the rest of the categories into final object
        ...categorizedSymbols,
    };

    return categorizedSymbols;
};
