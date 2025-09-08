import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@deriv/components';
import { redirectToSignUp } from '@deriv/shared';
import { useTranslations } from '@deriv-com/translations';

const SignupButton = ({ className }) => {
    const { localize } = useTranslations();
    return (
        <Button
            id='dt_signup_button'
            className={className}
            has_effect
            text={localize('Sign up')}
            onClick={redirectToSignUp}
            primary
        />
    );
};

SignupButton.propTypes = {
    className: PropTypes.string,
};

export { SignupButton };
