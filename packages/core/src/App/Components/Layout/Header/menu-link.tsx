import React from 'react';
import classNames from 'classnames';
import { Text } from '@deriv/components';
import { routes, getStaticUrl } from '@deriv/shared';
import { isExternalLink } from '@deriv/utils';
import { observer } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { BinaryLink } from 'App/Components/Routes';
import * as QuillIcons from '@deriv/quill-icons';

type TMenuLink = {
    data_testid: string;
    icon: React.ComponentType<any>;
    is_active: boolean;
    is_disabled: boolean;
    is_hidden: boolean;
    link_to: string;
    onClickLink: () => void;
    suffix_icon: React.ComponentType<any>;
    text: React.ReactNode;
};

const MenuLink = observer(
    ({
        data_testid,
        icon,
        is_active,
        is_disabled,
        is_hidden,
        link_to = '',
        onClickLink,
        suffix_icon,
        text,
    }: Partial<TMenuLink>) => {
        const is_trade_text = text === localize('Trade');
        const deriv_static_url = getStaticUrl(link_to);
        const is_external_link = deriv_static_url && isExternalLink(link_to);

        const renderIcon = (IconComponent: React.ComponentType<any> | undefined, className: string) => {
            if (!IconComponent) return null;
            return <IconComponent className={className} iconSize='sm' />;
        };

        if (is_hidden) return null;

        if (!link_to) {
            return (
                <div
                    className={classNames('header__menu-mobile-link', {
                        'header__menu-mobile-link--disabled': is_disabled,
                    })}
                    data-testid={data_testid}
                >
                    {renderIcon(icon, 'header__menu-mobile-link-icon')}
                    <span className='header__menu-mobile-link-text'>{text}</span>
                    {renderIcon(suffix_icon, 'header__menu-mobile-link-suffix-icon')}
                </div>
            );
        } else if (is_external_link) {
            return (
                <a
                    className={classNames('header__menu-mobile-link', {
                        'header__menu-mobile-link--disabled': is_disabled,
                        'header__menu-mobile-link--active': is_active,
                    })}
                    href={link_to}
                    data-testid={data_testid}
                >
                    {renderIcon(icon, 'header__menu-mobile-link-icon')}
                    <Text
                        className={is_trade_text ? '' : 'header__menu-mobile-link-text'}
                        as='h3'
                        size='xs'
                        weight={window.location.pathname === routes.index && is_trade_text ? 'bold' : undefined}
                    >
                        {text}
                    </Text>
                    {renderIcon(suffix_icon, 'header__menu-mobile-link-suffix-icon')}
                </a>
            );
        }

        return (
            <BinaryLink
                to={link_to}
                className={classNames('header__menu-mobile-link', {
                    'header__menu-mobile-link--disabled': is_disabled,
                    'header__menu-mobile-link--active': is_active,
                })}
                onClick={onClickLink}
                data-testid={data_testid}
            >
                {renderIcon(icon, 'header__menu-mobile-link-icon')}
                <Text
                    className={is_trade_text ? '' : 'header__menu-mobile-link-text'}
                    as='h3'
                    size='xs'
                    weight={window.location.pathname === routes.index && is_trade_text ? 'bold' : undefined}
                >
                    {text}
                </Text>
                {renderIcon(suffix_icon, 'header__menu-mobile-link-suffix-icon')}
            </BinaryLink>
        );
    }
);

export default MenuLink;
