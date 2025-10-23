/*
 * Configuration values needed in js codes
 *
 * NOTE:
 * Please use the following command to avoid accidentally committing personal changes
 * git update-index --assume-unchanged packages/shared/src/utils/config.js
 *
 */

import { getProductionPlatformHostname, getStagingPlatformHostname, getWebSocketURL } from '../brand';

export const isProduction = () => {
    const productionHostname = getProductionPlatformHostname();
    const stagingHostname = getStagingPlatformHostname();

    // Create regex patterns for both production and staging domains (with optional www prefix)
    const productionPattern = `(www\\.)?${productionHostname.replaceAll('.', '\\.')}`;
    const stagingPattern = `(www\\.)?${stagingHostname.replaceAll('.', '\\.')}`;

    // Check if current hostname matches any of the supported domains
    const supportedDomainsRegex = new RegExp(`^(${productionPattern}|${stagingPattern})$`, 'i');

    // Return true only if we're on the production hostname
    const productionRegex = new RegExp(`^${productionPattern}$`, 'i');
    return supportedDomainsRegex.test(window.location.hostname) && productionRegex.test(window.location.hostname);
};

/**
 * Gets account_type with priority: URL parameter > localStorage > default 'demo'
 * @returns 'real' or 'demo'
 */
export const getAccountType = (): 'real' | 'demo' => {
    const search = window.location.search;
    const search_params = new URLSearchParams(search);
    const accountTypeFromUrl = search_params.get('account_type');

    // First priority: URL parameter
    if (accountTypeFromUrl === 'real' || accountTypeFromUrl === 'demo') {
        window.localStorage.setItem('account_type', accountTypeFromUrl);

        // Remove account_type from URL after processing
        const url = new URL(window.location.href);
        if (url.searchParams.has('account_type')) {
            url.searchParams.delete('account_type');
            window.history.replaceState({}, document.title, url.toString());
        }

        return accountTypeFromUrl;
    }

    // Second priority: localStorage
    const storedAccountType = window.localStorage.getItem('account_type');
    if (storedAccountType === 'real' || storedAccountType === 'demo') {
        return storedAccountType;
    }

    // Default to demo when no account_type parameter or invalid value
    return 'demo';
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) {
        // Validate it's a reasonable hostname (not a full URL, no protocol)
        if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(local_storage_server_url)) {
            return local_storage_server_url;
        }
        // Clear invalid value
        window.localStorage.removeItem('config.server_url');
    }

    // Get account type
    const accountType = getAccountType();

    // Get WebSocket URL from brand config based on environment and account type
    const server_url = getWebSocketURL(isProduction(), accountType);

    return server_url;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};
