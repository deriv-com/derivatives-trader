import { ActiveSymbols } from '@deriv/api-types';
import { localize } from '@deriv-com/translations';

type MarketOrderMap = {
    [key: string]: number;
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

const sortSymbols = (symbolsList: ActiveSymbols) => {
    const marketSortingOrder = ['synthetic_index', 'forex', 'indices', 'cryptocurrency', 'commodities'];
    const marketOrderMap: MarketOrderMap = marketSortingOrder.reduce(
        (acc: MarketOrderMap, market: string, index: number) => {
            acc[market] = index;
            return acc;
        },
        {}
    );

    return symbolsList.slice().sort((a, b) => {
        const marketOrderA = marketOrderMap[a.market] !== undefined ? marketOrderMap[a.market] : symbolsList.length;
        const marketOrderB = marketOrderMap[b.market] !== undefined ? marketOrderMap[b.market] : symbolsList.length;
        if (marketOrderA !== marketOrderB) {
            return marketOrderA - marketOrderB;
        }
        return getSubmarketDisplayName(a.submarket).localeCompare(getSubmarketDisplayName(b.submarket));
    });
};

export default sortSymbols;
