import { ActiveSymbols } from '@deriv/api-types';

import sortSymbols from '../sort-symbols-utils';

describe('sortSymbols', () => {
    it('should sort symbols correctly according to market order', () => {
        const symbolsList = [
            {
                symbol: 'BTCUSD',
                display_name: 'BTC/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Bitcoin',
            },
            {
                symbol: 'EURUSD',
                display_name: 'EUR/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Euro/USD',
            },
            {
                symbol: 'OTC_N225',
                display_name: 'Japan 225',
                market: 'indices',
                submarket: 'asia_oceania_OTC',
                submarket_display_name: 'Asian indices',
            },
            {
                symbol: 'GOLD',
                display_name: 'GOLD',
                market: 'commodities',
                submarket: 'metals',
                submarket_display_name: 'Gold',
            },
            {
                symbol: '1HZ100V',
                display_name: 'Volatility',
                market: 'synthetic_index',
                submarket: 'random_index',
                submarket_display_name: 'Derived',
            },
        ];
        const sortedSymbols = sortSymbols(symbolsList as ActiveSymbols);
        expect(sortedSymbols).toEqual([
            {
                symbol: '1HZ100V',
                display_name: 'Volatility',
                market: 'synthetic_index',
                submarket: 'random_index',
                submarket_display_name: 'Derived',
            },
            {
                symbol: 'EURUSD',
                display_name: 'EUR/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Euro/USD',
            },
            {
                symbol: 'OTC_N225',
                display_name: 'Japan 225',
                market: 'indices',
                submarket: 'asia_oceania_OTC',
                submarket_display_name: 'Asian indices',
            },
            {
                symbol: 'BTCUSD',
                display_name: 'BTC/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Bitcoin',
            },
            {
                symbol: 'GOLD',
                display_name: 'GOLD',
                market: 'commodities',
                submarket: 'metals',
                submarket_display_name: 'Gold',
            },
        ]);
    });
    it('should handle symbols with same market correctly', () => {
        const symbolsList = [
            {
                symbol: 'GBPUSD',
                display_name: 'GBP/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Pound/USD',
            },
            {
                symbol: 'EURUSD',
                display_name: 'EUR/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Euro/USD',
            },
            {
                symbol: 'ETHUSD',
                display_name: 'ETH/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Ethereum',
            },
            {
                symbol: 'BTCUSD',
                display_name: 'BTC/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Bitcoin',
            },
        ];

        const sortedSymbols = sortSymbols(symbolsList as ActiveSymbols);
        expect(sortedSymbols).toEqual([
            {
                symbol: 'GBPUSD',
                display_name: 'GBP/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Pound/USD',
            },
            {
                symbol: 'EURUSD',
                display_name: 'EUR/USD',
                market: 'forex',
                submarket: 'major_pairs',
                submarket_display_name: 'Euro/USD',
            },
            {
                symbol: 'ETHUSD',
                display_name: 'ETH/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Ethereum',
            },
            {
                symbol: 'BTCUSD',
                display_name: 'BTC/USD',
                market: 'cryptocurrency',
                submarket: 'non_stable_coin',
                submarket_display_name: 'Bitcoin',
            },
        ]);
    });
});
