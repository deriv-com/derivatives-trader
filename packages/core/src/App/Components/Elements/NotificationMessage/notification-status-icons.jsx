import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { LegacyErrorIcon } from '@deriv/quill-icons';
import { icon_types } from './constants';

const NotificationStatusIcons = ({ type, class_suffix }) => {
    // we cannot lazyload danger icon for notification message as its also meant for offline status notification
    // if danger icon is not lazyloaded and user loses internet connection, it will crash with missing chunk error
    if (type && type === 'danger') {
        return (
            <LegacyErrorIcon
                fill='var(--color-text-danger)'
                className={classNames('inline-icon', 'notification__icon-type', {
                    [`notification__icon-type--${class_suffix}`]: class_suffix,
                })}
            />
        );
    }

    if (type && icon_types[type]) {
        const IconComponent = icon_types[type].component;
        const iconFill = icon_types[type].fill;

        return (
            <IconComponent
                fill={iconFill}
                className={classNames('notification__icon-type', {
                    [`notification__icon-type--${class_suffix}`]: class_suffix,
                })}
            />
        );
    }

    return null;
};

NotificationStatusIcons.propTypes = {
    class_suffix: PropTypes.string,
    type: PropTypes.string,
};

export default NotificationStatusIcons;
