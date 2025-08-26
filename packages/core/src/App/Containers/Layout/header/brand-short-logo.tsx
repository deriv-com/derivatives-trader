import React from 'react';
import { getBrandWebsiteName } from '@deriv/shared';
import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons';

const BrandShortLogo = () => {
    const brandWebsiteName = getBrandWebsiteName();

    return (
        <div className='header__menu-left-logo'>
            <a href={brandWebsiteName} target='_blank' rel='noopener noreferrer'>
                <BrandDerivLogoCoralIcon width={24} height={24} />
            </a>
        </div>
    );
};

export default BrandShortLogo;
