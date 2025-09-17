import FIREBASE_INIT_DATA from '@deriv/api/src/remote_config.json';
import { Analytics } from '@deriv-com/analytics';

export const AnalyticsInitializer = async () => {
    if (process.env.REMOTE_CONFIG_URL) {
        const flags = await fetch(process.env.REMOTE_CONFIG_URL)
            .then(res => res.json())
            .catch(() => FIREBASE_INIT_DATA);
        if (process.env.RUDDERSTACK_KEY && flags?.tracking_rudderstack) {
            const config = {
                rudderstackKey: process.env.RUDDERSTACK_KEY,
            };
            await Analytics?.initialise(config);
        }
    }
};
