import React from 'react';

import { observer } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';
import { Text } from '@deriv-com/quill-ui';

import { useGetSymbolSearchResults } from 'AppV2/Hooks/useGetSymbolSearchResults';

import MarketCategoryItem from '../MarketCategoryItem';
import SymbolNotFound from '../SymbolNotFound';

type TSymbolSearchResults = {
    searchValue: string;
    setSearchValue: (input: string) => void;
    setIsOpen: (input: boolean) => void;
    setSelectedSymbol: (input: string) => void;
};
const SymbolSearchResults = observer(({ searchValue, setIsOpen, setSelectedSymbol }: TSymbolSearchResults) => {
    const searchResults = useGetSymbolSearchResults(searchValue);

    return (
        <div className='symbol-search-results__container'>
            {searchValue === '' && (
                <Text size='sm' color='quill-typography__color--subtle' className='symbol-search-results--suggestion'>
                    <Localize i18n_default_text='Try searching for markets or keywords' />
                </Text>
            )}
            {searchValue !== '' &&
                (searchResults.length > 0 ? (
                    searchResults.map(symbol => (
                        <MarketCategoryItem
                            key={(symbol as any)?.underlying_symbol || symbol?.symbol}
                            item={symbol}
                            selectedSymbol={''}
                            setSelectedSymbol={setSelectedSymbol}
                            setIsOpen={setIsOpen}
                        />
                    ))
                ) : (
                    <SymbolNotFound searchTerm={searchValue} />
                ))}
        </div>
    );
});

export default SymbolSearchResults;
