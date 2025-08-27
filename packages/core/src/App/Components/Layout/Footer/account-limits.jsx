import React from 'react';
import { Popover } from '@deriv/components';
import { LegacyAccountLimitsIcon } from '@deriv/quill-icons';
import { useAccountSettingsRedirect } from '@deriv/api';
import { localize } from '@deriv-com/translations';
import { observer } from '@deriv/stores';

export const AccountLimits = observer(({ showPopover }) => {
    // Use the useAccountSettingsRedirect hook with 'account-limits' as the redirect_to value
    const { redirect_url } = useAccountSettingsRedirect('account-limits');

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
