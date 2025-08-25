import React from 'react';
import { Icon, Popover } from '@deriv/components';
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
                    <Icon icon='IcAccountLimits' className='footer__icon ic-deriv__icon' />
                </Popover>
            ) : (
                <Icon icon='IcAccountLimits' className='footer__icon ic-deriv__icon' />
            )}
        </a>
    );
});
