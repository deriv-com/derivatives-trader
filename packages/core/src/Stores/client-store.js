import Cookies from 'js-cookie';
import { action, computed, makeObservable, observable, reaction, runInAction, when } from 'mobx';
import moment from 'moment';

import {
    deriv_urls,
    filterUrlQuery,
    getAppId,
    isCryptocurrency,
    isMobile,
    LocalStore,
    redirectToLogin,
    removeCookies,
    routes,
    SessionStore,
    setCurrencies,
    urlForLanguage,
} from '@deriv/shared';
import { getInitialLanguage, localize } from '@deriv-com/translations';
import { Analytics } from '@deriv-com/analytics';
import { CountryUtils } from '@deriv-com/utils';

import { requestLogout, WS } from 'Services';
import BinarySocketGeneral from 'Services/socket-general';

import { getClientAccountType } from './Helpers/client';
import { buildCurrenciesList } from './Modules/Trading/Helpers/currency';
import BaseStore from './base-store';

import BinarySocket from '_common/base/socket_base';
import { getRegion, isEuCountry, isMultipliersOnly, isOptionsBlocked } from '_common/utility';

const LANGUAGE_KEY = 'i18n_language';
const storage_key = 'current_account';
const store_name = 'client_store';

export default class ClientStore extends BaseStore {
    loginid;
    preferred_language;
    email;
    user_id;

    current_account = null;
    initialized_broadcast = false;
    is_authorize = false;
    is_logging_in = false;
    is_client_store_initialized = false;
    has_logged_out = false;
    should_redirect_user_to_login = false;
    is_new_session = false;

    currencies_list = {};
    selected_currency = '';
    website_status = {};

    has_cookie_account = false;

    constructor(root_store) {
        const local_storage_properties = [];
        super({ root_store, local_storage_properties, store_name });

        makeObservable(this, {
            loginid: observable,
            preferred_language: observable,
            email: observable,
            user_id: observable,
            current_account: observable,
            initialized_broadcast: observable,
            currencies_list: observable,
            selected_currency: observable,
            is_authorize: observable,
            is_logging_in: observable,
            is_client_store_initialized: observable,
            has_logged_out: observable,
            should_redirect_user_to_login: observable,
            website_status: observable,
            has_cookie_account: observable,
            is_new_session: observable,

            balance: computed,
            currency: computed,
            is_virtual: computed,
            is_eu: computed,
            is_logged_in: computed,
            account_type: computed,
            default_currency: computed,
            residence: computed,
            email_address: computed,
            landing_company_shortcode: computed,

            is_cr_account: computed,
            is_mf_account: computed,
            clients_country: computed,
            is_eu_country: computed,
            is_options_blocked: computed,
            is_multipliers_only: computed,

            has_active_real_account: computed,
            has_any_real_account: computed,
            has_wallet: computed,
            is_single_currency: computed,

            setPreferredLanguage: action.bound,
            setCookieAccount: action.bound,
            responsePayoutCurrencies: action.bound,
            responseAuthorize: action.bound,
            setWebsiteStatus: action.bound,
            setLoginId: action.bound,
            setIsAuthorize: action.bound,
            setIsLoggingIn: action.bound,
            setBalanceActiveAccount: action.bound,
            selectCurrency: action.bound,
            setEmail: action.bound,
            setInitialized: action.bound,
            setIsClientStoreInitialized: action.bound,
            cleanUp: action.bound,
            logout: action.bound,
            setLogout: action.bound,
            setShouldRedirectToLogin: action.bound,
            getToken: action.bound,
            init: action.bound,
            responseWebsiteStatus: action.bound,
            resetVirtualBalance: action.bound,
            authenticateV2: action.bound,
            storeSessionToken: action.bound,
            getSessionToken: action.bound,
            clearSessionToken: action.bound,
            removeTokenFromUrl: action.bound,
            is_crypto: action.bound,
        });

        reaction(
            () => [this.is_logged_in, this.loginid, this.email, this.currency, this.preferred_language],
            () => {
                this.setCookieAccount();
            }
        );

        when(
            () => !this.is_logged_in && this.root_store.ui && this.root_store.ui.is_real_acc_signup_on,
            () => this.root_store.ui.closeRealAccountSignup()
        );
    }

    get balance() {
        return this.current_account?.balance?.toString() || undefined;
    }

    get has_active_real_account() {
        return !this.is_virtual;
    }

    get has_any_real_account() {
        return !this.is_virtual;
    }

    get has_wallet() {
        return false; // Simplified for trading app
    }

    get currency() {
        if (this.selected_currency.length) {
            return this.selected_currency;
        }
        return this.current_account?.currency || this.default_currency;
    }

    is_crypto(currency) {
        return isCryptocurrency(currency || this.currency);
    }

    get default_currency() {
        if (Object.keys(this.currencies_list).length > 0) {
            const keys = Object.keys(this.currencies_list);
            if (this.currencies_list[localize('Fiat')]?.length < 1) return 'USD';
            return Object.values(this.currencies_list[`${keys[0]}`])[0].text;
        }
        return 'USD';
    }

    get is_logged_in() {
        const hasSessionToken = !!this.getSessionToken();
        const hasCurrentAccountLoginId = !!this.current_account?.loginid;
        const hasLoginId = !!this.loginid;
        return hasSessionToken && hasCurrentAccountLoginId && hasLoginId;
    }

    get is_virtual() {
        return !!this.current_account?.is_virtual;
    }

    get is_eu() {
        return this.landing_company_shortcode === 'maltainvest';
    }

    get account_type() {
        return getClientAccountType(this.loginid);
    }

    get residence() {
        return this.current_account?.residence || '';
    }

    get email_address() {
        return this.current_account?.email || '';
    }

    get landing_company_shortcode() {
        return this.current_account?.landing_company_shortcode || '';
    }

    get is_cr_account() {
        return this.loginid?.startsWith('CR');
    }

    get is_mf_account() {
        return this.loginid?.startsWith('MF');
    }

    get clients_country() {
        return this.website_status?.clients_country;
    }

    get is_eu_country() {
        const country = this.website_status.clients_country;
        if (country) return isEuCountry(country);
        return false;
    }

    get is_options_blocked() {
        return isOptionsBlocked(this.residence);
    }

    get is_multipliers_only() {
        return isMultipliersOnly(this.residence);
    }

    get is_single_currency() {
        return true; // Simplified for single account
    }

    setIsAuthorize(value) {
        this.is_authorize = value;
    }

    setPreferredLanguage = lang => {
        this.preferred_language = lang;
        LocalStore.setObject(LANGUAGE_KEY, lang);
    };

    setCookieAccount() {
        const domain = /deriv\.(com|me|be)/.test(window.location.hostname)
            ? deriv_urls.DERIV_HOST_NAME
            : window.location.hostname;

        const { loginid, landing_company_shortcode, currency, preferred_language, user_id } = this;
        const email = this.email;
        const residence = this.residence;

        if (loginid && email) {
            const client_information = {
                loginid,
                email,
                landing_company_shortcode,
                currency,
                residence,
                preferred_language,
                user_id,
            };
            Cookies.set('region', getRegion(landing_company_shortcode, residence), { domain });
            Cookies.set('client_information', client_information, { domain });
            this.has_cookie_account = true;
        } else {
            removeCookies('region', 'client_information');
            this.has_cookie_account = false;
        }
    }

    responsePayoutCurrencies(response) {
        const list = response?.payout_currencies || response;
        this.currencies_list = buildCurrenciesList(Array.isArray(list) ? list : []);
        this.selectCurrency('');
    }

    responseAuthorize(response) {
        const { authorize } = response;

        runInAction(() => {
            this.current_account = {
                loginid: authorize.loginid,
                balance: authorize.balance,
                currency: authorize.currency,
                is_virtual: authorize.is_virtual,
                email: authorize.email || '',
                landing_company_shortcode: authorize.landing_company_name || '',
                residence: authorize.country || '',
                session_token: this.getSessionToken(),
                session_start: parseInt(moment().utc().valueOf() / 1000),
            };

            this.setLoginId(authorize.loginid);
        });

        this.user_id = authorize.user_id || '';
        if (this.user_id) {
            localStorage.setItem('active_user_id', this.user_id);
        }

        // Store current account
        localStorage.setItem(storage_key, JSON.stringify(this.current_account));
    }

    setWebsiteStatus(response) {
        this.website_status = response.website_status;
        this.responseWebsiteStatus(response);
        setCurrencies(this.website_status);

        // TODO: remove the below lines after full smartcharts v2 launch.
        const domain = /deriv\.(com|me)/.test(window.location.hostname)
            ? deriv_urls.DERIV_HOST_NAME
            : window.location.hostname;
        const { clients_country } = this.website_status;

        const options = {
            domain,
            expires: 7,
        };

        try {
            const cookie = Cookies.get('website_status') ? JSON.parse(Cookies.get('website_status')) : {};
            cookie.clients_country = clients_country;
            Cookies.set('website_status', cookie, options);
        } catch (e) {
            Cookies.set('website_status', { clients_country }, options);
        }
    }

    async resetVirtualBalance() {
        this.root_store.notifications.removeNotificationByKey({ key: 'reset_virtual_balance' });
        this.root_store.notifications.removeNotificationMessage({
            key: 'reset_virtual_balance',
            should_show_again: true,
        });
        await WS.authorized.topupVirtual();
    }

    isAccountOfType = type => {
        const client_account_type = getClientAccountType(this.loginid);
        return (
            (type === 'virtual' && client_account_type === 'virtual') ||
            (type === 'real' && client_account_type !== 'virtual') ||
            type === client_account_type
        );
    };

    async init() {
        let search = '';
        try {
            search = SessionStore?.get?.('signup_query_param') || window?.location?.search || '';
        } catch (error) {
            search = '';
        }

        const search_params = new URLSearchParams(search);
        const redirect_url = search_params?.get('redirect_url');
        const action_param = search_params?.get('action');
        const loginid_param = search_params?.get('loginid');

        if (!window.location.pathname.endsWith(routes.index) && /chart_type|interval|symbol|trade_type/.test(search)) {
            window.history.replaceState({}, document.title, routes.index + search);
        }

        const urlParams = new URLSearchParams(search);
        const oneTimeToken = urlParams.get('token');
        const existingSessionToken = this.getSessionToken();

        let authorize_response;

        if (existingSessionToken) {
            authorize_response = await this.authenticateV2(null);
        } else if (oneTimeToken) {
            authorize_response = await this.authenticateV2(oneTimeToken);
        } else {
            // No authentication available - continue with logged-out state
            authorize_response = null;
        }

        // Handle authentication errors
        if (authorize_response?.error) {
            await this.logout();
            this.root_store.common.setError(true, {
                header: authorize_response.error.message,
                code: authorize_response.error.code,
                message: localize('Please Log in'),
                should_show_refresh: false,
                redirect_label: localize('Log in'),
                redirectOnClick: () => {
                    redirectToLogin();
                },
            });
            this.setIsLoggingIn(false);
            this.setInitialized(false);
            return false;
        }

        // Handle special action parameters and user_id for both logged-in and logged-out states
        if (
            ['crypto_transactions_withdraw', 'payment_withdraw', 'payment_agent_withdraw'].includes(action_param) &&
            loginid_param
        ) {
            this.setLoginId(loginid_param);
        } else {
            this.setLoginId(window.sessionStorage.getItem('active_loginid') || LocalStore.get('active_loginid'));
        }

        this.user_id = LocalStore.get('active_user_id');

        // Load current account from localStorage if not already set by authenticateV2
        if (!this.current_account) {
            const stored_account = LocalStore.getObject(storage_key);
            if (stored_account) {
                this.current_account = stored_account;
            }
        }

        // Process successful authentication
        if (authorize_response) {
            // Ensure loginid is set from the authorize response
            this.setLoginId(authorize_response.authorize.loginid);

            BinarySocketGeneral.authorizeAccount(authorize_response);
            Analytics.identifyEvent(this.user_id);

            await this.root_store.gtm.pushDataLayer({
                event: 'login',
            });
        }

        // Handle redirect and language settings for successful authentication
        if (authorize_response) {
            if (redirect_url) {
                const redirect_route = routes[redirect_url].length > 1 ? routes[redirect_url] : '';
                const has_action = [
                    'crypto_transactions_withdraw',
                    'payment_agent_withdraw',
                    'payment_withdraw',
                    'reset_password',
                ].includes(action_param);

                if (has_action) {
                    const query_string = filterUrlQuery(search, ['platform', 'code', 'action', 'loginid']);
                    window.location.replace(`${redirect_route}/redirect?${query_string}`);
                } else {
                    window.location.replace(`${redirect_route}/?${filterUrlQuery(search, ['platform', 'lang'])}`);
                }
            }

            const language = authorize_response.authorize.preferred_language || getInitialLanguage();
            const stored_language_without_double_quotes = LocalStore.get(LANGUAGE_KEY).replace(/"/g, '');
            if (stored_language_without_double_quotes && language !== stored_language_without_double_quotes) {
                window.history.replaceState({}, document.title, urlForLanguage(language));
                await this.root_store.common.changeSelectedLanguage(language);
            }
        }

        this.selectCurrency('');

        if (this.is_logged_in) {
            this.responsePayoutCurrencies(await WS.authorized.payoutCurrencies());
        } else {
            // For logged-out state, get payout currencies without authorization
            this.responsePayoutCurrencies(await WS.payoutCurrencies());
        }

        // Simplified initialization - no account settings needed for trading
        this.responseWebsiteStatus(await WS.wait('website_status'));

        this.setIsLoggingIn(false);
        this.setInitialized(true);

        // Clean up URL parameters
        if (action_param === 'signup') {
            const filteredQuery = filterUrlQuery(search, ['lang']);
            history.replaceState(
                null,
                null,
                window.location.href.replace(`${search}`, filteredQuery === '' ? '' : `?${filteredQuery}`)
            );
        }

        this.setIsClientStoreInitialized();

        // Ensure balance subscription is active
        if (this.is_logged_in && this.loginid) {
            setTimeout(() => {
                import('../Services/socket-general').then(({ default: BinarySocketGeneral }) => {
                    if (BinarySocketGeneral.ensureBalanceSubscription) {
                        BinarySocketGeneral.ensureBalanceSubscription();
                    }
                });
            }, 200);
        }

        return true;
    }

    responseWebsiteStatus(response) {
        this.website_status = response.website_status;
    }

    setLoginId(loginid) {
        this.loginid = loginid;
    }

    getToken() {
        return this.getSessionToken();
    }

    async getAnalyticsConfig(isLoggedOut = false) {
        const broker = this.loginid?.match(/[a-zA-Z]+/g)?.join('');

        const ppc_campaign_cookies =
            Cookies.getJSON('utm_data') === 'null'
                ? {
                      utm_source: 'no source',
                      utm_medium: 'no medium',
                      utm_campaign: 'no campaign',
                      utm_content: 'no content',
                  }
                : Cookies.getJSON('utm_data');

        const residence_country = !isLoggedOut ? this.residence : '';
        const login_status = !isLoggedOut && this.is_logged_in;

        return {
            loggedIn: login_status,
            account_type: broker === 'null' ? 'unlogged' : broker,
            residence_country,
            app_id: String(getAppId()),
            device_type: isMobile() ? 'mobile' : 'desktop',
            language: getInitialLanguage(),
            device_language: navigator?.language || 'en-EN',
            user_language: getInitialLanguage().toLowerCase(),
            country: await CountryUtils.getCountry(),
            utm_source: ppc_campaign_cookies?.utm_source,
            utm_medium: ppc_campaign_cookies?.utm_medium,
            utm_campaign: ppc_campaign_cookies?.utm_campaign,
            utm_content: ppc_campaign_cookies?.utm_content,
            domain: window.location.hostname,
            url: window.location.href,
        };
    }

    setIsLoggingIn(bool) {
        this.is_logging_in = bool;
    }

    setBalanceActiveAccount(obj_balance) {
        if (!obj_balance || typeof obj_balance.balance === 'undefined') {
            return;
        }

        if (this.current_account && obj_balance.loginid === this.current_account.loginid) {
            this.current_account.balance = obj_balance.balance;

            // Handle virtual account notifications
            if (this.current_account.is_virtual) {
                this.root_store.notifications.resetVirtualBalanceNotification(this.current_account.loginid);
            }

            // Update localStorage
            localStorage.setItem(storage_key, JSON.stringify(this.current_account));
        }
    }

    selectCurrency(value) {
        this.selected_currency = value;
    }

    setEmail(email) {
        if (this.current_account) {
            this.current_account.email = email;
            this.email = email;
        }
    }

    setIsClientStoreInitialized() {
        this.is_client_store_initialized = true;
    }

    setInitialized(is_initialized) {
        this.initialized_broadcast = is_initialized;
    }

    async cleanUp() {
        const hasSessionToken = !!this.getSessionToken();
        if (hasSessionToken) {
            return;
        }

        // Clean up notifications
        const notification_messages = LocalStore.getObject('notification_messages');
        if (notification_messages && this.loginid) {
            delete notification_messages[this.loginid];
            LocalStore.setObject('notification_messages', { ...notification_messages });
        }

        // Update analytics
        const analytics_config = await this.getAnalyticsConfig(true);
        Analytics.setAttributes(analytics_config);

        this.root_store.gtm.pushDataLayer({ event: 'log_out' });

        // Reset state
        this.loginid = null;
        this.user_id = null;
        this.current_account = null;

        LocalStore.set('marked_notifications', JSON.stringify([]));
        localStorage.setItem('active_loginid', this.loginid);
        sessionStorage.removeItem('active_loginid');
        localStorage.setItem('active_user_id', this.user_id);
        localStorage.setItem(storage_key, JSON.stringify(this.current_account));

        Analytics.reset();

        runInAction(async () => {
            this.responsePayoutCurrencies(await WS.payoutCurrencies());
        });
        this.root_store.notifications.removeAllNotificationMessages(true);
    }

    setShouldRedirectToLogin(should_redirect_user_to_login) {
        this.should_redirect_user_to_login = should_redirect_user_to_login;
    }

    async logout() {
        // TODO: [add-client-action] - Move logout functionality to client store
        const response = await requestLogout();

        if (response?.logout === 1) {
            await this.cleanUp();
            this.setLogout(true);
        }

        return response;
    }

    setLogout(is_logged_out) {
        this.has_logged_out = is_logged_out;
        if (this.root_store.common.has_error) this.root_store.common.setError(false, null);
    }

    // V2 Authentication Method
    async authenticateV2(oneTimeToken) {
        try {
            this.setIsLoggingIn(true);

            let sessionToken = this.getSessionToken();

            // If we don't have a session token but we have a one-time token, exchange it
            if (!sessionToken && oneTimeToken) {
                // Remove the one-time token from URL immediately
                this.removeTokenFromUrl();

                const sessionResponse = await WS.getSessionToken(oneTimeToken);

                if (sessionResponse.error) {
                    return {
                        error: {
                            code: 'TokenExchangeError',
                            message: sessionResponse.error.message,
                        },
                    };
                }

                sessionToken = sessionResponse.get_session_token.token;
                this.storeSessionToken(sessionToken);
            } else if (!sessionToken) {
                return {
                    error: {
                        code: 'NoSessionToken',
                        message: 'No valid session token available',
                    },
                };
            }

            // Authorize with session token
            const authorizeResponse = await BinarySocket.authorize(sessionToken);

            if (authorizeResponse.error) {
                this.clearSessionToken();
                return authorizeResponse;
            }

            // Process successful authorization
            const { authorize } = authorizeResponse;
            const loginid = authorize.loginid;

            // Store session info in localStorage
            localStorage.setItem('active_loginid', loginid);
            sessionStorage.setItem('active_loginid', loginid);

            // Process authorization response - this will set current_account with runInAction
            this.responseAuthorize(authorizeResponse);

            this.setIsLoggingIn(false);
            return authorizeResponse;
        } catch (error) {
            this.setIsLoggingIn(false);

            return {
                error: {
                    code: 'UnexpectedAuthError',
                    message: error.message || 'Unexpected authentication error',
                },
            };
        }
    }

    storeSessionToken(token) {
        if (token) {
            localStorage.setItem('session_token', token);
        }
    }

    getSessionToken() {
        return localStorage.getItem('session_token');
    }

    clearSessionToken() {
        localStorage.removeItem('session_token');
    }

    removeTokenFromUrl() {
        const url = new URL(window.location.href);
        if (url.searchParams.has('token')) {
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.toString());
        }
    }
}
