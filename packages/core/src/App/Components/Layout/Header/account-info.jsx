import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Text } from '@deriv/components';
import { getAccountTypeFromUrl, getCurrencyDisplayCode } from '@deriv/shared';
import { Localize, useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import AccountInfoIcon from './account-info-icon';
import AccountInfoWrapper from './account-info-wrapper';

const AccountInfo = ({ balance, currency, is_mobile }) => {
    const { localize } = useTranslations();
    const currency_lower = currency?.toLowerCase();
    const { isDesktop } = useDevice();

    const accountTypeFromUrl = getAccountTypeFromUrl();
    const accountTypeHeader = accountTypeFromUrl === 'real' ? localize('Real') : localize('Demo');
    const isDemoAccount = accountTypeFromUrl === 'demo';

    return (
        <div className='acc-info__wrapper'>
            {isDesktop && <div className='acc-info__separator' />}
            <AccountInfoWrapper is_mobile={is_mobile}>
                <div
                    data-testid='dt_acc_info'
                    id='dt_core_account-info_acc-info'
                    className={classNames('acc-info', {
                        'acc-info--is-demo': isDemoAccount,
                    })}
                >
                    <span className='acc-info__id'>
                        {isDesktop ? (
                            <AccountInfoIcon is_demo={isDemoAccount} currency={currency_lower} />
                        ) : (
                            (isDemoAccount || currency) && (
                                <AccountInfoIcon is_demo={isDemoAccount} currency={currency_lower} />
                            )
                        )}
                    </span>
                    <div className='acc-info__content'>
                        <div className='acc-info__account-type-header'>
                            <Text as='p' size='xxs' className='acc-info__account-type'>
                                {accountTypeHeader}
                            </Text>
                        </div>
                        {(typeof balance !== 'undefined' || !currency) && (
                            <div className='acc-info__balance-section'>
                                <p
                                    data-testid='dt_balance'
                                    className={classNames('acc-info__balance', {
                                        'acc-info__balance--no-currency': !currency && !isDemoAccount,
                                    })}
                                >
                                    {!currency ? (
                                        <Localize i18n_default_text='No currency assigned' />
                                    ) : (
                                        `${balance} ${getCurrencyDisplayCode(currency)}`
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </AccountInfoWrapper>
            {isDesktop && <div className='acc-info__separator' />}
        </div>
    );
};

AccountInfo.propTypes = {
    balance: PropTypes.string,
    currency: PropTypes.string,
    is_mobile: PropTypes.bool,
};

export default AccountInfo;
