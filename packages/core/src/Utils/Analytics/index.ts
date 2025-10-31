import FIREBASE_INIT_DATA from '@deriv/api/src/remote_config.json';
import { Analytics } from '@deriv-com/analytics';
import initDatadog from 'Utils/Datadog';
import { FeatureFlags, isFeatureFlags } from '../../types/feature-flags';

/**
 * Fetches remote configuration with proper error handling and logging
 */
const fetchRemoteConfig = async (url: string): Promise<FeatureFlags> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate the response structure
        if (!isFeatureFlags(data)) {
            throw new Error('Invalid feature flags structure received from remote config');
        }

        return data;
    } catch (error) {
        // Remote config fetch failed, fall back to local config
        // This is expected during development or when remote config is unavailable
        return FIREBASE_INIT_DATA as FeatureFlags;
    }
};

export const AnalyticsInitializer = async () => {
    if (!process.env.REMOTE_CONFIG_URL) {
        return;
    }

    const flags = await fetchRemoteConfig(process.env.REMOTE_CONFIG_URL);

    // Initialize RudderStack if enabled
    if (process.env.RUDDERSTACK_KEY && flags.tracking_rudderstack) {
        const config = {
            rudderstackKey: process.env.RUDDERSTACK_KEY,
        };
        await Analytics?.initialise(config);
    }

    // Initialize DataDog if enabled (synchronous call)
    if (flags.tracking_datadog) {
        initDatadog(true);
    }
};
