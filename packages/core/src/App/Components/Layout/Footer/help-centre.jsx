import React from 'react';
import { Popover, StaticUrl } from '@deriv/components';
import { LegacyHelpCentreIcon } from '@deriv/quill-icons';
import { localize } from '@deriv-com/translations';

export const HelpCentre = ({ showPopover }) => (
    <StaticUrl href='/help-centre/' id='dt_help_centre' aria-label={localize('Help centre')} className='footer__link'>
        {showPopover ? (
            <Popover
                classNameBubble='help-centre__tooltip'
                alignment='top'
                message={localize('Help centre')}
                zIndex={9999}
            >
                <LegacyHelpCentreIcon className='footer__icon' iconSize='xs' />
            </Popover>
        ) : (
            <LegacyHelpCentreIcon className='footer__icon' iconSize='xs' />
        )}
    </StaticUrl>
);
