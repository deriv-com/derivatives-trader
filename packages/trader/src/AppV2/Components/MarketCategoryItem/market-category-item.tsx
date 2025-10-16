import React, { forwardRef, Ref, useEffect, useState } from 'react';
import clsx from 'clsx';
import { TActiveSymbolsResponse } from '@deriv/api';
import { StandaloneStarFillIcon, StandaloneStarRegularIcon } from '@deriv/quill-icons';
import { clickAndKeyEventHandler, getSymbolDisplayName } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';
import { Tag, Text, useSnackbar } from '@deriv-com/quill-ui';
import { useModulesStore } from 'Stores/useModulesStores';
import { useTraderStore } from 'Stores/useTraderStores';

import SymbolIconsMapper from '../SymbolIconsMapper/symbol-icons-mapper';

type TMarketCategoryItem = {
    item: NonNullable<TActiveSymbolsResponse['active_symbols']>[0];
    selectedSymbol: string;
    setSelectedSymbol: (input: string) => void;
    setIsOpen: (input: boolean) => void;
};

const MarketCategoryItem = forwardRef(
    ({ item, selectedSymbol, setSelectedSymbol, setIsOpen }: TMarketCategoryItem, ref: Ref<HTMLDivElement>) => {
        const [isFavorite, setIsFavorite] = useState(false);
        const { onChange: onSymbolChange } = useTraderStore();
        const { markets } = useModulesStore();
        const { favoriteSymbols, setFavoriteSymbols, removeFavoriteSymbol } = markets;
        const { addSnackbar } = useSnackbar();

        useEffect(() => {
            setIsFavorite(favoriteSymbols.includes(item.underlying_symbol!));
        }, [favoriteSymbols, item.underlying_symbol]);

        const handleSelect = async (symbol: string) => {
            setSelectedSymbol(symbol);
            await onSymbolChange({ target: { name: 'symbol', value: symbol } });
            setIsOpen(false);
        };

        const toggleFavorites = (symbol: string) => {
            if (!symbol) return;
            const symbolIndex = favoriteSymbols.indexOf(symbol);

            if (symbolIndex !== -1) {
                removeFavoriteSymbol(symbol);
                addSnackbar({
                    icon: <StandaloneStarRegularIcon fill='var(--component-snackbar-icon-neutral)' iconSize='sm' />,
                    message: <Localize i18n_default_text='Removed from favourites' />,
                    hasCloseButton: false,
                });
            } else {
                setFavoriteSymbols([...favoriteSymbols, symbol]);
                addSnackbar({
                    icon: <StandaloneStarFillIcon fill='var(--core-color-solid-mustard-700)' iconSize='sm' />,
                    message: <Localize i18n_default_text='Added to favourites' />,
                    hasCloseButton: false,
                });
            }
            setIsFavorite(favoriteSymbols.includes(symbol));
        };

        const handleSelectDecorator = (e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
            const symbol = (e?.currentTarget as HTMLElement).getAttribute('data-symbol') || '';
            clickAndKeyEventHandler(() => handleSelect(symbol), e);
        };

        const toggleFavoritesDecorator = (e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
            const symbol = (e?.currentTarget as HTMLElement).getAttribute('data-symbol') || '';
            clickAndKeyEventHandler(() => toggleFavorites(symbol), e);
        };

        return (
            <div
                className={clsx('market-category-item', {
                    'market-category-item--selected': selectedSymbol === item.underlying_symbol,
                })}
                ref={ref}
            >
                <span
                    className='market-category-item-left'
                    data-symbol={item.underlying_symbol}
                    onClick={handleSelectDecorator}
                    onKeyDown={handleSelectDecorator}
                >
                    <SymbolIconsMapper symbol={item.underlying_symbol!} />
                    <Text
                        size='sm'
                        className={clsx('market-category-item-symbol', {
                            'market-category-item-symbol--selected': selectedSymbol === item.underlying_symbol,
                        })}
                    >
                        <span>{getSymbolDisplayName(item.underlying_symbol!)}</span>
                    </Text>
                    {!item.exchange_is_open && (
                        <Tag
                            label={<Localize key='exchange-closed' i18n_default_text='CLOSED' />}
                            color='error'
                            variant={selectedSymbol === item.underlying_symbol ? 'outline' : 'fill'}
                            showIcon={false}
                        />
                    )}
                </span>
                <span
                    onClick={toggleFavoritesDecorator}
                    onKeyDown={toggleFavoritesDecorator}
                    data-symbol={item.underlying_symbol}
                >
                    {isFavorite ? (
                        <StandaloneStarFillIcon fill='var(--core-color-solid-mustard-700)' iconSize='sm' />
                    ) : (
                        <StandaloneStarRegularIcon
                            fill={
                                selectedSymbol === item.underlying_symbol
                                    ? 'var(--semantic-color-slate-solid-textIcon-inverse-highest)'
                                    : 'var(--semantic-color-monochrome-textIcon-normal-mid)'
                            }
                            iconSize='sm'
                        />
                    )}
                </span>
            </div>
        );
    }
);

MarketCategoryItem.displayName = 'MarketCategoryItem';

export default observer(MarketCategoryItem);
