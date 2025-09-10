import { removeCookies } from '@deriv/shared';
import { Chat } from '@deriv/utils';

import WS from './ws-methods';

import SocketCache from '_common/base/socket_cache';

export const requestLogout = () => WS.logout().then(doLogout);

function endChat() {
    Chat.clear();
}

const doLogout = response => {
    if (response.logout !== 1) return undefined;
    removeCookies('affiliate_token', 'affiliate_tracking', 'onfido_token', 'gclid', 'utm_data');
    localStorage.removeItem('closed_toast_notifications');
    localStorage.removeItem('config.account1');
    localStorage.removeItem('config.tokens');
    localStorage.removeItem('verification_code.system_email_change');
    localStorage.removeItem('verification_code.request_email');
    localStorage.removeItem('new_email.system_email_change');
    // Clear V2 authentication session tokens
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_expiry');
    SocketCache.clear();
    Object.keys(sessionStorage)
        .filter(key => key !== 'trade_store')
        .forEach(key => sessionStorage.removeItem(key));
    endChat();
    return response;
};
