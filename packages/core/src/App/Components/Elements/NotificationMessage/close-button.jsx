import PropTypes from 'prop-types';
import React from 'react';
import { useTranslations } from '@deriv-com/translations';

const CloseButton = ({ onClick, className }) => {
    const { localize } = useTranslations();
    return <button className={className} type='button' onClick={onClick} aria-label={localize('Close')} />;
};

CloseButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

export default CloseButton;
