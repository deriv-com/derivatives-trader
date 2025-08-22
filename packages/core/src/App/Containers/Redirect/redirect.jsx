import { useEffect, useState } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

import { getBrandUrl, getDomainName, redirectToLogin, routes, SessionStore } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Chat } from '@deriv/utils';
import { Analytics } from '@deriv-com/analytics';

import { WS } from 'Services';

const Redirect = observer(() => {
    const history = useHistory();
    const { client, ui } = useStore();
    const [queryCurrency, setQueryCurrency] = useState('USD');

    const {
        authorize_accounts_list,
        currency,
        has_wallet,
        is_logged_in,
        is_logging_in,
        setNewEmail,
        setVerificationCode,
        verification_code,
        setPreventRedirectToHub,
        switchAccount,
        is_client_store_initialized,
    } = client;

    const {
        openRealAccountSignup,
        setResetTradingPasswordModalOpen,
        setRedirectFromEmail,
        toggleResetPasswordModal,
        toggleResetEmailModal,
        toggleUpdateEmailModal,
        is_mobile,
    } = ui;

    const url_query_string = window.location.search;
    const url_params = new URLSearchParams(url_query_string);
    let redirected_to_route = false;

    // TODO: remove this after oauth2 migration
    // get data from cookies and populate local storage for clients
    // to be logged in coming from OS subdomains
    const client_accounts = Cookies.get('client.accounts');
    const active_loginid = Cookies.get('active_loginid');
    const active_wallet_loginid = Cookies.get('active_wallet_loginid');

    if (client_accounts && active_loginid) {
        localStorage.setItem('client.accounts', client_accounts);
        localStorage.setItem('active_loginid', active_loginid);
        localStorage.setItem('active_wallet_loginid', active_wallet_loginid);

        const domain = getDomainName();

        // remove cookies after populating local storage
        Cookies.remove('client.accounts', { domain, secure: true });
        Cookies.remove('active_loginid', { domain, secure: true });
        Cookies.remove('active_wallet_loginid', { domain, secure: true });

        if (url_params.get('action') === 'redirect') {
            window.location.href = window.location.origin + url_params.get('redirect_to');
        }

        window.location.reload();
    }

    const openLivechat = () => {
        Chat.open();
    };

    const action_param = url_params.get('action');
    const code_param = url_params.get('code') || verification_code[action_param];
    const ext_platform_url = url_params.get('ext_platform_url');

    const redirectToExternalPlatform = url => {
        history.push(`${routes.index}?ext_platform_url=${url}`);
        redirected_to_route = true;
    };
    setVerificationCode(code_param, action_param);
    setNewEmail(url_params.get('email'), action_param);

    switch (action_param) {
        case 'signup': {
            Analytics.trackEvent('ce_virtual_signup_form', {
                action: 'email_confirmed',
                form_name: is_mobile ? 'virtual_signup_web_mobile_default' : 'virtual_signup_web_desktop_default',
                email: url_params.get('email'),
            });
            if (url_params?.get('utm_content')) {
                SessionStore.set('show_book', url_params?.get('utm_content'));
            }
            SessionStore.set('signup_query_param', url_query_string);
            history.push({
                pathname: routes.onboarding,
                search: url_query_string,
            });
            SessionStore.remove('redirect_url');
            redirected_to_route = true;
            break;
        }
        case 'reset_password': {
            setPreventRedirectToHub(true);
            toggleResetPasswordModal(true);
            break;
        }
        case 'request_email': {
            if (!is_logging_in && !is_logged_in) {
                if (verification_code[action_param]) {
                    sessionStorage.setItem('request_email_code', verification_code[action_param]);
                }
                redirectToLogin();
                redirected_to_route = true;
            } else {
                if (!verification_code[action_param]) {
                    const request_email_code = sessionStorage.getItem('request_email_code');
                    setVerificationCode(request_email_code, action_param);
                    sessionStorage.removeItem('request_email_code');
                }
                setPreventRedirectToHub(true);
                toggleResetEmailModal(true);
            }
            break;
        }
        case 'social_email_change': {
            setPreventRedirectToHub(true);
            toggleResetPasswordModal(true);
            break;
        }
        case 'system_email_change': {
            setPreventRedirectToHub(true);
            toggleUpdateEmailModal(true);
            break;
        }
        case 'trading_platform_mt5_password_reset':
        case 'trading_platform_dxtrade_password_reset': {
            const reset_code_key = `${action_param}_code`;
            if (!is_logging_in && !is_logged_in) {
                if (verification_code[action_param]) {
                    sessionStorage.setItem(reset_code_key, verification_code[action_param]);
                }
                redirectToLogin();
                redirected_to_route = true;
                break;
            }
            if (!verification_code[action_param]) {
                const reset_code = sessionStorage.getItem(reset_code_key);
                setVerificationCode(reset_code, action_param);
                sessionStorage.removeItem(reset_code_key);
            }
            const redirect_to = url_params.get('redirect_to');

            if (redirect_to) {
                let pathname = '';
                let hash = '';
                switch (redirect_to) {
                    case '1':
                    case '2':
                        pathname = routes.index;
                        break;
                    case '10':
                    case '20':
                        pathname = routes.index;
                        hash = 'real';
                        break;
                    case '11':
                    case '21':
                        pathname = routes.index;
                        hash = 'demo';
                        break;
                    case '3':
                        pathname = routes.index;
                        break;
                    default:
                        break;
                }

                if (pathname) {
                    history.push({
                        pathname,
                        hash,
                        search: url_query_string,
                    });
                    redirected_to_route = true;
                }
            }
            setPreventRedirectToHub(true);
            setResetTradingPasswordModalOpen(true);
            break;
        }
        case 'phone_number_verification': {
            const phone_number_verification_code = `${action_param}_code`;
            if (!is_logging_in && !is_logged_in) {
                sessionStorage.setItem(phone_number_verification_code, code_param);
            }
            setRedirectFromEmail(true);
            history.push(routes.phone_verification);
            redirected_to_route = true;
            break;
        }
        case 'add_account': {
            WS.wait('get_account_status').then(() => {
                if (!currency) return openRealAccountSignup('set_currency');
                return openRealAccountSignup('svg');
            });
            if (ext_platform_url) redirectToExternalPlatform(ext_platform_url);
            break;
        }
        case 'add_account_multiplier': {
            WS.wait('get_account_status').then(() => {
                if (!currency) return openRealAccountSignup('set_currency');
                return openRealAccountSignup('maltainvest');
            });
            if (ext_platform_url) redirectToExternalPlatform(ext_platform_url);
            break;
        }
        case 'manage_account': {
            WS.wait('get_account_status').then(() => {
                return openRealAccountSignup('manage');
            });
            if (ext_platform_url) redirectToExternalPlatform(ext_platform_url);
            break;
        }
        case 'verification': {
            history.push(routes.index);
            redirected_to_route = true;
            break;
        }
        case 'trading_platform_investor_password_reset': {
            localStorage.setItem('cfd_reset_password_code', code_param);
            const is_demo = localStorage.getItem('cfd_reset_password_intent')?.includes('demo');
            if (has_wallet) {
                history.push({
                    pathname: routes.index,
                    search: url_query_string,
                });
            } else {
                history.push(`${routes.index}#${is_demo ? 'demo' : 'real'}#reset-password`);
            }
            redirected_to_route = true;
            break;
        }
        // P2P functionality has been removed
        case 'ctrader_account_transfer': {
            window.location.assign(`${getBrandUrl()}/transfer`);
            redirected_to_route = true;
            break;
        }
        case 'livechat': {
            openLivechat();
            break;
        }
        default:
            break;
    }

    useEffect(() => {
        const account_currency = url_params.get('account');
        setQueryCurrency(account_currency);
    }, []);

    useEffect(() => {
        const handleRedirect = () => {
            const account_currency = queryCurrency;
            if (!redirected_to_route && history.location.pathname !== routes.index && is_client_store_initialized) {
                const client_account_lists = JSON.parse(localStorage.getItem('client.accounts') || '{}');

                const route_mappings = [
                    { pattern: /accumulator/i, route: routes.index, type: 'accumulator' },
                    { pattern: /turbos/i, route: routes.index, type: 'turboslong' },
                    { pattern: /vanilla/i, route: routes.index, type: 'vanillalongcall' },
                    { pattern: /multiplier/i, route: routes.index, type: 'multiplier' },
                ];

                const default_route = routes.index;

                const matched_route = route_mappings.find(({ pattern }) =>
                    pattern.test(url_query_string || history.location.search)
                );

                let updated_search = url_query_string;
                const params = new URLSearchParams(url_query_string);
                params.set('account', queryCurrency);
                params.set('trade_type', matched_route?.type);
                if (matched_route && matched_route?.type) {
                    updated_search = `${params.toString()}`;
                }

                if (account_currency) {
                    let matching_loginid;

                    const converted_account_currency = account_currency.toUpperCase();

                    if (converted_account_currency === 'DEMO') {
                        matching_loginid = Object.keys(client_account_lists).find(loginid => /^VR/.test(loginid));
                    } else {
                        matching_loginid = Object.keys(client_account_lists).find(
                            loginid =>
                                client_account_lists[loginid].currency?.toUpperCase() === converted_account_currency &&
                                client_account_lists[loginid].account_category === 'trading' &&
                                !client_account_lists[loginid]?.is_virtual
                        );
                    }

                    if (matching_loginid && is_client_store_initialized) {
                        switchAccount(matching_loginid);
                        sessionStorage.setItem('active_loginid', matching_loginid);
                    }
                }

                sessionStorage.setItem(
                    'tradershub_redirect_to',
                    matched_route ? `redirect?${updated_search}` : default_route
                );
                history.push({
                    pathname: matched_route ? matched_route.route : default_route,
                    search: updated_search,
                });
            }
        };

        handleRedirect();
    }, [redirected_to_route, url_query_string, history, is_client_store_initialized, authorize_accounts_list]);

    return null;
});

Redirect.propTypes = {
    history: PropTypes.object,
};

export default withRouter(Redirect);
