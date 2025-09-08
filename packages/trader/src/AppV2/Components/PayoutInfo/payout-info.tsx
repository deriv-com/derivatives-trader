import React from 'react';

import { TContractInfo } from '@deriv/shared';
import { Text } from '@deriv-com/quill-ui';
import { Localize, useTranslations } from '@deriv-com/translations';

import CardWrapper from 'AppV2/Components/CardWrapper';

interface ContractInfoProps {
    contract_info: TContractInfo;
}

const PayoutInfo = ({ contract_info }: ContractInfoProps) => {
    const { localize } = useTranslations();

    return (
        <CardWrapper title={<Localize i18n_default_text='How do I earn a payout?' />}>
            <Text size='sm'>{contract_info.longcode && localize(contract_info.longcode)}</Text>
        </CardWrapper>
    );
};

export default PayoutInfo;
