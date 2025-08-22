import React from 'react';

import { Icon, Text } from '@deriv/components';
import { getBrandHomeUrl } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';

const HomeButton = observer(() => {
    const handleHomeRedirect = () => {
        window.open(getBrandHomeUrl(), '_blank', 'noopener,noreferrer');
    };

    return (
        <div data-testid='dt_home_button' className='header__menu-link' onClick={handleHomeRedirect}>
            <Text size='m' line_height='xs' title='Home' className='header__menu-link-text'>
                <Icon icon='IcAppstoreTradersHubHome' className='header__icon' />
                <Localize i18n_default_text='Home' />
            </Text>
        </div>
    );
});

export default HomeButton;
