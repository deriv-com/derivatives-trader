import PropTypes from 'prop-types';
import React from 'react';

const MediaIcon = ({ id, is_enabled, enabled, disabled }) => {
    const IconComponent = is_enabled ? enabled : disabled;
    return <IconComponent id={id} className='media__icon' />;
};

MediaIcon.propTypes = {
    disabled: PropTypes.func,
    enabled: PropTypes.func,
    id: PropTypes.string,
    is_enabled: PropTypes.bool,
};

export { MediaIcon };
