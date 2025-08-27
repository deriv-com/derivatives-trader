import { flow } from 'mobx';

import { checkServerMaintenance, getPropertyValue, getSocketURL, State } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import WS from './ws-methods';

import ServerTime from '_common/base/server_time';
import BinarySocket from '_common/base/socket_base';

let client_store, common_store, gtm_store;
let reconnectionCounter = 1;

// TODO: update commented statements to the corresponding functions from app
const BinarySocketGeneral = (() => {
    // Removed session management variables - not needed for trading app

    let responseTimeoutErrorTimer = null;

    const onDisconnect = () => {
        clearTimeout(responseTimeoutErrorTimer);
        common_store.setIsSocketOpened(false);
    };

    const onOpen = is_ready => {
        responseTimeoutErrorTimer = setTimeout(() => {
            const expectedResponseTypes = WS?.get?.()?.expect_response_types || {};
            const pendingResponseTypes = Object.keys(expectedResponseTypes).filter(
                key => expectedResponseTypes[key].state === 'pending'
            );

            const error = new Error('deriv-api: no message received after 30s');
            error.userId = client_store?.loginid;

            window.TrackJS?.console?.error({
                message: error.message,
                clientsCountry: client_store?.clients_country,
                websocketUrl: getSocketURL(),
                pendingResponseTypes,
            });
        }, 30000);

        if (is_ready) {
            if (client_store.is_logged_in || client_store.is_logging_in) {
                WS.get()
                    .expectResponse('authorize')
                    .then(() => {
                        WS.subscribeWebsiteStatus(ResponseHandlers.websiteStatus);
                    });
            } else {
                WS.subscribeWebsiteStatus(ResponseHandlers.websiteStatus);
            }

            ServerTime.init(() => common_store.setServerTime(ServerTime.get()));
            common_store.setIsSocketOpened(true);
        }
    };

    const onMessage = response => {
        clearTimeout(responseTimeoutErrorTimer);
        handleError(response);
        // Header.hideNotification('CONNECTION_ERROR');
        switch (response.msg_type) {
            case 'authorize':
                if (response.error) {
                    const is_active_tab = sessionStorage.getItem('active_tab') === '1';
                    if (getPropertyValue(response, ['error', 'code']) === 'SelfExclusion' && is_active_tab) {
                        sessionStorage.removeItem('active_tab');
                    }

                    const hasSessionToken = !!localStorage.getItem('session_token');
                    if (hasSessionToken) {
                        return;
                    }

                    client_store.logout();
                } else if (!/authorize/.test(State.get('skip_response'))) {
                    if (response.authorize.loginid !== client_store.loginid) {
                        client_store.setLoginId(response.authorize.loginid);
                    }
                    authorizeAccount(response);
                }
                break;
            case 'payout_currencies':
                client_store.responsePayoutCurrencies(response?.payout_currencies);
                break;
            case 'transaction':
                gtm_store.pushTransactionData(response);
                if (client_store && client_store.loginid) {
                    WS.authorized.balance().then(balance_response => {
                        if (!balance_response.error) {
                            ResponseHandlers.balanceActiveAccount(balance_response);
                        }
                    });
                }
                break;
            // no default
        }
    };

    const setBalanceActiveAccount = flow(function* (obj_balance) {
        yield BinarySocket?.wait('website_status');
        client_store.setBalanceActiveAccount(obj_balance);
    });

    const handleError = response => {
        const msg_type = response.msg_type;
        const error_code = getPropertyValue(response, ['error', 'code']);
        switch (error_code) {
            case 'WrongResponse':
                if (msg_type === 'balance') {
                    WS.forgetAll('balance').then(subscribeBalances);
                }
                break;
            case 'RateLimit':
                if (msg_type !== 'cashier_password') {
                    common_store.setError(true, {
                        message: localize('You have reached the rate limit of requests per second. Please try later.'),
                    });
                }
                break;
            case 'InvalidAppID':
                common_store.setError(true, { message: response.error.message });
                break;
            case 'DisabledClient':
                common_store.setError(true, { message: response.error.message });
                break;
            case 'AuthorizationRequired': {
                if (msg_type === 'buy') {
                    return;
                }

                // For V2, check if we have a valid session token before logout
                const hasSessionToken = !!localStorage.getItem('session_token');
                if (hasSessionToken) {
                    return;
                }
                client_store.logout();
                break;
            }
            default:
                break;
        }
    };

    const init = store => {
        client_store = store.client;
        common_store = store.common;
        gtm_store = store.gtm;

        return {
            onDisconnect,
            onOpen,
            onMessage,
        };
    };

    const subscribeBalances = () => {
        if (client_store.current_account?.loginid) {
            WS.subscribeBalanceActiveAccount(
                ResponseHandlers.balanceActiveAccount,
                client_store.current_account.loginid
            );
        }
    };

    const authorizeAccount = response => {
        client_store.responseAuthorize(response);
        subscribeBalances(); // Single account balance
        WS.storage.payoutCurrencies(); // Currency configs for trading
        client_store.setIsAuthorize(true); // Set auth state
        BinarySocket.sendBuffered(); // Send queued requests
    };

    return {
        init,
        setBalanceActiveAccount,
        authorizeAccount,
    };
})();

export default BinarySocketGeneral;

const ResponseHandlers = (() => {
    const websiteStatus = response => {
        if (response.website_status) {
            const is_server_down = checkServerMaintenance(response.website_status);

            // If the site is down or updating, connect to WebSocket with an exponentially increasing delay on every attempt.
            // Requests excluding - website_status/authorize will be blocked during backoff
            // The delay starts off at approximately 1.024 seconds and grows exponentially, with a random factor between 0.5 and 2 to spread out the reconnection attempts.
            // The maximum delay is capped at 10 minutes (600k ms).
            if (is_server_down) {
                const reconnectionDelay =
                    Math.min(2 ** (reconnectionCounter + 9), 600000) * (0.5 + Math.random() * 1.5);

                window.setTimeout(() => {
                    reconnectionCounter++;
                    BinarySocket.closeAndOpenNewConnection();
                    BinarySocket.blockRequest(is_server_down);
                }, reconnectionDelay);
                // If site is up, and there was a reconnection attempted before
            } else if (!is_server_down && reconnectionCounter > 1) {
                window.location.reload();
            }

            // @deriv/deriv-api blockRequest(true) affects all API requests except website_status
            BinarySocket.blockRequest(is_server_down);
            BinarySocket.setAvailability(response.website_status.site_status);
            client_store.setWebsiteStatus(response);
        }
    };

    const balanceActiveAccount = response => {
        if (!response.error) {
            // Optimal balance extraction - only check formats that actually exist
            const balance = response.balance?.balance || response.balance;

            // Only update if we have a valid balance
            if (balance !== undefined && balance !== null && balance !== '') {
                BinarySocketGeneral.setBalanceActiveAccount({
                    balance,
                    loginid: client_store?.loginid,
                });
            }
        }
    };

    // Removed balanceOtherAccounts - not needed for single account

    return {
        websiteStatus,
        balanceActiveAccount,
    };
})();
