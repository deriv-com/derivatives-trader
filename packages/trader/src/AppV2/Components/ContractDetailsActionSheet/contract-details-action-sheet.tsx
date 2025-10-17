import React from 'react';

import { Money, RemainingTime, SymbolIconsMapper } from '@deriv/components';
import {
    getCardLabels,
    getMarketName,
    getTradeTypeName,
    isCryptoContract,
    isEnded,
    isHigherLowerContractInfo,
    isMultiplierContract,
    TContractInfo,
} from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { ActionSheet, Tag, Text } from '@deriv-com/quill-ui';
import { Localize, localize } from '@deriv-com/translations';

import ContractDetailsFooter from 'AppV2/Components/ContractDetailsFooter';
import useOrderDetails from 'AppV2/Hooks/useOrderDetails';
import { getProfit } from 'AppV2/Utils/positions-utils';
import { addUnit } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

type TContractDetailsActionSheetProps = {
    contract_info: TContractInfo;
};

const ContractDetailsActionSheet = observer(({ contract_info }: TContractDetailsActionSheetProps) => {
    const [is_open, setIsOpen] = React.useState(true); // Open by default
    const { common } = useStore();
    const { server_time } = common;

    // Add a class to make the modal background transparent
    React.useEffect(() => {
        // Function to add our transparent overlay class to modal elements
        const addTransparentClass = () => {
            const modalElements = document.querySelectorAll('.quill-action-sheet--portal__variant--modal');
            modalElements.forEach(element => {
                element.classList.add('contract-details-action-sheet__transparent-overlay');
            });
        };

        // Add class immediately for any existing elements
        addTransparentClass();

        return () => {
            // Remove our class from any modal elements
            const modalElements = document.querySelectorAll('.quill-action-sheet--portal__variant--modal');
            modalElements.forEach(element => {
                element.classList.remove('contract-details-action-sheet__transparent-overlay');
            });
        };
    }, []);

    const onClose = () => {
        setIsOpen(false);
    };

    const { contract_type, underlying_symbol, date_expiry, shortcode, sell_time, currency } = contract_info || {};

    const is_higher_lower = isHigherLowerContractInfo({
        contract_category: contract_info.contract_category,
        shortcode,
    });
    const contract_main_title = getTradeTypeName(contract_type ?? '', {
        isHighLow: is_higher_lower,
        showMainTitle: true,
    });
    const tradeTypeName = `${contract_main_title} ${getTradeTypeName(contract_type ?? '', {
        isHighLow: is_higher_lower,
    })}`.trim();

    const totalProfit = getProfit(contract_info);
    const is_crypto = isCryptoContract((contract_info as TContractInfo).underlying);
    const isMultiplier = isMultiplierContract(contract_type);
    const isSold = !!sell_time || isEnded(contract_info as TContractInfo);
    const has_no_auto_expiry = isMultiplier && !is_crypto;
    const show_status_timer_tag = !has_no_auto_expiry;
    const symbol_name = getMarketName(underlying_symbol || '');

    const details = useOrderDetails(contract_info)?.details;
    const { cancellation_duration, has_cancellation } = useTraderStore();

    return (
        <>
            {!isSold && (
                <ActionSheet.Root
                    isOpen={is_open}
                    onClose={onClose}
                    position='left'
                    className='contract-details-action-sheet'
                    expandable={false}
                >
                    <ActionSheet.Portal shouldCloseOnDrag>
                        <ActionSheet.Content className='contract-details-action-sheet__content'>
                            <div className='contract-details-action-sheet__header'>
                                <div className='contract-details-action-sheet__type-wrapper'>
                                    <div className='contract-details-action-sheet__type-icon'>
                                        <SymbolIconsMapper symbol={underlying_symbol ?? ''} />
                                    </div>
                                    <div>
                                        <Text as='span' bold>
                                            {tradeTypeName}
                                        </Text>
                                        <Text
                                            as='p'
                                            size='sm'
                                            className='symbol'
                                            color='quill-typography__color--subtle'
                                        >
                                            {symbol_name}
                                        </Text>
                                    </div>
                                </div>
                                <div className='contract-details-action-sheet__pnl'>
                                    {date_expiry && show_status_timer_tag && (
                                        <Text as='div' className='status' size='lg'>
                                            <RemainingTime
                                                end_time={date_expiry}
                                                format='HH:mm:ss'
                                                start_time={server_time}
                                                getCardLabels={getCardLabels}
                                            />
                                        </Text>
                                    )}
                                    <Text className={`${Number(totalProfit) >= 0 ? 'profit' : 'loss'}`} size='sm'>
                                        <Money amount={totalProfit} currency={currency} has_sign show_currency />
                                    </Text>
                                </div>
                            </div>
                            <div>
                                {details?.Duration && (
                                    <Tag
                                        className='contract-details-action-sheet__badges'
                                        variant='custom'
                                        label={
                                            <Localize
                                                i18n_default_text='Duration: {{duration}}'
                                                values={{
                                                    duration: details.Duration,
                                                }}
                                            />
                                        }
                                        size='sm'
                                    />
                                )}
                                {details?.Multiplier && (
                                    <Tag
                                        className='contract-details-action-sheet__badges'
                                        variant='custom'
                                        label={
                                            <Localize
                                                i18n_default_text='Multiplier: {{multiplier}}'
                                                values={{
                                                    multiplier: details.Multiplier,
                                                }}
                                            />
                                        }
                                        size='sm'
                                    />
                                )}
                                {details?.Stake && (
                                    <Tag
                                        className='contract-details-action-sheet__badges'
                                        variant='custom'
                                        label={
                                            <Localize
                                                i18n_default_text='Stake: {{stake}}'
                                                values={{
                                                    stake: details.Stake,
                                                }}
                                            />
                                        }
                                        size='sm'
                                    />
                                )}
                                {has_cancellation && cancellation_duration && (
                                    <Tag
                                        className='contract-details-action-sheet__badges'
                                        variant='custom'
                                        label={
                                            <Localize
                                                i18n_default_text='DC: {{duration}}'
                                                values={{
                                                    duration: addUnit({
                                                        value: cancellation_duration,
                                                        unit: localize('minutes'),
                                                    }),
                                                }}
                                            />
                                        }
                                        size='sm'
                                    />
                                )}
                            </div>
                        </ActionSheet.Content>
                        <ActionSheet.Content className='contract-details-action-sheet__footer'>
                            <ContractDetailsFooter
                                contract_info={contract_info}
                                className='contract-details-action-sheet__footer--position'
                            />
                        </ActionSheet.Content>
                    </ActionSheet.Portal>
                </ActionSheet.Root>
            )}
        </>
    );
});

export default ContractDetailsActionSheet;
