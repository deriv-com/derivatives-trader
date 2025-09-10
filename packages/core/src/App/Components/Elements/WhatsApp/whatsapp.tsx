import React, { Fragment } from 'react';

import { useIsIntercomAvailable } from '@deriv/api';
import { Popover } from '@deriv/components';
import { LegacyWhatsappIcon } from '@deriv/quill-icons';
import { useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { URLConstants } from '@deriv-com/utils';

const WhatsApp = ({ showPopover, onClick }: { showPopover?: boolean; onClick?: () => void }) => {
    const { localize } = useTranslations();
    const { isDesktop } = useDevice();

    const icAvailable = useIsIntercomAvailable();

    if (!icAvailable) return null;

    if (!isDesktop)
        return (
            <Fragment>
                <LegacyWhatsappIcon className='drawer-icon' iconSize='xs' fill='var(--color-text-primary)' />
                <a
                    className='header__menu-mobile-whatsapp-link'
                    href={URLConstants.whatsApp}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={onClick}
                >
                    {localize('WhatsApp')}
                </a>
            </Fragment>
        );

    return (
        <a
            href={URLConstants.whatsApp}
            aria-label={localize('WhatsApp')}
            className='footer__link'
            target='_blank'
            rel='noreferrer'
        >
            {showPopover ? (
                <Popover
                    classNameBubble='whatsapp__tooltip'
                    alignment='top'
                    message={localize('WhatsApp')}
                    zIndex='9999'
                >
                    <LegacyWhatsappIcon className='footer__icon' iconSize='xs' fill='var(--color-text-primary)' />
                </Popover>
            ) : (
                <LegacyWhatsappIcon className='footer__icon' iconSize='xs' fill='var(--color-text-primary)' />
            )}
        </a>
    );
};

export default WhatsApp;
