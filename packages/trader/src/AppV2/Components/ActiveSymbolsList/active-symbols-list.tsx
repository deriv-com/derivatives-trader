import React, { useEffect, useRef, useState } from 'react';

import { observer } from '@deriv/stores';
import { ActionSheet, Tab } from '@deriv-com/quill-ui';

import { useTraderStore } from 'Stores/useTraderStores';

import { sendMarketTypeToAnalytics } from '../../../Analytics';
import MarketCategories from '../MarketCategories';
import SymbolSearchResults from '../SymbolSearchResults';
import SymbolsSearchField from '../SymbolsSearchField';

type TActiveSymbolsList = {
    isOpen: boolean;
    setIsOpen: (input: boolean) => void;
};

const ActiveSymbolsList = observer(({ isOpen, setIsOpen }: TActiveSymbolsList) => {
    const { setTickData, setDigitStats, symbol, contract_type } = useTraderStore();
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState(symbol);
    const [searchValue, setSearchValue] = useState('');

    const marketCategoriesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedSymbol(symbol);
        setTickData(null);
        setDigitStats([]);
    }, [setDigitStats, setTickData, symbol]);

    return (
        <React.Fragment>
            <ActionSheet.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ActionSheet.Portal shouldCloseOnDrag fullHeightOnOpen>
                    <SymbolsSearchField
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        isSearching={isSearching}
                        setIsSearching={setIsSearching}
                    />
                    <Tab.Container
                        contentStyle='hug'
                        size='md'
                        className='active-symbols-list__content'
                        selectedTabIndex={1}
                        onChangeTab={index => {
                            if (index !== 1) {
                                marketCategoriesRef.current?.scrollTo({ top: 0 });
                            }
                        }}
                    >
                        {isSearching ? (
                            <SymbolSearchResults
                                searchValue={searchValue}
                                setSearchValue={setSearchValue}
                                setIsOpen={setIsOpen}
                                setSelectedSymbol={(symbol: string) => {
                                    sendMarketTypeToAnalytics(symbol, contract_type);
                                    setSelectedSymbol(symbol);
                                }}
                            />
                        ) : (
                            <MarketCategories
                                selectedSymbol={selectedSymbol}
                                setSelectedSymbol={(symbol: string) => {
                                    sendMarketTypeToAnalytics(symbol, contract_type);
                                    setSelectedSymbol(symbol);
                                }}
                                setIsOpen={setIsOpen}
                                isOpen={isOpen}
                                marketCategoriesRef={marketCategoriesRef}
                            />
                        )}
                    </Tab.Container>
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </React.Fragment>
    );
});

export default ActiveSymbolsList;
