import React from 'react';

import { observer } from '@deriv/stores';

import { useGetFavoriteSymbols } from 'AppV2/Hooks/useGetFavoriteSymbols';

import MarketCategoryItem from '../MarketCategoryItem';

import NoFavoriteSymbols from './no-favorite-symbols';

type TFavoriteSymbols = {
    selectedSymbol: string;
    setSelectedSymbol: (input: string) => void;
    setIsOpen: (input: boolean) => void;
};

const FavoriteSymbols = observer(({ selectedSymbol, setSelectedSymbol, setIsOpen }: TFavoriteSymbols) => {
    const favoriteSymbols = useGetFavoriteSymbols();

    return (
        <React.Fragment>
            {favoriteSymbols.length > 0 ? (
                <div className='favorite-symbols__container'>
                    {favoriteSymbols.map(symbol => (
                        <MarketCategoryItem
                            key={symbol?.underlying_symbol}
                            item={symbol}
                            selectedSymbol={selectedSymbol}
                            setSelectedSymbol={setSelectedSymbol}
                            setIsOpen={setIsOpen}
                        />
                    ))}
                </div>
            ) : (
                <NoFavoriteSymbols />
            )}
        </React.Fragment>
    );
});

export default FavoriteSymbols;
