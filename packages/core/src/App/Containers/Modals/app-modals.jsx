import React from 'react';
import { useLocation } from 'react-router-dom';

import { moduleLoader, SessionStore } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

const UrlUnavailableModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "url-unavailable-modal" */ '../UrlUnavailableModal'))
);

const RedirectToLoginModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "reset-password-modal" */ '../RedirectToLoginModal'))
);

const AppModals = observer(() => {
    const { ui } = useStore();
    const { isUrlUnavailableModalVisible } = ui;
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
        if (isUrlUnavailableModalVisible) {
            ComponentToLoad = <UrlUnavailableModal />;
        }
    }

    return <>{ComponentToLoad ? <React.Suspense fallback={<div />}>{ComponentToLoad}</React.Suspense> : null}</>;
});

export default AppModals;
