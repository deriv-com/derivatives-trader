import Cookies from 'js-cookie';

import FIREBASE_INIT_DATA from '@deriv/api/src/remote_config.json';
import { getAppId, LocalStore } from '@deriv/shared';
import { getLanguage } from '@deriv/translations';
import { Analytics } from '@deriv-com/analytics';
import { CountryUtils } from '@deriv-com/utils';

import { MAX_MOBILE_WIDTH } from '../../Constants';

export const AnalyticsInitializer = async () => {
    if (process.env.REMOTE_CONFIG_URL) {
        const flags = await fetch(process.env.REMOTE_CONFIG_URL)
            .then(res => res.json())
            .catch(() => FIREBASE_INIT_DATA);
        if (process.env.RUDDERSTACK_KEY && flags?.tracking_rudderstack) {
            const client_information = JSON.parse(Cookies.get('client_information') || 'null');
            const account_type = client_information?.loginid?.match(/[a-zA-Z]+/g)?.join('');
            const ppc_campaign_cookies =
                JSON.parse(Cookies.get('utm_data') || 'null') === 'null'
                    ? {
                          utm_source: 'no source',
                          utm_medium: 'no medium',
                          utm_campaign: 'no campaign',
                          utm_content: 'no content',
                      }
                    : JSON.parse(Cookies.get('utm_data') || 'null');

            const config = {
                growthbookKey: flags.marketing_growthbook ? process.env.GROWTHBOOK_CLIENT_KEY : undefined,
                growthbookDecryptionKey: flags.marketing_growthbook ? process.env.GROWTHBOOK_DECRYPTION_KEY : undefined,
                rudderstackKey: process.env.RUDDERSTACK_KEY,

                growthbookOptions: {
                    attributes: {
                        loggedIn: !!client_information,
                        account_type: account_type === 'null' ? 'unlogged' : account_type,
                        app_id: String(getAppId()),
                        device_type: window.innerWidth <= MAX_MOBILE_WIDTH ? 'mobile' : 'desktop',
                        device_language: navigator?.language || 'en-EN',
                        user_language: getLanguage().toLowerCase(),
                        country: await CountryUtils.getCountry(),
                        utm_source: ppc_campaign_cookies?.utm_source,
                        utm_medium: ppc_campaign_cookies?.utm_medium,
                        utm_campaign: ppc_campaign_cookies?.utm_campaign,
                        utm_content: ppc_campaign_cookies?.utm_content,
                        domain: window.location.hostname,
                        url: window.location.href,
                        network_type: navigator.connection?.effectiveType,
                        network_rtt: navigator.connection?.rtt,
                        network_downlink: navigator.connection?.downlink,
                        user_id: localStorage.getItem('active_user_id') || '',
                        residence_country: client_information?.residence,
                    },
                },
            };
            await Analytics?.initialise(config);
        }
    }
};
