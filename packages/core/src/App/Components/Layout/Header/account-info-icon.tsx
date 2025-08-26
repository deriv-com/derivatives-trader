import React from 'react';
import {
    CurrencyUsdIcon,
    CurrencyEurIcon,
    CurrencyDemoIcon,
    CurrencyNoneIcon,
    CurrencyGbpIcon,
    CurrencyAudIcon,
    CurrencyBtcIcon,
    CurrencyEthIcon,
    CurrencyLtcIcon,
    CurrencyUsdtIcon,
} from '@deriv/quill-icons';

type TAccountInfoIcon = {
    is_virtual?: boolean;
    currency?: string;
};

const currencyIconMap: { [key: string]: React.ComponentType<any> } = {
    usd: CurrencyUsdIcon,
    eur: CurrencyEurIcon,
    gbp: CurrencyGbpIcon,
    aud: CurrencyAudIcon,
    btc: CurrencyBtcIcon,
    eth: CurrencyEthIcon,
    ltc: CurrencyLtcIcon,
    ust: CurrencyUsdtIcon,
    virtual: CurrencyDemoIcon,
    Unknown: CurrencyNoneIcon,
};

const AccountInfoIcon = ({ is_virtual, currency }: TAccountInfoIcon) => {
    const currencyKey = is_virtual ? 'virtual' : (currency ?? 'Unknown');
    const IconComponent = currencyIconMap[currencyKey] || CurrencyNoneIcon;

    return (
        <IconComponent
            data-testid='dt_icon'
            className={`acc-info__id-icon acc-info__id-icon--${is_virtual ? 'virtual' : currency}`}
            iconSize='sm'
        />
    );
};

export default AccountInfoIcon;
