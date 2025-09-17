import React from 'react';
import { getBrandDomain } from '@deriv/shared';
import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons';

const BrandShortLogo = () => {
    const brandDomain = getBrandDomain();

    return (
        <div className='header__menu-left-logo'>
            <a href={`https://${brandDomain}`} target='_blank' rel='noopener noreferrer'>
                <BrandDerivLogoCoralIcon width={24} height={24} />
            </a>
        </div>
    );
};

export default BrandShortLogo;
