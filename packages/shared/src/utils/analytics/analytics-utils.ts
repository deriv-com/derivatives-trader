import { isMobile } from '../screen';

type ClientStore = {
    is_logged_in: boolean;
    is_virtual: boolean;
};

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
