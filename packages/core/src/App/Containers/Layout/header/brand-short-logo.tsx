import React from 'react';

import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons';
import { getBrandHomeUrl } from '@deriv/shared';

const BrandShortLogo = () => {
    const handleLogoClick = () => {
        const brandUrl = getBrandHomeUrl();
        window.location.href = brandUrl;
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
