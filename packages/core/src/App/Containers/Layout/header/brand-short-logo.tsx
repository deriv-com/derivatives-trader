import React from 'react';

import { getBrandHomeUrl } from '@deriv/shared';

import { BrandDerivLogoCoralIcon } from 'Assets/svgs/trading-platform';
import { useMobileBridge } from 'App/Hooks/useMobileBridge';

const BrandShortLogo = () => {
    const { sendBridgeEvent } = useMobileBridge();

    const handleLogoClick = () => {
        sendBridgeEvent('trading:home', () => {
            window.location.href = getBrandHomeUrl();
        });
    };

    return (
        <div className='header__menu-left-logo'>
            <div onClick={handleLogoClick} style={{ cursor: 'pointer' }} data-testid='brand-logo-clickable'>
                <BrandDerivLogoCoralIcon width={24} height={24} />
            </div>
        </div>
    );
};

export default BrandShortLogo;
