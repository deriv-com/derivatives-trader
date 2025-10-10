import React from 'react';
import { TActiveSymbolsResponse } from '@deriv/api';
import { render, screen } from '@testing-library/react';
import MarketCategory from '../market-category';

jest.mock('AppV2/Components/MarketCategoryItem', () =>
    jest.fn(props => <div ref={props.ref}>MockedMarketCategoryItem</div>)
);

jest.mock('AppV2/Components/FavoriteSymbols', () => jest.fn(() => <div>MockedFavoriteSymbols</div>));

describe('<MarketCategory />', () => {
    const mocked_props = {
        category: {
            market: 'forex',
            market_display_name: 'Forex',
            subgroups: {
                none: {
                    subgroup_display_name: 'Forex',
                    submarkets: {
                        major_pairs: {
                            submarket_display_name: 'Major Pairs',
                            items: [
                                {
                                    underlying_symbol: 'frxAUDUSD',
                                    underlying_symbol_type: 'forex',
                                    pip_size: 0.0001,
                                    market: 'forex',
                                    subgroup: 'none',
                                    submarket: 'major_pairs',
                                    exchange_is_open: 1,
                                    display_order: 1,
                                },
                                {
                                    underlying_symbol: 'frxUSDCAD',
                                    underlying_symbol_type: 'forex',
                                    pip_size: 0.0001,
                                    market: 'forex',
                                    subgroup: 'none',
                                    submarket: 'major_pairs',
                                    exchange_is_open: 1,
                                    display_order: 2,
                                },
                            ] as NonNullable<TActiveSymbolsResponse['active_symbols']>,
                        },
                    },
                },
            },
        },
        selectedSymbol: '',
        setSelectedSymbol: jest.fn,
        setIsOpen: jest.fn(),
        isOpen: false,
    };

    it('should render correct labels', () => {
        render(<MarketCategory {...mocked_props} />);
        expect(screen.getByText('Major Pairs')).toBeInTheDocument();
        expect(screen.getAllByText('MockedMarketCategoryItem')).toHaveLength(2);
    });
    it('should render FavoriteSymbols component when market is favorites', () => {
        const favoriteProps = {
            ...mocked_props,
            category: {
                market: 'favorites',
                market_display_name: 'Favourites',
                subgroups: {},
            },
        };
        render(<MarketCategory {...favoriteProps} />);
        expect(screen.getByText('MockedFavoriteSymbols')).toBeInTheDocument();
    });
});
