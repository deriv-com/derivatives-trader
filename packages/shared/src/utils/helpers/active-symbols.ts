import { flow } from 'mobx';

import { TActiveSymbolsResponse } from '@deriv/api';
import { localize } from '@deriv-com/translations';

import { WS } from '../../services';
import { getMarketNamesMap } from '../constants/contract';
import { redirectToLogin } from '../login';
import { LocalStore } from '../storage';

type ActiveSymbols = NonNullable<TActiveSymbolsResponse['active_symbols']>;

type TIsSymbolOpen = {
    exchange_is_open: 0 | 1;
};

export const showUnavailableLocationError = (showError: (error: any) => void) => {
    // Simplified error message without country detection
    const header = localize('Sorry, this app is unavailable in your current location.');

    showError({
        message: localize('If you have an account, log in to continue.'),
        header,
        redirect_label: localize('Log in'),
        redirectOnClick: () => redirectToLogin(),
        should_show_refresh: false,
    });
};

export const isMarketClosed = (active_symbols: ActiveSymbols = [], symbol: string | undefined) => {
    if (!active_symbols.length) {
        return false;
    }

    // Handle empty or invalid symbols
    if (!symbol || symbol.trim() === '') {
        return false;
    }

    const found_symbol = active_symbols.find(x => x.underlying_symbol === symbol);
    return found_symbol ? !found_symbol.exchange_is_open : false;
};

export const pickDefaultSymbol = async (active_symbols: ActiveSymbols = []) => {
    if (!active_symbols.length) return '';
    const fav_open_symbol = await getFavoriteOpenSymbol(active_symbols);
    if (fav_open_symbol) return fav_open_symbol;
    const default_open_symbol = await getDefaultOpenSymbol(active_symbols);
    return default_open_symbol;
};

const getFavoriteOpenSymbol = async (active_symbols: ActiveSymbols) => {
    try {
        const chart_favorites = LocalStore.get('cq-favorites');
        if (!chart_favorites) return undefined;
        const client_favorite_markets: string[] = JSON.parse(chart_favorites)['chartTitle&Comparison'];

        const client_favorite_list = client_favorite_markets.map(client_fav_symbol =>
            active_symbols.find(symbol_info => symbol_info.underlying_symbol === client_fav_symbol)
        );
        if (client_favorite_list) {
            const client_first_open_symbol = client_favorite_list.filter(symbol => symbol).find(isSymbolOpen);
            if (client_first_open_symbol) {
                const symbol_to_use = client_first_open_symbol.underlying_symbol;
                const is_symbol_offered = await isSymbolOffered(symbol_to_use);
                if (is_symbol_offered) return symbol_to_use;
            }
        }
        return undefined;
    } catch (error) {
        return undefined;
    }
};

const getDefaultOpenSymbol = async (active_symbols: ActiveSymbols) => {
    const default_open_symbol =
        (await findSymbol(active_symbols, '1HZ100V')) ||
        (await findFirstSymbol(active_symbols, /random_index/)) ||
        (await findFirstSymbol(active_symbols, /major_pairs/));
    if (default_open_symbol) return default_open_symbol.underlying_symbol;
    const fallback_symbol = active_symbols.find(symbol_info => symbol_info.submarket === 'major_pairs');
    return fallback_symbol ? fallback_symbol.underlying_symbol : undefined;
};

const findSymbol = async (active_symbols: ActiveSymbols, symbol: string) => {
    const first_symbol = active_symbols.find(
        symbol_info => symbol_info.underlying_symbol === symbol && isSymbolOpen(symbol_info)
    );
    const symbol_to_check = first_symbol ? first_symbol.underlying_symbol : undefined;
    const is_symbol_offered = await isSymbolOffered(symbol_to_check);
    if (is_symbol_offered) return first_symbol;
    return undefined;
};

const findFirstSymbol = async (active_symbols: ActiveSymbols, pattern: RegExp) => {
    const first_symbol = active_symbols.find(
        symbol_info => pattern.test(symbol_info.submarket) && isSymbolOpen(symbol_info)
    );
    const symbol_to_check = first_symbol ? first_symbol.underlying_symbol : undefined;
    const is_symbol_offered = await isSymbolOffered(symbol_to_check);
    if (is_symbol_offered) return first_symbol;
    return undefined;
};

type TFindFirstOpenMarket = { category?: string; subcategory?: string } | undefined;

export const findFirstOpenMarket = async (
    active_symbols: ActiveSymbols,
    markets: string[]
): Promise<TFindFirstOpenMarket> => {
    const market = markets.shift();
    const first_symbol = active_symbols.find(symbol_info => market === symbol_info.market && isSymbolOpen(symbol_info));
    const symbol_to_check = first_symbol ? first_symbol.underlying_symbol : undefined;
    const is_symbol_offered = await isSymbolOffered(symbol_to_check);
    if (is_symbol_offered) return { category: first_symbol?.market, subcategory: first_symbol?.submarket };
    else if (markets.length > 0) return findFirstOpenMarket(active_symbols, markets);
    return undefined;
};

const isSymbolOpen = (symbol?: TIsSymbolOpen) => symbol?.exchange_is_open === 1;

const isSymbolOffered = async (symbol?: string) => {
    if (!symbol) return false;
    const r = await WS.storage.contractsFor(symbol);
    return !['InvalidSymbol', 'InputValidationFailed'].includes(r.error?.code);
};

export type TActiveSymbols = NonNullable<TActiveSymbolsResponse['active_symbols']>;

export const getSymbolDisplayName = (symbol: string) => {
    // Add null safety check for symbol parameter
    if (!symbol || typeof symbol !== 'string') {
        return symbol || '';
    }

    const market_names_map = getMarketNamesMap() as Record<string, string>;
    const symbol_upper = symbol.toUpperCase();

    // First try to get display name from the market names map
    if (market_names_map[symbol_upper]) {
        return market_names_map[symbol_upper];
    }

    // Fallback: try to format common symbol patterns
    if (symbol_upper.startsWith('FRX')) {
        // Forex symbols like FRXEURUSD -> EUR/USD
        const currency_pair = symbol_upper.replace('FRX', '');
        if (currency_pair.length === 6) {
            return `${currency_pair.slice(0, 3)}/${currency_pair.slice(3)}`;
        }
    } else if (symbol_upper.startsWith('CRY')) {
        // Crypto symbols like CRYBTCUSD -> BTC/USD
        const crypto_pair = symbol_upper.replace('CRY', '');
        if (crypto_pair.length === 6) {
            return `${crypto_pair.slice(0, 3)}/${crypto_pair.slice(3)}`;
        }
    }

    // If no mapping found, return the symbol as-is
    return symbol;
};
