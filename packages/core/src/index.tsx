/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import ReactDOM from 'react-dom';
import React from 'react';
import 'promise-polyfill';
// eslint-disable-next-line
import registerServiceWorker from 'Utils/PWA';
import initStore from 'App/initStore';
import App from 'App/app.jsx';
import AppNotificationMessages from './App/Containers/app-notification-messages.jsx';
import { AnalyticsInitializer } from 'Utils/Analytics';

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

    const wrapper = document.getElementById('deriv_app');
    if (wrapper) {
        ReactDOM.render(<App root_store={root_store} />, wrapper);
    }
};

initApp();
