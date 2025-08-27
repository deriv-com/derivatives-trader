import React from 'react';
import classNames from 'classnames';
import { LegacyChevronRight1pxIcon, LegacyChevronDown1pxIcon } from '@deriv/quill-icons';
import { useDevice } from '@deriv-com/ui';
import IconTradeCategory from 'Assets/Trading/Categories/icon-trade-categories';
import { findContractCategory } from '../../../Helpers/contract-type';
import { TContractCategory, TContractType, TList } from './types';

type TDisplay = {
    is_open: boolean;
    name: string;
    list: TContractCategory[];
    onClick: () => void;
    value: string;
};

const Display = ({ is_open, name, list, onClick, value }: TDisplay) => {
    const { isMobile } = useDevice();
    const getDisplayText = () =>
        findContractCategory(list as unknown as TList[], { value })?.contract_types?.find((item: TContractType) =>
            item.value.includes(value)
        )?.text;

    return (
        <div
            data-testid='dt_contract_dropdown'
            className={classNames('contract-type-widget__display', {
                'contract-type-widget__display--clicked': is_open,
            })}
            onClick={onClick}
        >
            <IconTradeCategory category={value} className='contract-type-widget__icon-wrapper' />
            <span data-name={name} data-value={value}>
                {getDisplayText()}
            </span>
            {isMobile ? (
                <LegacyChevronRight1pxIcon
                    iconSize='xs'
                    className='contract-type-widget__select-arrow--right'
                    fill='var(--color-text-primary)'
                />
            ) : (
                <LegacyChevronDown1pxIcon
                    iconSize='xs'
                    className={classNames(
                        'contract-type-widget__select-arrow',
                        'contract-type-widget__select-arrow--left'
                    )}
                    fill='var(--color-text-primary)'
                />
            )}
        </div>
    );
};

export default Display;
