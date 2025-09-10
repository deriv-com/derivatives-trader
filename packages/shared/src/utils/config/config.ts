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

export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    let active_loginid_from_url;
    const search = window.location.search;
    if (search) {
        const params = new URLSearchParams(document.location.search.substring(1));
        active_loginid_from_url = params.get('acct1');
    }
    const local_storage_loginid =
        window.sessionStorage.getItem('active_loginid') || window.localStorage.getItem('active_loginid');
    const loginid = local_storage_loginid || active_loginid_from_url;
    const is_real = loginid && !/^(VRT|VRW)/.test(loginid);

    // TODO: Change this to production server when going live
    const server = is_real ? 'green' : 'blue';
    const server_url = `${server}.derivws.com`;

    return server_url;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};
