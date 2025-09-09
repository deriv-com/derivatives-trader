import React from 'react';
import { getInitialLanguage } from '@deriv-com/translations';
import i18n from 'i18next';
import { setLocale, initMoment } from '../date';
import { routes } from '../routes';
import { getDomainUrl } from '../url';

type TPlatform = {
    icon_text?: string;
    is_hard_redirect: boolean;
    platform_name: string;
    route_to_path: string;
    url?: string;
};

type TPlatforms = Record<'derivgo' | 'tradershub_os', TPlatform>;
export const tradershub_os_url =
    process.env.NODE_ENV === 'production'
        ? `https://hub.${getDomainUrl()}/tradershub`
        : `https://staging-hub.${getDomainUrl()}/tradershub`;

// TODO: This should be moved to PlatformContext
export const platforms: TPlatforms = {
    derivgo: {
        icon_text: undefined,
        is_hard_redirect: true,
        platform_name: 'Deriv GO',
        route_to_path: '',
        url: 'https://app.deriv.com/redirect/derivgo',
    },
    tradershub_os: {
        icon_text: undefined,
        is_hard_redirect: true,
        platform_name: 'TradersHub',
        route_to_path: '',
        url: tradershub_os_url,
    },
};
