import React from 'react';
import { useLocation } from 'react-router';
import classNames from 'classnames';
import { Text } from '@deriv/components';
import { getBrandUrl, routes } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';
import { LegacyHomeNewIcon } from '@deriv/quill-icons';

const TradersHubHomeButton = observer(() => {
    const location = useLocation();
    const { pathname } = location;

    const handleTradershubRedirect = () => {
        const hubUrl = getBrandUrl();
        const url_query_string = window.location.search;
        const url_params = new URLSearchParams(url_query_string);
        const account_currency = url_params.get('account') || window.sessionStorage.getItem('account');

        window.location.href = `${hubUrl}/redirect?action=redirect_to&redirect_to=home${account_currency ? `&account=${account_currency}` : ''}`;
    };

    return (
        <div
            data-testid='dt_traders_hub_home_button'
            className={classNames('traders-hub-header__tradershub', {
                'traders-hub-header__tradershub--active': pathname === routes.index,
            })}
            onClick={handleTradershubRedirect}
        >
            <div className='traders-hub-header__tradershub--home-logo'>
                <LegacyHomeNewIcon iconSize='xs' />
            </div>
            <Text className='traders-hub-header__tradershub--text'>
                <Localize i18n_default_text="Trader's Hub" />
            </Text>
        </div>
    );
});

export default TradersHubHomeButton;
