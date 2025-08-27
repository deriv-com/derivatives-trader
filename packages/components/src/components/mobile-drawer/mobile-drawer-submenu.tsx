import classNames from 'classnames';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import Text from '../text/text';
import { LegacyChevronLeft1pxIcon } from '@deriv/quill-icons';

type TMobileDrawerSubmenu = {
    has_subheader?: boolean;
    is_expanded?: boolean;
    onToggle: (params: boolean) => void;
    submenu_toggle_class?: string;
    submenu_icon?: React.ReactElement;
    submenu_title?: string | React.ReactElement;
    submenu_suffix_icon?: React.ReactElement;
    route_config_path?: string;
};

const SubMenu = ({
    children,
    has_subheader,
    onToggle,
    submenu_toggle_class,
    submenu_icon,
    submenu_title,
    submenu_suffix_icon,
    route_config_path,
    is_expanded = false,
}: React.PropsWithChildren<TMobileDrawerSubmenu>) => {
    const [is_extended, setIsExtended] = React.useState(is_expanded);

    const toggleMenu = () => {
        const should_menu_expand = !is_extended;
        setIsExtended(should_menu_expand);
        if (onToggle) {
            onToggle(should_menu_expand);
        }
    };
    return (
        <React.Fragment>
            <div className={classNames('dc-mobile-drawer__submenu-toggle', submenu_toggle_class)} onClick={toggleMenu}>
                {submenu_icon &&
                    React.cloneElement(submenu_icon, {
                        className: 'dc-mobile-drawer__submenu-toggle-icon',
                        iconSize: submenu_icon.props.iconSize || 'xs',
                        fill: submenu_icon.props.fill || 'var(--color-text-primary)',
                    })}
                {submenu_title && (
                    <Text
                        as='h3'
                        size='xs'
                        weight={
                            route_config_path && window.location.pathname.startsWith(route_config_path) ? 'bold' : ''
                        }
                    >
                        {submenu_title}
                    </Text>
                )}
                {submenu_suffix_icon &&
                    React.cloneElement(submenu_suffix_icon, {
                        className: 'dc-mobile-drawer__submenu-toggle-suffix-icon',
                        iconSize: submenu_suffix_icon.props.iconSize || 'xs',
                        fill: submenu_suffix_icon.props.fill || 'var(--color-text-primary)',
                    })}
            </div>
            <SubMenuList
                collapse={toggleMenu}
                has_subheader={has_subheader}
                is_expanded={is_extended}
                submenu_title={submenu_title}
            >
                {children}
            </SubMenuList>
        </React.Fragment>
    );
};

type TSubmenuList = {
    has_subheader?: boolean;
    submenu_title?: string | React.ReactElement;
    collapse: () => void;
    is_expanded: boolean;
};

const SubMenuList = ({
    children,
    collapse,
    has_subheader,
    is_expanded,
    submenu_title,
}: React.PropsWithChildren<TSubmenuList>) => (
    <CSSTransition
        in={is_expanded}
        classNames={{
            enter: 'dc-mobile-drawer__submenu-list--enter',
            enterDone: 'dc-mobile-drawer__submenu-list--enter-done',
            exit: 'dc-mobile-drawer__submenu-list--exit',
        }}
        timeout={250}
        unmountOnExit
    >
        <div
            className={classNames('dc-mobile-drawer__submenu-list', {
                'dc-mobile-drawer__submenu-list--has-subheader': has_subheader,
            })}
        >
            <div className='dc-mobile-drawer__submenu-list-title' onClick={collapse}>
                <div className='dc-mobile-drawer__submenu-back'>
                    <LegacyChevronLeft1pxIcon
                        className='dc-mobile-drawer__submenu-back-icon'
                        iconSize='xs'
                        fill='var(--color-text-primary)'
                    />
                </div>
                {submenu_title && (
                    <Text as='h3' weight='bold' color='primary'>
                        {submenu_title}
                    </Text>
                )}
            </div>
            {children}
        </div>
    </CSSTransition>
);

export default SubMenu;
