import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@deriv/components';
import { getBrandLoginUrl } from '@deriv/shared';
import { useTranslations } from '@deriv-com/translations';

interface LoginButtonV2Props {
    className?: string;
}

const LoginButtonV2 = ({ className }: LoginButtonV2Props) => {
    const { localize } = useTranslations();
    const handleLogin = () => {
        window.location.href = getBrandLoginUrl();
    };

    return (
        <Button
            id='dt_login_button_v2'
            className={className}
            has_effect
            text={localize('Log in')}
            onClick={handleLogin}
            primary
        />
    );
};

LoginButtonV2.propTypes = {
    className: PropTypes.string,
};

export { LoginButtonV2 };
