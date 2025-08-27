import React, { HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import './status-badge.scss';

type TStatusBadgeProps = {
    account_status: string | null;
    icon: React.ReactElement;
    text: ReactNode;
    icon_size?: number;
    onClick?: () => void;
};

const StatusBadge = ({
    account_status,
    icon,
    icon_size = 11,
    text,
    className,
    onClick,
}: TStatusBadgeProps & HTMLAttributes<HTMLDivElement>) => (
    <div
        className={classNames(
            'switcher-status-badge__container',
            className,
            `switcher-status-badge__container--${account_status ?? 'failed'}`
        )}
        onClick={onClick}
        onKeyDown={onClick}
    >
        <div
            className={classNames(
                'switcher-status-badge__container--icon',
                `switcher-status-badge__container--icon--${account_status ?? 'failed'}`
            )}
        >
            {React.cloneElement(icon, {
                width: icon_size,
                height: icon_size,
                fill: icon.props.fill || 'var(--color-text-primary)',
            })}
        </div>
        {text}
    </div>
);

export default StatusBadge;
