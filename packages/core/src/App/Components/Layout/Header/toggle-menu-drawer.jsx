import React from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { useRemoteConfig } from '@deriv/api';
import { Div100vhContainer, MobileDrawer, ToggleSwitch } from '@deriv/components';
import {
    LegacyChartsIcon,
    LegacyChevronRight1pxIcon,
    LegacyHelpCentreIcon,
    LegacyHomeNewIcon,
    LegacyLogout1pxIcon,
    LegacyMenuHamburger1pxIcon,
    LegacyRegulatoryInformationIcon,
    LegacyResponsibleTradingIcon,
    LegacyTheme1pxIcon,
} from '@deriv/quill-icons';
import { getBrandHomeUrl, routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';
// eslint-disable-next-line no-unused-vars, import/no-unresolved -- Kept for future restoration of LiveChat functionality
import LiveChat from 'App/Components/Elements/LiveChat';
// eslint-disable-next-line no-unused-vars, import/no-unresolved -- Kept for future restoration of WhatsApp functionality
import WhatsApp from 'App/Components/Elements/WhatsApp';
import NetworkStatus from 'App/Components/Layout/Footer';
import getRoutesConfig from 'App/Constants/routes-config';
import ServerTime from 'App/Containers/server-time.jsx';

import { MenuTitle, MobileLanguageMenu } from './Components/ToggleMenu';
import MenuLink from './menu-link';

const ToggleMenuDrawer = observer(() => {
    const { localize } = useTranslations();
    const { ui, client, traders_hub } = useStore();
    const {
        disableApp,
        enableApp,
        is_mobile_language_menu_open,
        is_dark_mode_on: is_dark_mode,
        setDarkMode: toggleTheme,
        setMobileLanguageMenuOpen,
    } = ui;
    const { is_logged_in, is_virtual, logout: logoutClient, is_eu } = client;
    const { show_eu_related_content } = traders_hub;

    const { pathname: route } = useLocation();

    const should_show_regulatory_information = is_eu && show_eu_related_content && !is_virtual;

    const { data } = useRemoteConfig(true);
    // eslint-disable-next-line no-unused-vars -- Variables kept for future LiveChat/WhatsApp restoration
    const { cs_chat_intercom, cs_chat_whatsapp } = data;

    const [is_open, setIsOpen] = React.useState(false);
    const [transitionExit, setTransitionExit] = React.useState(false);
    const [, setIsSubmenuExpanded] = React.useState(false);

    const timeout = React.useRef();

    // Cleanup timeout on unmount or route change
    React.useEffect(() => {
        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
                setTransitionExit(false);
                setIsOpen(false);
            }
        };
    }, [route]);

    const toggleDrawer = React.useCallback(() => {
        if (is_mobile_language_menu_open) setMobileLanguageMenuOpen(false);
        if (!is_open) setIsOpen(!is_open);
        else {
            setTransitionExit(true);
            timeout.current = setTimeout(() => {
                setIsOpen(false);
                setTransitionExit(false);
            }, 400);
        }
        setIsSubmenuExpanded(false);
    }, [setIsSubmenuExpanded, is_open, is_mobile_language_menu_open, setMobileLanguageMenuOpen]);

    // Simple logout handler that closes drawer and calls logout
    const handleLogout = React.useCallback(async () => {
        toggleDrawer();
        await logoutClient();
    }, [logoutClient, toggleDrawer]);

    const renderSubMenuFromConfig = routePath => {
        const routes_config = getRoutesConfig();
        const routeConfig = routes_config.find(route => route.path === routePath);

        if (!routeConfig || !routeConfig.routes || !is_logged_in) {
            return null;
        }

        return (
            <MobileDrawer.SubMenu
                has_subheader
                submenu_icon={routeConfig.icon_component}
                submenu_title={routeConfig.getTitle()}
                submenu_suffix_icon={<LegacyChevronRight1pxIcon />}
                onToggle={setIsSubmenuExpanded}
                route_config_path={routeConfig.path}
            >
                {routeConfig.routes.map((subroute, index) => (
                    <MobileDrawer.Item key={index}>
                        <MenuLink
                            link_to={subroute.path}
                            icon={subroute.icon_component}
                            text={subroute.getTitle()}
                            onClickLink={toggleDrawer}
                        />
                    </MobileDrawer.Item>
                ))}
            </MobileDrawer.SubMenu>
        );
    };

    // eslint-disable-next-line no-unused-vars -- Kept for future restoration
    const showHelpCentre = () => {
        return (
            <MobileDrawer.Item>
                <MenuLink
                    link_to={/* TODO: add redirect to Help centre */ ''}
                    icon={<LegacyHelpCentreIcon />}
                    text={localize('Help centre')}
                    onClickLink={toggleDrawer}
                />
            </MobileDrawer.Item>
        );
    };

    // eslint-disable-next-line no-unused-vars -- Kept for future restoration
    const showResponsibleTrading = () => {
        return (
            <React.Fragment>
                <MobileDrawer.Item>
                    <MenuLink
                        link_to={/* TODO: add redirect to Responsible trading */ ''}
                        icon={<LegacyResponsibleTradingIcon />}
                        text={localize('Responsible trading')}
                        onClickLink={toggleDrawer}
                    />
                </MobileDrawer.Item>
            </React.Fragment>
        );
    };

    // eslint-disable-next-line no-unused-vars -- Kept for future restoration
    const showRegulatoryInformation = () => {
        return (
            is_logged_in &&
            should_show_regulatory_information && (
                <React.Fragment>
                    <MobileDrawer.Item>
                        <MenuLink
                            link_to={/* TODO: add redirect to Regulatory information */ ''}
                            icon={<LegacyRegulatoryInformationIcon />}
                            text={localize('Regulatory information')}
                            onClickLink={toggleDrawer}
                        />
                    </MobileDrawer.Item>
                </React.Fragment>
            )
        );
    };

    return (
        <React.Fragment>
            <a id='dt_mobile_drawer_toggle' onClick={toggleDrawer} className='header__mobile-drawer-toggle'>
                <LegacyMenuHamburger1pxIcon
                    iconSize='xs'
                    className='header__mobile-drawer-icon'
                    fill='var(--color-text-primary)'
                />
            </a>
            <MobileDrawer
                alignment='left'
                icon_class='header__menu-toggle'
                is_open={is_open}
                transitionExit={transitionExit}
                toggle={toggleDrawer}
                id='dt_mobile_drawer'
                enableApp={enableApp}
                disableApp={disableApp}
                title={<MenuTitle />}
                height='100vh'
                width='295px'
                className='pre-appstore'
            >
                <Div100vhContainer height_offset='40px'>
                    <div className='header__menu-mobile-body-wrapper'>
                        <React.Fragment>
                            <MobileDrawer.Body>
                                {is_logged_in && (
                                    <MobileDrawer.Item>
                                        <MenuLink
                                            link_to={getBrandHomeUrl()}
                                            icon={<LegacyHomeNewIcon />}
                                            text={localize('Home')}
                                            onClickLink={() => {
                                                window.open(getBrandHomeUrl(), '_blank', 'noopener,noreferrer');
                                                toggleDrawer();
                                            }}
                                        />
                                    </MobileDrawer.Item>
                                )}
                                <MobileDrawer.Item>
                                    <MenuLink
                                        link_to={routes.index}
                                        icon={<LegacyChartsIcon />}
                                        text={localize('Trade')}
                                        onClickLink={toggleDrawer}
                                    />
                                </MobileDrawer.Item>
                                {renderSubMenuFromConfig(routes.reports)}
                                <MobileDrawer.Item
                                    className='header__menu-mobile-theme'
                                    onClick={e => {
                                        e.preventDefault();
                                        toggleTheme(!is_dark_mode);
                                    }}
                                >
                                    <div className={classNames('header__menu-mobile-link')}>
                                        <LegacyTheme1pxIcon
                                            className='header__menu-mobile-link-icon'
                                            iconSize='xs'
                                            fill='var(--color-text-primary)'
                                        />
                                        <span className='header__menu-mobile-link-text'>{localize('Dark theme')}</span>
                                        <ToggleSwitch
                                            id='dt_mobile_drawer_theme_toggler'
                                            handleToggle={() => toggleTheme(!is_dark_mode)}
                                            is_enabled={is_dark_mode}
                                        />
                                    </div>
                                </MobileDrawer.Item>
                                {/* {showHelpCentre()} */}
                                {/* {showResponsibleTrading()} */}
                                {/* {showRegulatoryInformation()} */}
                                {/* {cs_chat_whatsapp && (
                                    <MobileDrawer.Item className='header__menu-mobile-whatsapp'>
                                        <WhatsApp onClick={toggleDrawer} />
                                    </MobileDrawer.Item>
                                )}
                                {cs_chat_intercom && (
                                    <MobileDrawer.Item className='header__menu-mobile-livechat'>
                                        <LiveChat />
                                    </MobileDrawer.Item>
                                )} */}
                                {is_logged_in && (
                                    <MobileDrawer.Item onClick={handleLogout}>
                                        <MenuLink icon={<LegacyLogout1pxIcon />} text={localize('Log out')} />
                                    </MobileDrawer.Item>
                                )}
                            </MobileDrawer.Body>
                            <MobileDrawer.Footer className={is_logged_in ? 'dc-mobile-drawer__footer--servertime' : ''}>
                                <ServerTime is_mobile />
                                <NetworkStatus is_mobile />
                            </MobileDrawer.Footer>
                            {is_mobile_language_menu_open && (
                                <MobileLanguageMenu expandSubMenu={setIsSubmenuExpanded} toggleDrawer={toggleDrawer} />
                            )}
                        </React.Fragment>
                    </div>
                </Div100vhContainer>
            </MobileDrawer>
        </React.Fragment>
    );
});

ToggleMenuDrawer.displayName = 'ToggleMenuDrawer';

export default ToggleMenuDrawer;
