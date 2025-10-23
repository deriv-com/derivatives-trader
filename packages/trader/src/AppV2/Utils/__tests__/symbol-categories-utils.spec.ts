import { TActiveSymbolsResponse } from '@deriv/api';

import { categorizeSymbols } from '../symbol-categories-utils';

describe('categorizeSymbols', () => {
    const symbols = [
        {
            underlying_symbol: 'cryBTCUSD',
            market: 'cryptocurrency',
            subgroup: 'none',
            submarket: 'non_stable_coin',
            display_order: 1,
            exchange_is_open: 1,
        },
        {
            underlying_symbol: 'frxXAUUSD',
            market: 'commodities',
            subgroup: 'none',
            submarket: 'metals',
            display_order: 2,
            exchange_is_open: 1,
        },
        {
            underlying_symbol: 'OTC_SPC',
            market: 'indices',
            subgroup: 'none',
            submarket: 'americas_OTC',
            display_order: 3,
            exchange_is_open: 1,
        },
        {
            underlying_symbol: 'BOOM300N',
            market: 'synthetic_index',
            subgroup: 'synthetics',
            submarket: 'crash_index',
            display_order: 4,
            exchange_is_open: 1,
        },
        {
            underlying_symbol: 'WLDXAU',
            market: 'synthetic_index',
            subgroup: 'baskets',
            submarket: 'commodity_basket',
            display_order: 5,
            exchange_is_open: 1,
        },
        {
            underlying_symbol: 'frxAUDUSD',
            market: 'forex',
            subgroup: 'none',
            submarket: 'major_pairs',
            display_order: 6,
            exchange_is_open: 1,
        },
    ] as NonNullable<TActiveSymbolsResponse['active_symbols']>;

    const expectedOutput = {
        favorites: {
            market: 'favorites',
            market_display_name: 'Favourites',
            subgroups: {},
        },
        all: {
            market: 'all',
            market_display_name: 'All',
            subgroups: {
                baskets: {
                    subgroup_display_name: 'Baskets',
                    submarkets: {
                        commodity_basket: {
                            submarket_display_name: 'Commodities basket',
                            items: [
                                {
                                    underlying_symbol: 'WLDXAU',
                                    market: 'synthetic_index',
                                    subgroup: 'baskets',
                                    submarket: 'commodity_basket',
                                    display_order: 5,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                commodities: {
                    subgroup_display_name: 'Commodities',
                    submarkets: {
                        metals: {
                            submarket_display_name: 'Metals',
                            items: [
                                {
                                    underlying_symbol: 'frxXAUUSD',
                                    market: 'commodities',
                                    subgroup: 'none',
                                    submarket: 'metals',
                                    display_order: 2,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                cryptocurrency: {
                    subgroup_display_name: 'Cryptocurrencies',
                    submarkets: {
                        non_stable_coin: {
                            submarket_display_name: 'Cryptocurrencies',
                            items: [
                                {
                                    underlying_symbol: 'cryBTCUSD',
                                    market: 'cryptocurrency',
                                    subgroup: 'none',
                                    submarket: 'non_stable_coin',
                                    display_order: 1,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                forex: {
                    subgroup_display_name: 'Forex',
                    submarkets: {
                        major_pairs: {
                            submarket_display_name: 'Major pairs',
                            items: [
                                {
                                    underlying_symbol: 'frxAUDUSD',
                                    market: 'forex',
                                    subgroup: 'none',
                                    submarket: 'major_pairs',
                                    display_order: 6,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                indices: {
                    subgroup_display_name: 'Stock indices',
                    submarkets: {
                        americas_OTC: {
                            submarket_display_name: 'American indices',
                            items: [
                                {
                                    underlying_symbol: 'OTC_SPC',
                                    market: 'indices',
                                    subgroup: 'none',
                                    submarket: 'americas_OTC',
                                    display_order: 3,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                synthetics: {
                    subgroup_display_name: 'Synthetics',
                    submarkets: {
                        crash_index: {
                            submarket_display_name: 'Crash/Boom',
                            items: [
                                {
                                    underlying_symbol: 'BOOM300N',
                                    market: 'synthetic_index',
                                    subgroup: 'synthetics',
                                    submarket: 'crash_index',
                                    display_order: 4,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
        synthetic_index: {
            market: 'synthetic_index',
            market_display_name: 'Derived',
            subgroups: {
                baskets: {
                    subgroup_display_name: 'Baskets',
                    submarkets: {
                        commodity_basket: {
                            submarket_display_name: 'Commodities basket',
                            items: [
                                {
                                    underlying_symbol: 'WLDXAU',
                                    market: 'synthetic_index',
                                    subgroup: 'baskets',
                                    submarket: 'commodity_basket',
                                    display_order: 5,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
                synthetics: {
                    subgroup_display_name: 'Synthetics',
                    submarkets: {
                        crash_index: {
                            submarket_display_name: 'Crash/Boom',
                            items: [
                                {
                                    underlying_symbol: 'BOOM300N',
                                    market: 'synthetic_index',
                                    subgroup: 'synthetics',
                                    submarket: 'crash_index',
                                    display_order: 4,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
        forex: {
            market: 'forex',
            market_display_name: 'Forex',
            subgroups: {
                none: {
                    subgroup_display_name: 'Forex',
                    submarkets: {
                        major_pairs: {
                            submarket_display_name: 'Major pairs',
                            items: [
                                {
                                    underlying_symbol: 'frxAUDUSD',
                                    market: 'forex',
                                    subgroup: 'none',
                                    submarket: 'major_pairs',
                                    display_order: 6,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
        indices: {
            market: 'indices',
            market_display_name: 'Stock indices',
            subgroups: {
                none: {
                    subgroup_display_name: 'Stock indices',
                    submarkets: {
                        americas_OTC: {
                            submarket_display_name: 'American indices',
                            items: [
                                {
                                    underlying_symbol: 'OTC_SPC',
                                    market: 'indices',
                                    subgroup: 'none',
                                    submarket: 'americas_OTC',
                                    display_order: 3,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
        cryptocurrency: {
            market: 'cryptocurrency',
            market_display_name: 'Cryptocurrencies',
            subgroups: {
                none: {
                    subgroup_display_name: 'Cryptocurrencies',
                    submarkets: {
                        non_stable_coin: {
                            submarket_display_name: 'Cryptocurrencies',
                            items: [
                                {
                                    underlying_symbol: 'cryBTCUSD',
                                    market: 'cryptocurrency',
                                    subgroup: 'none',
                                    submarket: 'non_stable_coin',
                                    display_order: 1,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
        commodities: {
            market: 'commodities',
            market_display_name: 'Commodities',
            subgroups: {
                none: {
                    subgroup_display_name: 'Commodities',
                    submarkets: {
                        metals: {
                            submarket_display_name: 'Metals',
                            items: [
                                {
                                    underlying_symbol: 'frxXAUUSD',
                                    market: 'commodities',
                                    subgroup: 'none',
                                    submarket: 'metals',
                                    display_order: 2,
                                    exchange_is_open: 1,
                                },
                            ],
                        },
                    },
                },
            },
        },
    };

    it('should categorize symbols correctly', () => {
        const result = categorizeSymbols(symbols);
        expect(result).toEqual(expectedOutput);
    });

    it('should return empty object for empty symbols array', () => {
        const result = categorizeSymbols([]);
        expect(result).toEqual({});
    });
});
