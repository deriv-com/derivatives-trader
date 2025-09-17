/*
 * Configuration values needed in js codes
 *
 * NOTE:
 * Please use the following command to avoid accidentally committing personal changes
 * git update-index --assume-unchanged packages/shared/src/utils/config.js
 *
 */

import { getProductionPlatformHostname, getStagingPlatformHostname } from '../brand';

export const isProduction = () => {
    const productionHostname = getProductionPlatformHostname();
    const stagingHostname = getStagingPlatformHostname();

    // Create regex patterns for both production and staging domains (with optional www prefix)
    const productionPattern = `(www\\.)?${productionHostname.replace('.', '\\.')}`;
    const stagingPattern = `(www\\.)?${stagingHostname.replace('.', '\\.')}`;

    // Check if current hostname matches any of the supported domains
    const supportedDomainsRegex = new RegExp(`^(${productionPattern}|${stagingPattern})$`, 'i');

    // Return true only if we're on the production hostname
    const productionRegex = new RegExp(`^${productionPattern}$`, 'i');
    return supportedDomainsRegex.test(window.location.hostname) && productionRegex.test(window.location.hostname);
};

/**
 * Parses the account_type parameter from the current URL
 * @returns {string} 'real', 'demo', or 'demo' as default
 */
export const getAccountTypeFromUrl = (): string => {
    const search = window.location.search;
    const search_params = new URLSearchParams(search);
    const accountType = search_params.get('account_type');

    // Validate account type and return 'demo' as default for invalid values
    if (accountType === 'real' || accountType === 'demo') {
        return accountType;
    }

    // Default to demo when no account_type parameter or invalid value
    return 'demo';
};

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    // Get account type from URL parameter
    const accountType = getAccountTypeFromUrl();

    // Map account type to new v2 endpoints
    const server_url = accountType === 'real' ? 'realv2.derivws.com' : 'demov2.derivws.com';

    return server_url;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};
