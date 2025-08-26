import React from 'react';
import { isMobile } from '@deriv/shared';
import {
    LegacyWarningIcon,
    LegacyInformationIcon,
    LegacyErrorIcon,
    LegacyChevronRight1pxIcon,
} from '@deriv/quill-icons';
import Text from '../text';
import './side-note.scss';

const type_icon_mapper = {
    warning: { Component: LegacyWarningIcon, fill: 'var(--color-text-warning)' },
    information: { Component: LegacyInformationIcon, fill: 'var(--color-text-info)' },
    announcement: { Component: LegacyInformationIcon, fill: 'var(--color-text-success)' },
    error: { Component: LegacyErrorIcon, fill: 'var(--color-text-danger)' },
};

type TProps = {
    type?: keyof typeof type_icon_mapper;
    action?: { onClick: VoidFunction; label: React.ReactNode };
} & RequireAtLeastOne<{ title: React.ReactNode; description: React.ReactNode; children: React.ReactNode }>;

const SideNote: React.FC<React.PropsWithChildren<TProps>> = ({ title, description, type, action, children }) => {
    const title_font_size = isMobile() ? 'xxs' : 'xs';
    const content_font_size = isMobile() ? 'xxxs' : 'xxs';

    return (
        <div className='side-note'>
            <div className='side-note__content'>
                {(title || type) && (
                    <div className='side-note__header'>
                        <Text weight='bold' size={title_font_size}>
                            {title}
                        </Text>
                        {type &&
                            (() => {
                                const { Component: IconComponent, fill } = type_icon_mapper[type];
                                return <IconComponent fill={fill} />;
                            })()}
                    </div>
                )}
                {(description || children) && (
                    <Text size={content_font_size}>
                        {description && <span>{description}</span>}
                        {children}
                    </Text>
                )}
            </div>
            {action && (
                <div className='side-note__action' onClick={action?.onClick}>
                    <Text size={content_font_size} color='red'>
                        {action?.label}
                    </Text>
                    <LegacyChevronRight1pxIcon fill='var(--color-status-danger)' iconSize='xs' />
                </div>
            )}
        </div>
    );
};

export default SideNote;
