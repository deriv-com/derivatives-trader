import React from 'react';
import classNames from 'classnames';

import { observer, useStore } from '@deriv/stores';
import { useDevice } from '@deriv-com/ui';

import { MenuLinks } from 'App/Components/Layout/Header';
import { AccountsInfoLoader } from 'App/Components/Layout/Header/Components/Preloader';
import ToggleMenuDrawer from 'App/Components/Layout/Header/toggle-menu-drawer.jsx';
import NewVersionNotification from 'App/Containers/new-version-notification';

import BrandShortLogo from './brand-short-logo';
import HeaderAccountActions from './header-account-actions';
import HomeButton from './home-button';

const HeaderLegacy = observer(() => {
    const { client, ui, notifications } = useStore();
    const { currency, is_logged_in, is_logging_in } = client;
    const { header_extension, is_app_disabled, is_route_modal_on } = ui;
    const { addNotificationMessage, client_notifications, removeNotificationMessage } = notifications;

    const { isDesktop } = useDevice();

    const addUpdateNotification = () => addNotificationMessage(client_notifications?.new_version_available);
    const removeUpdateNotification = React.useCallback(
        () => removeNotificationMessage({ key: 'new_version_available' }),
        [removeNotificationMessage]
    );

    React.useEffect(() => {
        document.addEventListener('IgnorePWAUpdate', removeUpdateNotification);
        return () => document.removeEventListener('IgnorePWAUpdate', removeUpdateNotification);
    }, [removeUpdateNotification]);

    return (
        <header
            className={classNames('header', {
                'header--is-disabled': is_app_disabled || is_route_modal_on,
            })}
        >
            <div className='header__menu-items'>
                <div className='header__menu-left'>
                    {isDesktop ? (
                        <React.Fragment>
                            <BrandShortLogo />
                            <div className='header__divider' />
                            {is_logged_in && <HomeButton />}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <ToggleMenuDrawer />
                            <BrandShortLogo />
                            {header_extension && is_logged_in && (
                                <div className='header__menu-left-extensions'>{header_extension}</div>
                            )}
                        </React.Fragment>
                    )}
                    <MenuLinks />
                </div>

                <div
                    className={classNames('header__menu-right', {
                        'header__menu-right--hidden': !isDesktop && is_logging_in,
                    })}
                >
                    {is_logging_in ? (
                        <div
                            id='dt_core_header_acc-info-preloader'
                            className={classNames('acc-info__preloader', {
                                'acc-info__preloader--no-currency': !currency,
                            })}
                        >
                            <AccountsInfoLoader is_logged_in={is_logged_in} is_desktop={isDesktop} speed={3} />
                        </div>
                    ) : (
                        <HeaderAccountActions />
                    )}
                </div>
            </div>
            <NewVersionNotification onUpdate={addUpdateNotification} />
        </header>
    );
});

export default HeaderLegacy;
