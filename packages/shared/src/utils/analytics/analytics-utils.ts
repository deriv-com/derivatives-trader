import { isMobile } from '../screen';
import { Analytics } from '@deriv-com/analytics';

type ClientStore = {
    is_logged_in: boolean;
    is_virtual: boolean;
};

// Global store type declaration
declare global {
    interface Window {
        __deriv_store?: {
            client: ClientStore;
        };
    }
}

/**
 * Determines the account type for analytics based on client store properties
 * @param client - The client store object with is_logged_in and is_virtual properties
 * @returns 'Demo' | 'Real' | 'unlogged'
 */
export const getAnalyticsAccountType = (client?: ClientStore): 'Demo' | 'Real' | 'unlogged' => {
    if (!client || !client.is_logged_in) {
        return 'unlogged';
    }
    
    // Virtual/demo accounts
    if (client.is_virtual) {
        return 'Demo';
    }
    
    // Real money accounts (logged in but not virtual)
    return 'Real';
};

/**
 * Determines the device type for analytics
 * @returns 'Mobile' | 'Desktop'
 */
export const getAnalyticsDeviceType = (): 'Mobile' | 'Desktop' => {
    return isMobile() ? 'Mobile' : 'Desktop';
};

/**
 * Gets both account type and device type for analytics
 * @param client - The client store object with is_logged_in and is_virtual properties
 * @returns Object with account_type and device_type
 */
export const getAnalyticsData = (client?: ClientStore) => ({
    account_type: getAnalyticsAccountType(client),
    device_type: getAnalyticsDeviceType(),
});

/**
 * Centralized function to track analytics events with automatic injection of common properties
 * @param eventName - The name of the analytics event
 * @param clientOrCustomProperties - Either the client store object OR custom properties (when using global store)
 * @param customProperties - Custom properties specific to the event (when client is provided)
 * @returns void
 *
 * Usage examples:
 * - trackAnalyticsEvent('event_name', { action: 'click' }) // Uses global store
 * - trackAnalyticsEvent('event_name', client, { action: 'click' }) // Uses provided client
 * - trackAnalyticsEvent('event_name') // Uses global store with no custom properties
 */
export const trackAnalyticsEvent = (
    eventName: string,
    clientOrCustomProperties?: ClientStore | Record<string, any>,
    customProperties?: Record<string, any>
) => {
    let client: ClientStore | undefined;
    let properties: Record<string, any> = {};

    // Determine if first parameter is client object or custom properties
    if (clientOrCustomProperties && typeof clientOrCustomProperties === 'object') {
        // Check if it has client store properties
        if ('is_logged_in' in clientOrCustomProperties && 'is_virtual' in clientOrCustomProperties) {
            // It's a client object
            client = clientOrCustomProperties as ClientStore;
            properties = customProperties || {};
        } else {
            // It's custom properties, use global store for client
            client = typeof window !== 'undefined' ? window.__deriv_store?.client : undefined;
            properties = clientOrCustomProperties as Record<string, any>;
        }
    } else {
        // No parameters provided, use global store
        client = typeof window !== 'undefined' ? window.__deriv_store?.client : undefined;
        properties = {};
    }

    const commonData = getAnalyticsData(client);
    
    const eventProperties = {
        ...commonData,
        ...properties,
    };
    
    // @ts-expect-error - Analytics library types not updated yet
    Analytics.trackEvent(eventName, eventProperties);
};
