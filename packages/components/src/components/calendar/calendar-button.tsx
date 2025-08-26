import classNames from 'classnames';
import React from 'react';

type TButtonProps = {
    className?: string;
    icon?: React.ReactElement;
    is_disabled?: boolean;
    is_hidden?: boolean;
    label?: string;
    onClick?: React.MouseEventHandler<HTMLSpanElement>;
    secondary?: boolean;
    small?: boolean;
    text?: string;
};

const Button = ({
    children,
    className,
    is_disabled,
    is_hidden,
    icon,
    label,
    onClick,
}: React.PropsWithChildren<TButtonProps>) => (
    <React.Fragment>
        {!is_hidden && (
            <span
                className={classNames('dc-calendar__btn', className, {
                    'dc-calendar__btn--disabled': is_disabled,
                    'dc-calendar__btn--is-hidden': is_hidden,
                })}
                onClick={onClick}
            >
                {label}
                {icon &&
                    React.cloneElement(icon, {
                        'data-testid': `dt_calendar_icon`,
                        className: classNames('dc-calendar__icon', icon.props.className),
                        iconSize: icon.props.iconSize || 'xs',
                        fill: is_disabled ? 'var(--color-text-disabled)' : icon.props.fill,
                    })}
                {children}
            </span>
        )}
    </React.Fragment>
);

export default Button;
