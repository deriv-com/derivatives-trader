import React from 'react';

import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons';
import { getBrandHomeUrl } from '@deriv/shared';
import { useDevice } from '@deriv-com/ui';

const BrandShortLogo = () => {
    const { isDesktop } = useDevice();

    const handleLogoClick = () => {
        // Check if we're in a mobile environment with Flutter channel available
        if (!isDesktop && window.DerivAppChannel) {
            // Use Flutter channel postMessage for mobile
            window.DerivAppChannel.postMessage(JSON.stringify({ event: 'trading:home' }));
        } else {
            // Fallback to default behavior for desktop or when Flutter channel is not available
            const brandUrl = getBrandHomeUrl();
            window.location.href = brandUrl;
        }
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
