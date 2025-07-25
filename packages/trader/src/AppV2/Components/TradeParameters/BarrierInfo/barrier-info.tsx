import React from 'react';
import clsx from 'clsx';

import { Skeleton } from '@deriv/components';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { Text } from '@deriv-com/quill-ui';

import { useTraderStore } from 'Stores/useTraderStores';

const BarrierInfo = observer(() => {
    const { barrier_1, contract_type, is_market_closed, proposal_info } = useTraderStore();
    const contract_key = contract_type.toUpperCase();
    const has_error = proposal_info[contract_key]?.has_error;

    if (has_error) return null;
    return (
        <div className='barrier-info__container'>
            <Text size='sm' className={clsx(is_market_closed && 'trade-params__text--disabled')}>
                <Localize i18n_default_text='Barrier' />
            </Text>
            {barrier_1 ? (
                <Text size='sm' bold className={clsx(is_market_closed && 'trade-params__text--disabled')}>
                    {barrier_1}
                </Text>
            ) : (
                <Skeleton width={50} height={14} />
            )}
        </div>
    );
});

export default BarrierInfo;
