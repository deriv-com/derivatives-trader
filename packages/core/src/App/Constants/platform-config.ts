import { getPlatformName, getPlatformIcon, routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

type TPlatformConfig = {
    description: () => string;
    href?: string;
    icon: string;
    link_to?: string;
    name: string;
    title: () => string;
};

// Simplified platform config to only include trader platform
const platform_config: TPlatformConfig[] = [
    {
        icon: getPlatformIcon(),
        title: () => getPlatformName(),
        name: getPlatformName(),
        description: () => localize('A whole new trading experience on a powerful yet easy to use platform.'),
        link_to: routes.index,
    },
];

export default platform_config;
