import { action, computed, makeObservable, observable, reaction } from 'mobx';

import { StaticUrl } from '@deriv/components';
import {
    checkServerMaintenance,
    extractInfoFromShortcode,
    getEndTime,
    getMarketName,
    getPathname,
    getStaticUrl,
    getTotalProfit,
    getTradeTypeName,
    getUrlBase,
    isHighLow,
    isMobile,
    isMultiplierContract,
    LocalStore,
    unique,
    getPlatformName,
} from '@deriv/shared';
import { Localize, localize } from '@deriv-com/translations';
import { Analytics } from '@deriv-com/analytics';

import { sortNotifications, sortNotificationsMobile } from '../App/Components/Elements/NotificationMessage/constants';

import { excluded_notifications } from './Helpers/client-notifications';
import BaseStore from './base-store';

export default class NotificationStore extends BaseStore {
    is_notifications_visible = false;
    notifications = [];
    notification_messages = [];
    marked_notifications = [];
    push_notifications = [];
    client_notifications = {};
    should_show_popups = true;
    trade_notifications = [];

    constructor(root_store) {
        super({ root_store });

        makeObservable(this, {
            addNotificationBar: action.bound,
            addNotificationMessage: action.bound,
            addNotificationMessageByKey: action.bound,
            addTradeNotification: action.bound,
            client_notifications: observable,
            filterNotificationMessages: action.bound,
            handleClientNotifications: action.bound,
            is_notifications_empty: computed,
            is_notifications_visible: observable,
            marked_notifications: observable,
            markNotificationMessage: action.bound,
            notification_messages: observable,
            notifications: observable,
            push_notifications: observable,
            refreshNotifications: action.bound,
            removeAllNotificationMessages: action.bound,
            removeNotificationByKey: action.bound,
            removeNotificationMessage: action.bound,
            removeNotificationMessageByKey: action.bound,
            removeNotifications: action.bound,
            removeTradeNotifications: action.bound,
            resetVirtualBalanceNotification: action.bound,
            setClientNotifications: action.bound,
            setShouldShowPopups: action.bound,
            should_show_popups: observable,
            toggleNotificationsModal: action.bound,
            trade_notifications: observable,
            unmarkNotificationMessage: action.bound,
            updateNotifications: action.bound,
        });

        reaction(
            () => root_store.common.app_routing_history.map(i => i.pathname),
            () => {
                this.filterNotificationMessages();
                this.marked_notifications = JSON.parse(LocalStore.get('marked_notifications') || '[]');
            }
        );
        reaction(
            () => [root_store.common?.selected_contract_type, root_store.client.is_eu, root_store.client.is_logged_in],
            () => {
                this.removeNotifications();
                this.removeAllNotificationMessages();
                this.setClientNotifications();
                this.handleClientNotifications();
                this.filterNotificationMessages();
                this.checkNotificationMessages();
            }
        );
    }

    get is_notifications_empty() {
        return !this.notifications.length;
    }

    addNotificationBar(message) {
        this.push_notifications.push(message);
        this.push_notifications = unique(this.push_notifications, 'msg_type');
    }

    addNotificationMessage(notification) {
        if (!notification) return;
        if (!this.notification_messages.find(item => item.key === notification.key)) {
            // Remove notification messages if it was already closed by user and exists in LocalStore
            const active_loginid = LocalStore.get('active_loginid');
            const messages = LocalStore.getObject('notification_messages');

            if (active_loginid) {
                // Check if is existing message to remove already closed messages stored in LocalStore
                const is_existing_message = Array.isArray(messages[active_loginid])
                    ? messages[active_loginid].includes(notification.key)
                    : false;

                if (is_existing_message) {
                    this.markNotificationMessage({ key: notification.key });
                    return;
                }

                const sortFn = isMobile() ? sortNotificationsMobile : sortNotifications;
                this.notification_messages = [...this.notification_messages, notification].sort(sortFn);

                if (
                    ['svg'].some(key => notification.key?.includes(key)) ||
                    (excluded_notifications && !excluded_notifications.includes(notification.key))
                ) {
                    this.updateNotifications();
                }
            }
        }
    }

    addNotificationMessageByKey(key) {
        if (key) this.addNotificationMessage(this.client_notifications[key]);
    }

    addTradeNotification(contract_info) {
        if (!contract_info) return;
        const {
            buy_price,
            contract_id,
            contract_type,
            currency,
            profit,
            purchase_time,
            shortcode,
            status,
            underlying,
        } = contract_info;
        const id = `${contract_id}_${status}`;
        if (this.trade_notifications.some(({ id: notification_id }) => notification_id === id)) return;
        const contract_main_title = getTradeTypeName(contract_type, {
            isHighLow: isHighLow({ shortcode }),
            showMainTitle: true,
        });
        this.trade_notifications.push({
            id,
            buy_price,
            contract_id,
            contract_type: `${contract_main_title} ${getTradeTypeName(contract_type, {
                isHighLow: isHighLow({ shortcode }),
            })}`.trim(),
            currency,
            profit: isMultiplierContract(contract_type) && !isNaN(profit) ? getTotalProfit(contract_info) : profit,
            status,
            // Backward compatibility: fallback to old field name
            symbol: getMarketName(
                (contract_info.underlying_symbol || underlying) ?? extractInfoFromShortcode(shortcode).underlying
            ),
            timestamp: status === 'open' ? purchase_time : getEndTime(contract_info),
        });
        /* Consider notifications older than 100s ago as stale and filter out such trade_notifications from the array
           in order to protect RAM in case there are too many notifications coming at once. */
        const hundred_sec_ago = Math.floor(Date.now() / 1000) - 100;
        this.trade_notifications = this.trade_notifications.filter(({ timestamp }) => timestamp > hundred_sec_ago);
    }

    filterNotificationMessages() {
        if (LocalStore.get('active_loginid') !== 'null')
            this.resetVirtualBalanceNotification(LocalStore.get('active_loginid'));

        this.notification_messages = this.notification_messages.filter(notification => {
            if (notification.platform === undefined || notification.platform.includes(getPathname())) {
                return true;
            } else if (!notification.platform.includes(getPathname())) {
                if (notification.is_disposable) {
                    this.removeNotificationMessage({
                        key: notification.key,
                        should_show_again: notification.should_show_again,
                    });
                    this.removeNotificationByKey({ key: notification.key });
                }
            }

            return false;
        });
    }

    // check for the already added keys in the notification_messages and don't display those notifications
    checkNotificationMessages() {
        const notifications_list = LocalStore.getObject('notification_messages');
        const { loginid } = this.root_store.client;
        const refined_list = notifications_list[loginid] ? Object.values(notifications_list[loginid]) : [];
        if (refined_list.length) {
            refined_list.map(refined => {
                this.removeNotificationByKey({ key: refined });
            });
        }
    }

    async handleClientNotifications() {
        const { is_eu, is_logged_in, website_status } = this.root_store.client;
        const { current_language, selected_contract_type } = this.root_store.common;

        const is_server_down = checkServerMaintenance(website_status);

        if (website_status?.message?.length || is_server_down) {
            this.addNotificationMessage(this.client_notifications.site_maintenance);
        } else {
            this.removeNotificationByKey({ key: this.client_notifications.site_maintenance });
        }

        if (!is_eu && isMultiplierContract(selected_contract_type) && current_language === 'EN' && is_logged_in) {
            this.addNotificationMessage(this.client_notifications.deriv_go);
        } else {
            this.removeNotificationMessageByKey({ key: this.client_notifications.deriv_go?.key });
        }
    }

    markNotificationMessage({ key }) {
        if (!this.marked_notifications.includes(key)) {
            this.marked_notifications.push(key);
            LocalStore.set('marked_notifications', JSON.stringify(this.marked_notifications));
        }
    }

    refreshNotifications() {
        this.removeNotifications(true);
        this.removeAllNotificationMessages();
        this.setClientNotifications();
        this.handleClientNotifications();
    }

    removeAllNotificationMessages(should_close_persistent = false) {
        this.notification_messages = should_close_persistent
            ? []
            : [...this.notification_messages.filter(notifs => notifs.is_persistent)];
    }

    removeNotifications(should_close_persistent) {
        this.notifications = should_close_persistent
            ? []
            : [...this.notifications.filter(notifs => notifs.is_persistent)];
    }

    removeTradeNotifications(id) {
        this.trade_notifications = id ? this.trade_notifications.filter(item => item.id !== id) : [];
    }

    removeNotificationByKey({ key }) {
        this.notifications = this.notifications.filter(n => n.key !== key);
    }

    removeNotificationMessage({ key, should_show_again } = {}) {
        if (!key) return;
        this.notification_messages = this.notification_messages.filter(n => n.key !== key);
        // Add notification messages to LocalStore when user closes, check for redundancy
        const active_loginid = LocalStore.get('active_loginid');
        if (!excluded_notifications.includes(key) && !key.startsWith('p2p_order') && active_loginid) {
            let messages = LocalStore.getObject('notification_messages');
            // Check if same message already exists in LocalStore for this account
            if (messages[active_loginid] && messages[active_loginid].includes(key)) {
                return;
            }
            const getCurrentMessage = () => {
                if (Array.isArray(messages[active_loginid])) {
                    messages[active_loginid].push(key);
                    return messages[active_loginid];
                }
                return [key];
            };
            if (!should_show_again) {
                // Store message into LocalStore upon closing message
                messages = { ...messages, [active_loginid]: getCurrentMessage() };
                LocalStore.setObject('notification_messages', messages);
            }
        }
    }

    removeNotificationMessageByKey({ key }) {
        this.notification_messages = this.notification_messages.filter(n => n.key !== key);
    }

    resetVirtualBalanceNotification(loginid) {
        const { current_account, is_logged_in } = this.root_store.client;
        if (!is_logged_in) return;
        if (!current_account?.is_virtual || current_account?.loginid !== loginid) return;
        const min_reset_limit = 1000;
        const max_reset_limit = 999000;
        const balance = parseInt(current_account?.balance);

        // Display notification message to user with virtual account to reset their balance
        // if the balance is less than equals to 1000 or more than equals to 999000
        if (balance <= min_reset_limit || balance >= max_reset_limit) {
            let message = localize(
                'Your demo account balance is low. Reset your balance to continue trading from your demo account.'
            );
            if (balance >= max_reset_limit)
                message = localize(
                    'Your demo account balance has reached the maximum limit, and you will not be able to place new trades. Reset your balance to continue trading from your demo account.'
                );
            this.setClientNotifications({ resetVirtualBalance: this.root_store.client.resetVirtualBalance, message });
            this.addNotificationMessage(this.client_notifications.reset_virtual_balance);
        } else {
            this.removeNotificationByKey({ key: 'reset_virtual_balance' });
            this.removeNotificationMessage({ key: 'reset_virtual_balance', should_show_again: true });
        }
    }

    setClientNotifications(client_data = {}) {
        const { ui } = this.root_store;

        const platform_name_trader = getPlatformName();
        // TODO: Add mobile application name in brand config
        const platform_name_go = 'Deriv GO';

        const notifications = {
            trustpilot: {
                key: 'trustpilot',
                header: localize('Enjoy using Deriv?'),
                header_popup: localize('We’d love to hear your thoughts'),
                message: localize('Drop your review on Trustpilot.'),
                message_popup: localize('Drop your review on Trustpilot.'),
                action: {
                    onClick: () => {
                        window.open('https://www.trustpilot.com/review/deriv.com', '_blank');
                        this.markNotificationMessage({ key: this.client_notifications.trustpilot.key });
                        this.removeNotificationByKey({
                            key: this.client_notifications.trustpilot.key,
                        });
                        this.removeNotificationMessage({
                            key: this.client_notifications.trustpilot.key,
                            should_show_again: false,
                        });
                    },
                    children: (
                        <div
                            className='trustpilot-widget'
                            data-locale='en-US'
                            data-template-id='56278e9abfbbba0bdcd568bc'
                            data-businessunit-id='5ed4c8a9f74f310001f51bf7'
                            data-style-height='52px'
                            data-style-width='100%'
                        >
                            <a
                                href='https://www.trustpilot.com/review/deriv.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => {
                                    this.markNotificationMessage({ key: this.client_notifications.trustpilot.key });
                                    this.removeNotificationByKey({
                                        key: this.client_notifications.trustpilot.key,
                                    });
                                    this.removeNotificationMessage({
                                        key: this.client_notifications.trustpilot.key,
                                        should_show_again: false,
                                    });
                                }}
                            >
                                {localize('Go to Trustpilot')}
                            </a>
                        </div>
                    ),
                    text: localize('Go to Trustpilot'),
                },
                img_src: getUrlBase('/public/images/common/trustpilot_banner.png'),
                img_alt: 'Trustpilot',
                className: 'trustpilot',
                type: 'trustpilot',
            },
            install_pwa: {
                key: 'install_pwa',
                action: {
                    onClick: () => ui.installWithDeferredPrompt(),
                    text: localize('Install'),
                },
                header: localize('Install the {{platform_name_trader}} web app', { platform_name_trader }),
                message: localize('Launch {{platform_name_trader}} in seconds the next time you want to trade.', {
                    platform_name_trader,
                }),
                type: 'announce',
                should_hide_close_btn: false,
            },
            is_virtual: {
                key: 'is_virtual',
                header: localize('You are on your demo account'),
                message: localize('Please switch to your real account or create one to access the cashier.'),
                type: 'warning',
            },
            new_version_available: {
                action: {
                    onClick: () => window.location.reload(),
                    text: localize('Refresh now'),
                },
                key: 'new_version_available',
                header: localize('A new version of Deriv is available'),
                message: localize('This page will automatically refresh in 5 minutes to load the latest version.'),
                type: 'warning',
                should_hide_close_btn: true,
                timeout: 300000,
                timeoutMessage: remaining => localize('Auto update in {{ remaining }} seconds', { remaining }),
            },
            reset_virtual_balance: {
                key: 'reset_virtual_balance',
                header: localize('Reset your balance'),
                message: client_data.message,
                type: 'info',
                is_persistent: true,
                should_show_again: true,
                is_disposable: true,
                action: {
                    text: localize('Reset balance'),
                    onClick: async () => {
                        await client_data.resetVirtualBalance();
                    },
                },
            },
            deriv_go: {
                key: 'deriv_go',
                header: <Localize i18n_default_text='Trade on the go' />,
                message: (
                    <Localize
                        i18n_default_text='Get a faster mobile trading experience with the <0>{{platform_name_go}}</0> app!'
                        components={[<StaticUrl key={0} className='link dark' href='/landing/deriv-go' />]}
                        values={{ platform_name_go }}
                    />
                ),
                cta_btn: {
                    text: localize('Learn more'),
                    onClick: () => {
                        window.open(getStaticUrl('/landing/deriv-go'), '_blank');
                    },
                },
                img_src: getUrlBase('/public/images/common/derivgo_banner.png'),
                img_alt: 'deriv_go',
                type: 'promotions',
            },
            site_maintenance: {
                key: 'site_maintenance',
                header: localize('We’re updating our site'),
                message: localize('Some services may be temporarily unavailable.'),
                type: 'warning',
                should_show_again: true,
                closeOnClick: notification_obj => this.markNotificationMessage({ key: notification_obj.key }),
            },
            you_are_offline: {
                key: 'you_are_offline',
                header: localize('You are offline'),
                message: <Localize i18n_default_text='Check your connection.' />,
                type: 'danger',
            },
        };

        this.client_notifications = notifications;
    }

    setShouldShowPopups(should_show_popups) {
        this.should_show_popups = should_show_popups;
    }

    toggleNotificationsModal() {
        Analytics.trackEvent('ce_notification_form', {
            action: this.is_notifications_visible ? 'close' : 'open',
            form_name: 'ce_notification_form',
            notification_num: this.notifications.length,
        });

        this.is_notifications_visible = !this.is_notifications_visible;
    }

    unmarkNotificationMessage({ key }) {
        this.marked_notifications = this.marked_notifications.filter(item => key !== item);
    }

    updateNotifications() {
        this.notifications = this.notification_messages.filter(message =>
            ['svg'].some(key => message.key?.includes(key))
                ? message
                : excluded_notifications && !excluded_notifications.includes(message.key)
        );
    }
}
