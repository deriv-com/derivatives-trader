import React from 'react';

import { Money, Text, ThemedScrollbars } from '@deriv/components';
import { DerivLightEmptyCardboardBoxIcon } from '@deriv/quill-icons';
import { isMobile, TContractStore } from '@deriv/shared';
import { Localize } from '@deriv-com/translations';

import ContractAuditItem from './contract-audit-item';

type TContractHistory = {
    currency?: string;
    history?: [] | TContractStore['contract_update_history'];
};
const ContractHistory = ({ currency, history = [] }: TContractHistory) => {
    if (!history.length) {
        return (
            <div className='contract-audit__empty'>
                <DerivLightEmptyCardboardBoxIcon width={48} height={48} fill='var(--color-text-secondary)' />
                <h4 className='contract-audit__empty-header'>
                    <Localize i18n_default_text='No history' />
                </h4>
                <Text align='center' line_height='s' color='less-prominent' size='xxs'>
                    <Localize i18n_default_text='You have yet to update either take profit or stop loss' />
                </Text>
            </div>
        );
    }
    return (
        <ThemedScrollbars is_bypassed={isMobile()}>
            <div className='contract-audit__tabs-content'>
                {history.map((item, key) => (
                    <ContractAuditItem
                        key={`${key}-${item.order_date}`}
                        id={`dt_history_label_${key}`}
                        label={item.display_name}
                        timestamp={Number(item?.order_date)}
                        value={
                            Math.abs(Number(item.order_amount)) !== 0 ? (
                                <React.Fragment>
                                    {Number(item.order_amount) < 0 && <strong>-</strong>}
                                    <Money amount={item.order_amount} currency={currency} />
                                    {item.value && (
                                        <React.Fragment>
                                            <br />
                                            <span>({item.value})</span>
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            ) : (
                                <Localize i18n_default_text='Cancelled' />
                            )
                        }
                    />
                ))}
            </div>
        </ThemedScrollbars>
    );
};

export default ContractHistory;
