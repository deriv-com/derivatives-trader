import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { getKebabCase } from '@deriv/shared';

import Counter from '../counter';

// Custom hook to safely use location in both routed and non-routed contexts
const useSafeLocation = () => {
    try {
        return useLocation();
    } catch {
        // Return a default location object when not in Router context
        return { search: '' };
    }
};

export type THeaderIcon = {
    icon: React.ReactElement;
    is_active: boolean;
};

export type THeader = {
    text: string;
    path?: string;
};

export type TItem = {
    component?: JSX.Element | null;
    count?: number;
    default?: boolean;
    getTitle?: () => string;
    has_side_note?: boolean;
    icon?: React.ReactElement;
    is_hidden?: boolean;
    is_disabled?: boolean;
    key?: string;
    label?: string;
    path?: string;
    subitems?: number[];
    title?: string;
    value?: typeof React.Component;
};
type TVerticalTabHeader = {
    className?: string;
    is_floating?: boolean;
    is_routed?: boolean;
    item: TItem;
    onChange: (item: TItem) => void;
    selected: TItem;
    selectedKey: string;
};

const HeaderIcon = ({ icon, is_active }: THeaderIcon) =>
    React.cloneElement(icon, {
        className: classNames('dc-vertical-tab__header__icon', {
            'dc-vertical-tab__header__icon--active': is_active,
        }),
        iconSize: icon.props.iconSize || 'xs',
        fill: icon.props.fille || 'var(--color-text-primary)',
    });

const Header = ({ text, path }: THeader) => (
    <div className='dc-vertical-tab__header__link' id={path}>
        {text}
    </div>
);

const VerticalTabHeader = ({
    children,
    className,
    is_floating,
    is_routed,
    item,
    onChange,
    selected,
    selectedKey = 'label',
}: React.PropsWithChildren<TVerticalTabHeader>) => {
    const location = useSafeLocation();
    const label = item.label || item.title || item.getTitle?.() || '';
    const is_active = selected && selected[selectedKey as keyof TItem] === item[selectedKey as keyof TItem];
    const handleClick = () => onChange(item);
    const id = `dc_${getKebabCase(label)}_link`;
    const is_disabled = !!item.is_disabled;
    const is_hidden = !!item.is_hidden;
    const count = item.count || 0;

    // Preserve query parameters when navigating between tabs
    const getNavigationPath = () => {
        if (!item.path) return '';
        return location.search ? `${item.path}${location.search}` : item.path;
    };

    if (is_hidden) return null;

    return is_routed ? (
        <NavLink
            id={id}
            to={getNavigationPath()}
            onClick={handleClick}
            className={classNames('dc-vertical-tab__header', {
                'dc-vertical-tab__header--disabled': is_disabled,
                'dc-vertical-tab__header--floating': is_floating,
            })}
            activeClassName={classNames(className, {
                'dc-vertical-tab__header--active': is_active,
            })}
        >
            {item.icon && <HeaderIcon icon={item.icon} is_active={is_active} />}
            <Header text={label} path={item.path} />
            {!!count && <Counter count={count} className='dc-vertical-tab__header__counter' />}
            {children}
        </NavLink>
    ) : (
        <div
            id={id}
            className={classNames('dc-vertical-tab__header', className, {
                'dc-vertical-tab__header--active': is_active,
                'dc-vertical-tab__header--disabled': is_disabled,
            })}
            onClick={handleClick}
        >
            {item.icon && <HeaderIcon icon={item.icon} is_active={is_active} />}
            <Header text={label} />
            {children}
            <>{item.component}</>
        </div>
    );
};

export default VerticalTabHeader;
