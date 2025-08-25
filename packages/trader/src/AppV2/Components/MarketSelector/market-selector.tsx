import React, { useEffect, useState, useRef } from 'react';

import { LabelPairedChevronDownMdRegularIcon } from '@deriv/quill-icons';
import { getMarketNamesMap, getSymbolDisplayName } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';
import { CaptionText, Skeleton, Tag, Text, useSnackbar } from '@deriv-com/quill-ui';

import useActiveSymbols from 'AppV2/Hooks/useActiveSymbols';
import useContractsFor from 'AppV2/Hooks/useContractsFor';
import { TContractType } from 'Modules/Trading/Components/Form/ContractType/types';
import { useTraderStore } from 'Stores/useTraderStores';

import ActiveSymbolsList from '../ActiveSymbolsList';
import SymbolIconsMapper from '../SymbolIconsMapper/symbol-icons-mapper';

const MarketSelector = observer(() => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeSymbols } = useActiveSymbols();
    const { symbol: storeSymbol, tick_data, is_market_closed, contract_type } = useTraderStore();
    const { addSnackbar } = useSnackbar();
    const { trade_types } = useContractsFor();

    const currentSymbol = activeSymbols.find(
        symbol_info => ((symbol_info as any).underlying_symbol || symbol_info.symbol) === storeSymbol
    );

    const contract_name = trade_types?.find((item: TContractType) => item.value === contract_type)?.text;

    useEffect(() => {
        if (!currentSymbol) {
            const symbol_name = getMarketNamesMap()[storeSymbol as keyof typeof getMarketNamesMap] || storeSymbol;
            const message = contract_name ? (
                <Localize
                    i18n_default_text={`${symbol_name} is unavailable for ${contract_name}.`}
                    values={{
                        symbol_name,
                        contract_name,
                    }}
                />
            ) : (
                <Localize
                    i18n_default_text={`${symbol_name} is unavailable.`}
                    values={{
                        symbol_name,
                    }}
                />
            );

            symbol_name &&
                addSnackbar({
                    message,
                    status: 'neutral',
                    hasCloseButton: true,
                    hasFixedHeight: false,
                    style: {
                        marginBottom: '0',
                        width: 'calc(100% - var(--core-spacing-800)',
                    },
                });
        }
    }, [currentSymbol, storeSymbol, contract_name]);

    const { pip_size, quote } = tick_data ?? {};
    const current_spot = quote?.toFixed(pip_size);
    const current_spot_replacement = is_market_closed ? (
        <Text>-</Text>
    ) : (
        <Skeleton.Square height={18} width={64} rounded />
    );

    // Add timeout mechanism to prevent infinite skeleton loading
    const [showFallback, setShowFallback] = useState(false);
    const [hasError, setHasError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Error handling for symbol data
    useEffect(() => {
        if (activeSymbols?.length > 0 && !currentSymbol && storeSymbol) {
            setHasError(true);
        } else if (hasError && currentSymbol) {
            setHasError(false);
        }
    }, [activeSymbols, currentSymbol, storeSymbol, hasError]);

    useEffect(() => {
        // If exchange_is_open is undefined, start a timeout
        if (typeof currentSymbol?.exchange_is_open === 'undefined' && !hasError) {
            timeoutRef.current = setTimeout(() => {
                setShowFallback(true);
            }, 5000); // 5 second timeout
        } else {
            // Clear timeout if data becomes available
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
            if (!hasError) {
                setShowFallback(false);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentSymbol?.exchange_is_open, hasError]);

    // Show error state if there's a critical error
    if (hasError && activeSymbols?.length > 0) {
        return (
            <div className='market-selector__error' style={{ padding: '8px', textAlign: 'center' }}>
                <Text size='sm' color='error'>
                    <Localize i18n_default_text='Symbol not available. Please select another market.' />
                </Text>
            </div>
        );
    }

    // Show skeleton loader for a reasonable time, then fallback to basic UI
    if (typeof currentSymbol?.exchange_is_open === 'undefined' && !showFallback) {
        return <Skeleton.Square height={42} width={240} rounded />;
    }

    // Fallback UI when data is not available after timeout
    if (showFallback && typeof currentSymbol?.exchange_is_open === 'undefined') {
        return (
            <React.Fragment>
                <div className='market-selector__container' onClick={() => setIsOpen(true)}>
                    <div className='market-selector'>
                        <SymbolIconsMapper symbol={storeSymbol} />
                        <div className='market-selector-info'>
                            <div className='market-selector-info__label'>
                                <Text bold>{getSymbolDisplayName(activeSymbols, storeSymbol)}</Text>
                                <Tag
                                    label={<Localize key='loading' i18n_default_text='LOADING' />}
                                    color='warning'
                                    variant='fill'
                                    showIcon={false}
                                    size='sm'
                                />
                                <LabelPairedChevronDownMdRegularIcon fill='var(--component-textIcon-normal-default' />
                            </div>
                        </div>
                    </div>
                </div>
                <ActiveSymbolsList isOpen={isOpen} setIsOpen={setIsOpen} />
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div className='market-selector__container' onClick={() => setIsOpen(true)}>
                <div className='market-selector'>
                    <SymbolIconsMapper symbol={storeSymbol} />
                    <div className='market-selector-info'>
                        <div className='market-selector-info__label'>
                            <Text bold>
                                {getSymbolDisplayName(
                                    activeSymbols,
                                    (currentSymbol as any)?.underlying_symbol || currentSymbol?.symbol || ''
                                )}
                            </Text>
                            {!currentSymbol?.exchange_is_open && (
                                <Tag
                                    label={<Localize key='closed' i18n_default_text='CLOSED' />}
                                    color='error'
                                    variant='fill'
                                    showIcon={false}
                                    size='sm'
                                />
                            )}
                            <LabelPairedChevronDownMdRegularIcon fill='var(--component-textIcon-normal-default' />
                        </div>
                        {current_spot ? (
                            <CaptionText className='market-selector-info__price'>{current_spot}</CaptionText>
                        ) : (
                            current_spot_replacement
                        )}
                    </div>
                </div>
            </div>
            <ActiveSymbolsList isOpen={isOpen} setIsOpen={setIsOpen} />
        </React.Fragment>
    );
});

export default MarketSelector;
