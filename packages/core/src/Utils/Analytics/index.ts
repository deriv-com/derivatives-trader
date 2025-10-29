import FIREBASE_INIT_DATA from '@deriv/api/src/remote_config.json';
import { Analytics } from '@deriv-com/analytics';
import initDatadog from 'Utils/Datadog';

export const AnalyticsInitializer = async () => {
    if (process.env.REMOTE_CONFIG_URL) {
        const flags = await fetch(process.env.REMOTE_CONFIG_URL)
            .then(res => res.json())
            .catch(() => FIREBASE_INIT_DATA);

        // Initialize RudderStack if enabled
        if (process.env.RUDDERSTACK_KEY && flags?.tracking_rudderstack) {
            const config = {
                rudderstackKey: process.env.RUDDERSTACK_KEY,
            };
            await Analytics?.initialise(config);
        }

        // Initialize DataDog if enabled
        if (flags?.tracking_datadog) {
            initDatadog(true);
        }
    }
};
