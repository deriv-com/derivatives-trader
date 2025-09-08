import React from 'react';

import { useAccountSettingsRedirect } from '@deriv/api';
import { Popover } from '@deriv/components';
import { LegacyAccountLimitsIcon } from '@deriv/quill-icons';
import { observer } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

export const AccountLimits = observer(({ showPopover }) => {
    // Use the useAccountSettingsRedirect hook with 'account-limits' as the redirect_to value
    const { redirect_url } = useAccountSettingsRedirect('account-limits');
    const { localize } = useTranslations();

    return (
        <a className='footer__link' href={redirect_url}>
            {showPopover ? (
                <Popover alignment='top' message={localize('Account limits')} zIndex={9999}>
                    <LegacyAccountLimitsIcon className='footer__icon ic-deriv__icon' iconSize='xs' />
                </Popover>
            ) : (
                <LegacyAccountLimitsIcon className='footer__icon ic-deriv__icon' iconSize='xs' />
            )}
        </a>
    );
});
