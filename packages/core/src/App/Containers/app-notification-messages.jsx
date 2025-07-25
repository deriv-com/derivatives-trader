import React from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { isMobile, routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

import {
    excluded_notifications,
    maintenance_notifications,
    priority_toast_messages,
} from '../../Stores/Helpers/client-notifications';
import Notification, {
    max_display_notifications,
    max_display_notifications_mobile,
} from '../Components/Elements/NotificationMessage';

import TradeNotifications from './trade-notifications';

import 'Sass/app/_common/components/app-notification-message.scss';

const Portal = ({ children }) =>
    isMobile() ? ReactDOM.createPortal(children, document.getElementById('deriv_app')) : children;

const NotificationsContent = ({
    is_notification_loaded,
    style,
    notifications,
    removeNotificationMessage,
    show_trade_notifications,
}) => {
    const { pathname } = useLocation();

    return (
        <div
            className={classNames('notification-messages', {
                'notification-messages--traders-hub': pathname === routes.trade,
            })}
            style={style}
        >
            <TransitionGroup component='div'>
                {notifications.map(notification => (
                    <CSSTransition
                        appear={!!is_notification_loaded}
                        key={notification.key}
                        in={!!notification.header}
                        timeout={150}
                        classNames={{
                            appear: 'notification--enter',
                            enter: 'notification--enter',
                            enterDone: 'notification--enter-done',
                            exit: 'notification--exit',
                        }}
                        unmountOnExit
                    >
                        <Notification data={notification} removeNotificationMessage={removeNotificationMessage} />
                    </CSSTransition>
                ))}
                <TradeNotifications show_trade_notifications={show_trade_notifications} />
            </TransitionGroup>
        </div>
    );
};

const AppNotificationMessages = observer(
    ({ is_notification_loaded, is_mt5, stopNotificationLoading, show_trade_notifications }) => {
        const { notifications } = useStore();
        const {
            marked_notifications,
            notification_messages,
            removeNotificationMessage,
            markNotificationMessage,
            should_show_popups,
        } = notifications;
        const [style, setStyle] = React.useState({});
        const [notifications_ref, setNotificationsRef] = React.useState(null);

        React.useEffect(() => {
            if (is_mt5) {
                stopNotificationLoading();
            }
            if (notifications_ref && isMobile()) {
                if (notifications_ref.parentElement !== null) {
                    const bounds = notifications_ref.parentElement.getBoundingClientRect();
                    setStyle({ top: bounds.top + 8 });
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [is_mt5, notifications_ref]);

        const notifications_msg = notification_messages.filter(message => {
            const is_not_marked_notification = !marked_notifications.includes(message.key);
            const is_non_hidden_notification = isMobile()
                ? [
                      ...maintenance_notifications,
                      'account_currency_closure',
                      'authenticate',
                      'deriv_go',
                      'document_needs_action',
                      'contract_sold',
                      'has_changed_two_fa',
                      'identity',
                      'install_pwa',
                      'need_fa',
                      'needs_poinc',
                      'notify_financial_assessment',
                      'phone_number_verification',
                      'poi_name_mismatch',
                      'poa_address_mismatch_failure',
                      'poa_address_mismatch_success',
                      'poa_address_mismatch_warning',
                      'poa_expired',
                      'poa_failed',
                      'poa_rejected_for_mt5',
                      'poa_verified',
                      'poi_expired',
                      'poi_failed',
                      'poi_verified',
                      'poinc_upload_limited',
                      'reaccept_tnc',
                      'resticted_mt5_with_failed_poa',
                      'resticted_mt5_with_pending_poa',
                      'svg_needs_poa',
                      'svg_needs_poi',
                      'svg_needs_poi_poa',
                      'svg_poi_expired',
                      'wallets_migrated',
                      'wallets_failed',
                      'tnc',
                      'trustpilot',
                      'unwelcome',
                      'update_fa_required',
                      'additional_kyc_info',
                      'notify_account_is_to_be_closed_by_residence',
                  ].includes(message.key)
                : true;

            const is_maintenance_notifications = maintenance_notifications.includes(message.key);

            return is_not_marked_notification && is_non_hidden_notification && is_maintenance_notifications;
        });

        const notifications_limit = isMobile() ? max_display_notifications_mobile : max_display_notifications;

        const filtered_excluded_notifications = notifications_msg.filter(message =>
            priority_toast_messages.includes(message.key) ? message : excluded_notifications.includes(message.key)
        );

        // Cashier functionality has been removed
        const notifications_sublist = filtered_excluded_notifications.slice(0, notifications_limit);

        if (!should_show_popups && !notifications_sublist.some(n => n.key === 'site_maintenance')) return null;

        return notifications_sublist.length ? (
            <div ref={ref => setNotificationsRef(ref)} className='notification-messages-bounds'>
                <Portal>
                    <NotificationsContent
                        notifications={notifications_sublist}
                        is_notification_loaded={is_notification_loaded}
                        style={style}
                        removeNotificationMessage={removeNotificationMessage}
                        markNotificationMessage={markNotificationMessage}
                        show_trade_notifications={show_trade_notifications}
                    />
                </Portal>
            </div>
        ) : (
            <TradeNotifications show_trade_notifications={show_trade_notifications} />
        );
    }
);

AppNotificationMessages.propTypes = {
    is_mt5: PropTypes.bool,
    is_notification_loaded: PropTypes.bool,
    stopNotificationLoading: PropTypes.func,
    show_trade_notifications: PropTypes.bool,
};

export default AppNotificationMessages;
