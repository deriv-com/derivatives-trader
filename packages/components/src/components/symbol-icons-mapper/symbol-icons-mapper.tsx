import React from 'react';

import { marketIcons } from '@deriv/shared';

type TSymbolIconsMapper = {
    symbol: string;
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    width?: number;
    height?: number;
};

const SymbolIconsMapper = ({ symbol, iconSize = 'md', width, height }: TSymbolIconsMapper) => {
    const IconComponent = marketIcons[symbol as keyof typeof marketIcons];
    return IconComponent ? <IconComponent iconSize={iconSize} width={width} height={height} /> : null;
};

export default SymbolIconsMapper;
