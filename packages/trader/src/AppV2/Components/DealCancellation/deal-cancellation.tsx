import React from 'react';

import { isOpen, isValidToCancel } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';

import useContractDetails from 'AppV2/Hooks/useContractDetails';
import { getContractDetailsConfig } from 'AppV2/Utils/contract-details-config';

import CardWrapper from '../CardWrapper';
import RiskManagementItem from '../RiskManagementItem';

const DealCancellation = observer(() => {
    const { contract_info } = useContractDetails();
    const { isDealCancellationVisible } = getContractDetailsConfig(contract_info.contract_type ?? '');

    const canCancel = isValidToCancel(contract_info);

    return canCancel && isDealCancellationVisible && isOpen(contract_info) ? (
        <CardWrapper>
            <RiskManagementItem
                label={<Localize i18n_default_text='Deal cancellation' />}
                modal_body_content={
                    <Localize i18n_default_text='When this is active, you can cancel your trade within the chosen time frame. Your stake will be returned without loss.' />
                }
                is_deal_cancellation
            />
        </CardWrapper>
    ) : null;
});

export default DealCancellation;
