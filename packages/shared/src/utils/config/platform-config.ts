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

export const useOnLoadTranslation = () => {
    const [is_loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        if (!i18n.language) {
            i18n.language = getInitialLanguage();
        }
        (async () => {
            await initMoment(i18n.language);
            await setLocale(i18n.language);
        })();
        const is_english = i18n.language === 'EN';
        if (is_english) {
            setLoaded(true);
        } else {
            i18n.store.on('added', () => {
                setLoaded(true);
            });
        }
        return () => i18n.store.off('added');
    }, []);

    return [is_loaded, setLoaded];
};
