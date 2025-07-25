import React from 'react';
import clsx from 'clsx';

import { Money, Skeleton } from '@deriv/components';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { Text } from '@deriv-com/quill-ui';

import { useTraderStore } from 'Stores/useTraderStores';

const PayoutInfo = observer(() => {
    const { currency, is_market_closed, proposal_info, trade_type_tab } = useTraderStore();
    const { value: payout } = proposal_info[trade_type_tab]?.obj_contract_basis || {};
    const has_error = proposal_info[trade_type_tab]?.has_error;

    return (
        <div className='payout-info__container'>
            <Text size='sm' className={clsx(is_market_closed && 'trade-params__text--disabled')}>
                <Localize i18n_default_text='Payout' />
            </Text>
            {payout ? (
                <Text size='sm' bold className={clsx(is_market_closed && 'trade-params__text--disabled')}>
                    <Money amount={payout} show_currency currency={currency} />
                </Text>
            ) : has_error ? (
                <Text size='sm' bold>
                    - {currency}
                </Text>
            ) : (
                <Skeleton width={60} height={14} />
            )}
        </div>
    );
});

export default PayoutInfo;
