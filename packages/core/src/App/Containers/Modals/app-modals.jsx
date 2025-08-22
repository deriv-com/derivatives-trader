import React from 'react';
import { useLocation } from 'react-router-dom';

import { moduleLoader, SessionStore } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

import DerivRealAccountRequiredModal from 'App/Components/Elements/Modals/deriv-real-account-required-modal.jsx';

import ReadyToDepositModal from './ready-to-deposit-modal';

const UrlUnavailableModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "url-unavailable-modal" */ '../UrlUnavailableModal'))
);

const RedirectToLoginModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "reset-password-modal" */ '../RedirectToLoginModal'))
);

const AppModals = observer(() => {
    const { ui } = useStore();
    const { is_deriv_account_needed_modal_visible, is_ready_to_deposit_modal_visible, isUrlUnavailableModalVisible } =
        ui;
    const temp_session_signup_params = SessionStore.get('signup_query_param');
    const url_params = new URLSearchParams(useLocation().search || temp_session_signup_params);
    const url_action_param = url_params.get('action');

    let ComponentToLoad = null;
    switch (url_action_param) {
        case 'redirect_to_login':
            ComponentToLoad = <RedirectToLoginModal />;
            break;
        default:
            break;
    }
    if (!url_action_param) {
        if (is_deriv_account_needed_modal_visible) {
            ComponentToLoad = <DerivRealAccountRequiredModal />;
        } else if (isUrlUnavailableModalVisible) {
            ComponentToLoad = <UrlUnavailableModal />;
        }

        if (is_ready_to_deposit_modal_visible) {
            ComponentToLoad = <ReadyToDepositModal />;
        }
    }

    return <>{ComponentToLoad ? <React.Suspense fallback={<div />}>{ComponentToLoad}</React.Suspense> : null}</>;
});

export default AppModals;
