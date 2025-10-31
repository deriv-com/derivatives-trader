import React from 'react';

import { Text } from '@deriv/components';
import { LegacyHomeNewIcon } from '@deriv/quill-icons';
import { getBrandHomeUrl } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';

const HomeButton = observer(() => {
    const { common } = useStore();
    const { current_language } = common;

    const handleHomeRedirect = () => {
        window.open(getBrandHomeUrl(current_language), '_blank', 'noopener,noreferrer');
    };

    return (
        <div data-testid='dt_home_button' className='header__menu-link' onClick={handleHomeRedirect}>
            <Text size='m' line_height='xs' title='Home' className='header__menu-link-text'>
                <LegacyHomeNewIcon className='header__icon' iconSize='xs' fill='var(--color-text-primary)' />
                <Localize i18n_default_text='Home' />
            </Text>
        </div>
    );
});

export default HomeButton;
