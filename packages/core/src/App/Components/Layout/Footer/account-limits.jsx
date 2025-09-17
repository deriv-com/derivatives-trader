import React from 'react';
import { Popover } from '@deriv/components';
import { LegacyAccountLimitsIcon } from '@deriv/quill-icons';
import { observer } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

export const AccountLimits = observer(({ showPopover }) => {
    // TODO: Update the redirect_url when the account limits page is available
    const redirect_url = '/';
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
