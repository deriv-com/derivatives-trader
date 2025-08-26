import React from 'react';
import { isMobile } from '@deriv/shared';
import { LegacyWarningIcon, LegacyInformationIcon, LegacyAnnouncementIcon, LegacyErrorIcon } from '@deriv/quill-icons';
import Text from '../text';
import './inline-message.scss';

const type_icon_mapper = {
    warning: { Component: LegacyWarningIcon, fill: '#FFAD3A' },
    information: { Component: LegacyInformationIcon, fill: '#2196f3' },
    announcement: { Component: LegacyAnnouncementIcon, fill: '#4bb4b3' },
    error: { Component: LegacyErrorIcon, fill: '#ec3f3f' },
};

const size_to_font_size_mapper = {
    xs: isMobile() ? 'xxxxs' : 'xxxs',
    sm: isMobile() ? 'xxxs' : 'xxs',
    md: isMobile() ? 'xxs' : 'xs',
    lg: isMobile() ? 'xs' : 's',
};

type TProps = {
    type?: keyof typeof type_icon_mapper;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    id?: string;
} & RequireAtLeastOne<{ title: React.ReactNode; message: React.ReactNode; children: React.ReactNode }>;

const InlineMessage: React.FC<React.PropsWithChildren<TProps>> = ({
    type = 'warning',
    size = 'xs',
    title,
    message,
    children,
    className,
    id,
}) => {
    const { Component: IconComponent, fill } = type_icon_mapper[type];
    const icon_size = size === 'lg' && !isMobile() ? 24 : 16;
    const font_size = size_to_font_size_mapper[size];

    return (
        <div className={`inline-message inline-message__${type} inline-message__${size} ${className}`} id={id}>
            <IconComponent
                width={icon_size}
                height={icon_size}
                fill={fill}
                className={`inline-message__icon__${size}`}
            />
            <Text size={font_size} className={`inline-message__messages inline-message__messages__${size}`}>
                {title && <strong>{title}</strong>}
                {message && <span>{message}</span>}
                {children}
            </Text>
        </div>
    );
};

export default InlineMessage;
