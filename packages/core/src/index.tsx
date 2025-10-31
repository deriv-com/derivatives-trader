/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import React from 'react';
import ReactDOM from 'react-dom';

import App from 'App/app.jsx';
import initStore from 'App/initStore';
import { AnalyticsInitializer } from 'Utils/Analytics';
// eslint-disable-next-line
import registerServiceWorker from 'Utils/PWA';

import AppNotificationMessages from './App/Containers/app-notification-messages.jsx';

import 'promise-polyfill';

AnalyticsInitializer();
if (
    !!window?.localStorage.getItem?.('debug_service_worker') || // To enable local service worker related development
    !window.location.hostname.startsWith('localhost')
) {
    registerServiceWorker();
}

const initApp = async () => {
    // For simplified authentication, we don't need to pass accounts to initStore
    // The authentication will be handled by temp-auth.js and client-store.js
    const root_store = initStore(AppNotificationMessages);

    const wrapper = document.getElementById('derivatives_trader');
    if (wrapper) {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(<App root_store={root_store} />, wrapper);
    }
};

initApp();
