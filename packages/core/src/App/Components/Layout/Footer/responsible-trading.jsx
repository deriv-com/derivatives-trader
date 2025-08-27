import React from 'react';
import { Popover, StaticUrl } from '@deriv/components';
import { LegacyVerificationIcon } from '@deriv/quill-icons';
import { localize } from '@deriv-com/translations';

export const ResponsibleTrading = ({ showPopover }) => (
    <StaticUrl href='/responsible' className='footer__link'>
        {showPopover ? (
            <Popover alignment='top' message={localize('Responsible trading')} zIndex={9999}>
                <LegacyVerificationIcon className='footer__icon ic-deriv__icon' iconSize='xs' />
            </Popover>
        ) : (
            <LegacyVerificationIcon className='footer__icon ic-deriv__icon' iconSize='xs' />
        )}
    </StaticUrl>
);
