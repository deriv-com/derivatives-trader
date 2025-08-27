import React from 'react';

import { tradeTypeIcons } from '@deriv/shared';

type TTradeTypeIconsMapper = {
    icon: string;
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    color?: string;
};

const TradeTypeIconsMapper = ({ icon, iconSize = 'xs', className, color }: TTradeTypeIconsMapper) => {
    const IconComponent = tradeTypeIcons[icon as keyof typeof tradeTypeIcons];

    if (!IconComponent) return null;

    // Convert iconSize to width/height for all icons
    const getIconDimensions = (size: string) => {
        const sizeMap = {
            xs: 16,
            sm: 24,
            md: 32,
            lg: 48,
            xl: 64,
            '2xl': 96,
        };
        return sizeMap[size as keyof typeof sizeMap] || 16;
    };

    const dimensions = getIconDimensions(iconSize);

    return React.cloneElement(<IconComponent />, {
        width: dimensions,
        height: dimensions,
        className,
        fill: color,
    });
};

export default TradeTypeIconsMapper;
